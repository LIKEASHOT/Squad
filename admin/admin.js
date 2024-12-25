let token = localStorage.getItem('adminToken');
let currentTable = '';
let tableStructure = null;

// 修改API基础URL为实际的服务器地址
// const API_BASE_URL = 'http://localhost:5001';  // 如果在本地测试
// 或者
const API_BASE_URL = 'http://121.37.195.13:5001';  // 如果是远程服务器

// 检查登录状态
function checkAuth() {
    if (!token) {
        window.location.href = 'login.html';
    }
}

// 加载表列表
async function loadTables() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/tables`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.status === 401) {
            localStorage.removeItem('adminToken');
            window.location.href = 'login.html';
            return;
        }
        
        const tables = await response.json();
        const tableList = document.getElementById('tableList');
        
        tableList.innerHTML = tables.map(table => `
            <li class="nav-item">
                <a class="nav-link" href="#" onclick="showTable('${table}')">
                    ${table}
                </a>
            </li>
        `).join('');
    } catch (error) {
        console.error('Error:', error);
        alert('加载表列表失败');
    }
}

// 显示表数据
async function showTable(tableName) {
    currentTable = tableName;
    document.getElementById('pageTitle').textContent = tableName + ' 管理';
    
    try {
        // 获取表结构和数据
        const [structureResponse, dataResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/admin/tables/${tableName}/structure`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch(`${API_BASE_URL}/admin/tables/${tableName}/data`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
        ]);

        tableStructure = await structureResponse.json();
        const data = await dataResponse.json();
        
        // 生成表格
        const content = document.getElementById('content');
        content.innerHTML = `
            <div class="search-section">
                <div class="top-actions">
                    <h5 class="mb-0">数据筛选</h5>
                    <button class="btn-add" onclick="showAddForm()">
                        <i class="bx bx-plus"></i>
                        <span>添加数据</span>
                    </button>
                </div>
                <div class="filter-section">
                    <div class="filter-tags">
                        ${tableStructure.map(field => `
                            <div class="filter-tag" 
                                 data-field="${field.Field}"
                                 onclick="toggleFilter(this)">
                                <i class="bx bx-check"></i>
                                <span>${field.Field}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="search-input-container">
                        <i class="bx bx-search search-icon"></i>
                        <input type="text" 
                               class="search-input" 
                               placeholder="搜索..." 
                               onkeyup="filterTable(this.value)">
                    </div>
                </div>
            </div>
            <div class="table-container">
                <div class="table-wrapper">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                ${tableStructure.map(field => `
                                    <th>
                                        <div class="th-content">
                                            <span class="th-text">${field.Field}</span>
                                            <i class="bx bx-sort-alt-2" onclick="sortTable('${field.Field}')"></i>
                                        </div>
                                    </th>
                                `).join('')}
                                <th class="action-column">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.map((row, index) => `
                                <tr class="fade-in" style="animation-delay: ${index * 0.05}s">
                                    ${tableStructure.map(field => `
                                        <td>
                                            <div class="td-content" title="${formatValue(row[field.Field])}">
                                                ${formatValue(row[field.Field])}
                                            </div>
                                        </td>
                                    `).join('')}
                                    <td class="action-column">
                                        <div class="action-buttons">
                                            <button class="btn btn-sm btn-outline-primary" onclick="editData(${row.id})">
                                                <i class="bx bx-edit-alt"></i>
                                            </button>
                                            <button class="btn btn-sm btn-outline-danger" onclick="deleteData(${row.id})">
                                                <i class="bx bx-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error:', error);
        showError('加载数据失败');
    }
}

// 改进格式化函数，处理更多数据类型
function formatValue(value) {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? '是' : '否';
    
    // 处理日期时间
    if (value instanceof Date || (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/))) {
        return new Date(value).toLocaleString('zh-CN');
    }
    
    // 处理时间间隔
    if (typeof value === 'string' && value.includes(':')) {
        return value;
    }
    
    // 处理JSON对象
    if (typeof value === 'object') {
        try {
            return JSON.stringify(value, null, 2);
        } catch (e) {
            return String(value);
        }
    }
    
    return String(value);
}

// 修改排序功能
function sortTable(column) {
    const tbody = document.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const columnIndex = getColumnIndex(column);
    
    // 获取当前排序方向
    const currentDir = tbody.getAttribute('data-sort-dir') || 'asc';
    const newDir = currentDir === 'asc' ? 'desc' : 'asc';
    tbody.setAttribute('data-sort-dir', newDir);

    // 更新所有排序图标
    document.querySelectorAll('.bx-sort-alt-2').forEach(icon => {
        icon.classList.remove('text-primary');
    });
    // 高亮当前排序列的图标
    event.target.classList.add('text-primary');

    const sortedRows = rows.sort((a, b) => {
        const aVal = a.children[columnIndex].textContent.trim();
        const bVal = b.children[columnIndex].textContent.trim();
        
        // 检查是否为数字
        const aNum = parseFloat(aVal);
        const bNum = parseFloat(bVal);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
            return newDir === 'asc' ? aNum - bNum : bNum - aNum;
        }
        
        // 日期比较
        const aDate = new Date(aVal);
        const bDate = new Date(bVal);
        if (aDate.toString() !== 'Invalid Date' && bDate.toString() !== 'Invalid Date') {
            return newDir === 'asc' ? aDate - bDate : bDate - aDate;
        }
        
        // 字符串比较
        return newDir === 'asc' 
            ? aVal.localeCompare(bVal, 'zh-CN') 
            : bVal.localeCompare(aVal, 'zh-CN');
    });

    // 清空并重新填充表格
    tbody.innerHTML = '';
    sortedRows.forEach((row, index) => {
        row.classList.add('fade-in');
        row.style.animationDelay = `${index * 0.05}s`;
        tbody.appendChild(row);
    });
}

// 获取列索引
function getColumnIndex(columnName) {
    const headers = document.querySelectorAll('thead th');
    for (let i = 0; i < headers.length; i++) {
        if (headers[i].textContent.trim().includes(columnName)) {
            return i;
        }
    }
    return 0;
}

// 改进搜索功能
function filterTable(query) {
    query = query.toLowerCase().trim();
    const rows = document.querySelectorAll('tbody tr');
    let hasResults = false;

    // 获取选中的过滤器
    const selectedFields = Array.from(document.querySelectorAll('.filter-tag.active'))
        .map(tag => tag.dataset.field);

    // 如果没有选中的过滤器，默认选择所有字段
    const fieldsToSearch = selectedFields.length > 0 ? selectedFields : 
        tableStructure.map(field => field.Field);

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        let match = false;

        fieldsToSearch.forEach(field => {
            const cellIndex = tableStructure.findIndex(f => f.Field === field);
            if (cellIndex >= 0) {
                const cellText = cells[cellIndex].textContent.toLowerCase().trim();
                if (cellText.includes(query)) {
                    match = true;
                }
            }
        });

        row.style.display = match || query === '' ? '' : 'none';
        if (match || query === '') {
            hasResults = true;
            row.classList.add('fade-in');
        } else {
            row.classList.remove('fade-in');
        }
    });

    updateNoResultsMessage(hasResults, query, fieldsToSearch);
}

// 更新无结果提示
function updateNoResultsMessage(hasResults, query, fieldsToSearch) {
    const container = document.querySelector('.table-container');
    let noResultsMsg = document.getElementById('noResultsMessage');
    
    if (!hasResults && query !== '') {
        if (!noResultsMsg) {
            noResultsMsg = document.createElement('div');
            noResultsMsg.id = 'noResultsMessage';
            noResultsMsg.className = 'alert alert-info mt-3';
            container.appendChild(noResultsMsg);
        }
        const selectedFields = Array.from(document.querySelectorAll('.filter-tag.active'))
            .map(tag => tag.dataset.field)
            .join(', ');
        noResultsMsg.textContent = `在 ${selectedFields} 中没有找到包含 "${query}" 的数据`;
    } else if (noResultsMsg) {
        noResultsMsg.remove();
    }
}

// 显示错误消息
function showError(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-danger alert-dismissible fade show';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.getElementById('content').prepend(alert);
}

// 修改显示添加表单的函数
async function showAddForm() {
    const form = document.getElementById('editForm');
    
    // 如果是 challenges 表，先获取所有用户列表
    let users = [];
    if (currentTable === 'challenges') {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/tables/users/data`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            users = await response.json();
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    }

    form.innerHTML = tableStructure.map(field => {
        const inputType = getInputType(field);
        const isDisabled = field.Field === 'id';
        const isRequired = !field.Null || field.Key === 'PRI';
        
        // 特殊处理 TIMESTAMP 类型的默认值字段
        if (field.Type.toLowerCase().includes('timestamp') && 
            field.Default === 'CURRENT_TIMESTAMP') {
            return ''; // 跳过自动生成的时间戳字段
        }

        // 处理 ENUM 类型
        if (field.Type.toLowerCase().startsWith('enum')) {
            const options = field.Type.match(/'([^']+)'/g).map(opt => opt.replace(/'/g, ''));
            return `
                <div class="mb-3">
                    <label class="form-label">${field.Field}</label>
                    <select class="form-control" name="${field.Field}" ${isDisabled ? 'disabled' : ''} ${isRequired ? 'required' : ''}>
                        <option value="">请选择</option>
                        ${options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                    </select>
                </div>
            `;
        }

        // 特殊处理 challenges 表的用户ID字段
        if (currentTable === 'challenges' && (field.Field === 'challenger_id' || field.Field === 'challenged_id')) {
            return `
                <div class="mb-3">
                    <label class="form-label">${field.Field === 'challenger_id' ? '请者' : '接受者'}</label>
                    <select class="form-control" name="${field.Field}" ${isRequired ? 'required' : ''}>
                        <option value="">请选择用户</option>
                        ${users.map(user => `
                            <option value="${user.id}">${user.name} (ID: ${user.id})</option>
                        `).join('')}
                    </select>
                </div>
            `;
        }

        // 处理其他外���关联
        if (field.Field.endsWith('_id') && !field.Field.startsWith('invitation')) {
            return `
                <div class="mb-3">
                    <label class="form-label">${field.Field}</label>
                    <input type="number" class="form-control" name="${field.Field}"
                           ${isDisabled ? 'disabled' : ''} ${isRequired ? 'required' : ''}>
                    <small class="text-muted">请输入有效的ID值</small>
                </div>
            `;
        }

        // 特殊处理 challenges 表的其他字段
        if (currentTable === 'challenges') {
            if (field.Field === 'start_time') {
                return `
                    <div class="mb-3">
                        <label class="form-label">开始时间</label>
                        <input type="datetime-local" class="form-control" name="${field.Field}"
                               ${isRequired ? 'required' : ''}>
                    </div>
                `;
            }
            if (field.Field === 'duration') {
                return `
                    <div class="mb-3">
                        <label class="form-label">持续时间（天）</label>
                        <input type="number" class="form-control" name="${field.Field}"
                               min="1" value="7" ${isRequired ? 'required' : ''}>
                    </div>
                `;
            }
        }

        return `
            <div class="mb-3">
                <label class="form-label">${field.Field}</label>
                <input type="${inputType}" class="form-control" name="${field.Field}"
                       ${isDisabled ? 'disabled' : ''} ${isRequired ? 'required' : ''}>
                ${field.Comment ? `<small class="text-muted">${field.Comment}</small>` : ''}
            </div>
        `;
    }).filter(Boolean).join('');
    
    new bootstrap.Modal(document.getElementById('editModal')).show();
}

// 修改编辑数据函数
async function editData(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/tables/${currentTable}/data/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        
        const data = await response.json();
        const form = document.getElementById('editForm');
        
        form.innerHTML = tableStructure.map(field => {
            const value = data[field.Field] !== null ? data[field.Field] : '';
            const isDisabled = field.Field === 'id';
            const inputType = getInputType(field);
            
            if (inputType === 'textarea') {
                return `
                    <div class="mb-3">
                        <label class="form-label">${field.Field}</label>
                        <textarea class="form-control" name="${field.Field}" 
                                rows="3" ${isDisabled ? 'disabled' : ''}>${value}</textarea>
                    </div>
                `;
            }
            
            return `
                <div class="mb-3">
                    <label class="form-label">${field.Field}</label>
                    <input type="${inputType}" 
                           class="form-control" 
                           name="${field.Field}"
                           value="${value}"
                           ${isDisabled ? 'disabled' : ''}>
                </div>
            `;
        }).join('');
        
        form.dataset.id = id;
        new bootstrap.Modal(document.getElementById('editModal')).show();
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: '加载失败',
            text: '无法加载数据，请稍后重试'
        });
    }
}

// 改进保存功能
async function saveChanges() {
    const form = document.getElementById('editForm');
    const formData = {};
    const formElements = form.elements;
    
    try {
        for (let element of formElements) {
            if (element.name && element.name !== 'id') {
                // 跳过空值，除非字段是必需的
                if (element.value === '' && !element.required) {
                    continue;
                }
                
                // 处理特殊字段
                if (currentTable === 'challenges') {
                    if (element.name === 'start_time') {
                        // 转换datetime-local为时间戳
                        formData[element.name] = Math.floor(new Date(element.value).getTime() / 1000);
                        continue;
                    }
                    if (element.name === 'invitation_id' && !element.value) {
                        formData[element.name] = 0;
                        continue;
                    }
                    if (element.name === 'status' && !element.value) {
                        formData[element.name] = 'active';
                        continue;
                    }
                }
                
                // 处理数字类型
                if (element.type === 'number' || element.name.endsWith('_id')) {
                    formData[element.name] = element.value ? Number(element.value) : null;
                } else {
                    formData[element.name] = element.value;
                }
            }
        }

        const id = form.dataset.id;
        const method = id ? 'PUT' : 'POST';
        const url = id 
            ? `${API_BASE_URL}/admin/tables/${currentTable}/data/${id}`
            : `${API_BASE_URL}/admin/tables/${currentTable}/data`;
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
            showTable(currentTable);
            Swal.fire('成功', '数据已保存', 'success');
        } else {
            throw new Error(result.message || '保存失败');
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: '保存失败',
            text: error.message || '请检查数据格式是否正确',
            footer: '如果问题持续，请联系管理员'
        });
    }
}

// 删除数据
async function deleteData(id) {
    const result = await Swal.fire({
        title: '确认删除',
        text: '此操作不可撤销，是否继续？',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        confirmButtonColor: '#dc3545',
    });

    if (result.isConfirmed) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/tables/${currentTable}/data/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) throw new Error('删除失败');
            
            Swal.fire('成功', '数据已删除', 'success');
            showTable(currentTable);
        } catch (error) {
            console.error('Error:', error);
            Swal.fire('错误', '删除失败', 'error');
        }
    }
}

// 添加退出功能
function logout() {
    localStorage.removeItem('adminToken');
    window.location.href = 'login.html';
}

// 显示当前用户信息
function showCurrentUser() {
    const token = localStorage.getItem('adminToken');
    if (token) {
        try {
            // 解JWT token（取payload部分）
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentUser = document.getElementById('currentUser');
            if (currentUser) {
                currentUser.textContent = `当前用户: ${payload.username}`;
            }
        } catch (e) {
            console.error('Error parsing token:', e);
        }
    }
}

// 修改页面加载初始化函数
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadTables();
    showCurrentUser();  // 添加显示当前用户信息
}); 

// 类型判断
function getInputType(field) {
    const type = field.Type.toLowerCase();
    if (type.includes('int')) return 'number';
    if (type.includes('date')) return 'date';
    if (type.includes('datetime')) return 'datetime-local';
    if (type.includes('time')) return 'time';
    if (type.includes('text') || type.includes('json')) return 'textarea';
    if (type.includes('tinyint(1)')) return 'checkbox';
    return 'text';
} 

// 添加切换过滤器的函数
function toggleFilter(element) {
    element.classList.toggle('active');
    // 更新搜索结果
    const searchInput = document.querySelector('.search-input');
    filterTable(searchInput.value);
} 

// 在 showTable 函数末尾添加
function checkFilterOverflow() {
    const filterSection = document.querySelector('.filter-section');
    if (filterSection) {
        // 检查是否有横向滚动
        const hasOverflow = filterSection.scrollWidth > filterSection.clientWidth;
        filterSection.classList.toggle('has-overflow', hasOverflow);
        
        // 添加滚动时的阴影效果
        filterSection.addEventListener('scroll', () => {
            const isAtEnd = filterSection.scrollLeft + filterSection.clientWidth >= filterSection.scrollWidth;
            filterSection.classList.toggle('has-overflow', !isAtEnd);
        });
    }
}

// 在显示表格后调用
showTable(tableName).then(() => {
    checkFilterOverflow();
});

// 监听窗口大小变化
window.addEventListener('resize', checkFilterOverflow); 