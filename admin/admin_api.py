# python -m http.server 8000
# python admin_api.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import pymysql
from functools import wraps
import jwt
import datetime
from datetime import UTC, timedelta
import json
import time
from functools import wraps
import pymysql.cursors

# 自定义JSON编码器
class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (datetime.time, datetime.datetime, datetime.date)):
            return obj.isoformat()
        if isinstance(obj, timedelta):
            return str(obj)
        if isinstance(obj, bytes):
            return obj.decode('utf-8')
        return super().default(obj)

app = Flask(__name__)
# 设置自定义JSON编码器
app.json_encoder = CustomJSONEncoder
CORS(app, resources={r"/*": {"origins": "*"}})
app.config['SECRET_KEY'] = 'your-secret-key'

# 数据库配置
DB_CONFIG = {
    'host': 'localhost',
    'user': 'sport_admin',
    'password': 'Aa@123456789',
    'db': 'Squad_db',
    'charset': 'utf8mb4'
}

# 添加数据库重连装饰器
def with_db_reconnect(max_retries=3, delay=1):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            retries = 0
            while retries < max_retries:
                try:
                    return func(*args, **kwargs)
                except pymysql.Error as e:
                    retries += 1
                    print(f"数据库连接错误: {str(e)}, 正在进行第 {retries} 次重试...")
                    if retries == max_retries:
                        raise
                    time.sleep(delay)
                    # 重新初始化数据库连接
                    global db_connection
                    try:
                        db_connection = get_db_connection()
                    except:
                        continue
        return wrapper
    return decorator

# 修改数据库连接函数
def get_db_connection():
    try:
        connection = pymysql.connect(
            **DB_CONFIG,
            connect_timeout=5,  # 添加连接超时
            read_timeout=30,    # 添加读取超时
            write_timeout=30    # 添加写入超时
        )
        # 设置自动重连
        connection.ping(reconnect=True)
        return connection
    except pymysql.Error as e:
        print(f"数据库连接失败: {str(e)}")
        raise

# JWT验证装饰器
def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': '没有提供token'}), 401
        try:
            token = token.split(' ')[1]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            if data['permission'] > 1:  # 修改权限判断，只允许权限为0或1的用户访问
                return jsonify({'message': '权限不足'}), 403
        except:
            return jsonify({'message': '无效的token'}), 401
        return f(*args, **kwargs)
    return decorated

# 登录口
@app.route('/admin/login', methods=['POST'])
@with_db_reconnect()
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    print(f"尝试登录: name={username}, password={password}")  # 添加调试日志
    
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    
    try:
        # 修改SQL查询，使用name字段而不是username，并且修改权限判断
        sql = "SELECT id, name, permission FROM users WHERE name = %s AND password = %s"
        cursor.execute(sql, (username, password))
        
        print(f"执行SQL查询: SELECT id, name FROM users WHERE name = '{username}'")
        
        user = cursor.fetchone()
        print(f"查询结果: {user}")  # 添加调试日志
        if(user['permission'] > 1):
            return jsonify({'message': '权限不足'}), 403    
        if user:
            payload = {
                'user_id': user['id'],
                'username': user['name'],
                'permission': user['permission'],
                'exp': datetime.datetime.now(UTC) + datetime.timedelta(hours=24)
            }
            token = jwt.encode(
                payload,
                app.config['SECRET_KEY'],
                algorithm='HS256'
            )
            
            # 更新最后登录时间
            update_sql = "UPDATE users SET lastLogin = NOW() WHERE id = %s"
            cursor.execute(update_sql, (user['id'],))
            conn.commit()
            
            return jsonify({
                'token': token,
                'user': {
                    'id': user['id'],
                    'name': user['name'],
                    'permission': user['permission']
                }
            })
        return jsonify({'message': '用户名或密码错误'}), 401
    
    except Exception as e:
        print(f"登录错误: {str(e)}")  # 添加错误日志
        return jsonify({'message': '登录失败'}), 500
    
    finally:
        cursor.close()
        conn.close()

# 获取用户列表
@app.route('/admin/users', methods=['GET'])
@admin_required
@with_db_reconnect()
def get_users():
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    
    try:
        cursor.execute("SELECT * FROM users")
        users = cursor.fetchall()
        return jsonify(users)
    finally:
        cursor.close()
        conn.close()

# 更新用户信息
@app.route('/admin/users/<int:user_id>', methods=['PUT'])
@admin_required
@with_db_reconnect()
def update_user(user_id):
    data = request.get_json()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # 构建UPDATE语句
        update_fields = []
        values = []
        for key, value in data.items():
            if key != 'id':
                update_fields.append(f"{key} = %s")
                values.append(value)
        values.append(user_id)
        
        sql = f"UPDATE users SET {', '.join(update_fields)} WHERE id = %s"
        cursor.execute(sql, values)
        conn.commit()
        
        return jsonify({'message': '更新成功'})
    except Exception as e:
        conn.rollback()
        return jsonify({'message': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# 删除用户
@app.route('/admin/users/<int:user_id>', methods=['DELETE'])
@admin_required
@with_db_reconnect()
def delete_user(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        conn.commit()
        return jsonify({'message': '删除成功'})
    except Exception as e:
        conn.rollback()
        return jsonify({'message': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# 获取所有表名
@app.route('/admin/tables', methods=['GET'])
@admin_required
@with_db_reconnect()
def get_tables():
    token = request.headers.get('Authorization').split(' ')[1]
    user_data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
    permission = user_data.get('permission', 1)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("SHOW TABLES")
        tables = [table[0] for table in cursor.fetchall()]
        
        # 如果不是超级管理员（permission=0），则移除users表访问权限
        if permission == 1:
            tables = [table for table in tables if table != 'users']
            
        return jsonify(tables)
    finally:
        cursor.close()
        conn.close()

# 获取表结构
@app.route('/admin/tables/<table_name>/structure', methods=['GET'])
@admin_required
@with_db_reconnect()
def get_table_structure(table_name):
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    
    try:
        cursor.execute(f"DESCRIBE {table_name}")
        structure = cursor.fetchall()
        return jsonify(structure)
    finally:
        cursor.close()
        conn.close()

# 获取表数据
@app.route('/admin/tables/<table_name>/data', methods=['GET'])
@admin_required
@with_db_reconnect()
def get_table_data(table_name):
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    
    try:
        cursor.execute(f"SELECT * FROM {table_name}")
        data = cursor.fetchall()
        
        # 预处理数据
        processed_data = []
        for row in data:
            processed_row = {}
            for key, value in row.items():
                if isinstance(value, (datetime.time, datetime.date, datetime.datetime)):
                    processed_row[key] = value.isoformat()
                elif isinstance(value, timedelta):
                    processed_row[key] = str(value)
                elif isinstance(value, bytes):
                    processed_row[key] = value.decode('utf-8')
                else:
                    processed_row[key] = value
            processed_data.append(processed_row)
        
        return jsonify(processed_data)
    except Exception as e:
        print(f"获取数据错误: {str(e)}")
        return jsonify({'message': '获取数据失败', 'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# 插入数据
@app.route('/admin/tables/<table_name>/data', methods=['POST'])
@admin_required
@with_db_reconnect()
def insert_data(table_name):
    data = request.get_json()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        fields = ', '.join(data.keys())
        placeholders = ', '.join(['%s'] * len(data))
        sql = f"INSERT INTO {table_name} ({fields}) VALUES ({placeholders})"
        cursor.execute(sql, list(data.values()))
        conn.commit()
        return jsonify({'message': '插入成功'})
    except Exception as e:
        conn.rollback()
        return jsonify({'message': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# 更新数据
@app.route('/admin/tables/<table_name>/data/<int:id>', methods=['PUT'])
@admin_required
@with_db_reconnect()
def update_data(table_name, id):
    data = request.get_json()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # 获取表结构
        cursor.execute(f"DESCRIBE {table_name}")
        columns = cursor.fetchall()
        
        # 过滤掉自动生成的字段和空值
        filtered_data = {}
        for key, value in data.items():
            # 跳过自动生成的时间戳字段
            if key in ['created_at', 'updated_at', 'timestamp']:
                continue
            # 跳过空值
            if value == '':
                continue
            filtered_data[key] = value

        # 如果没有要更新的数据，直接返回成功
        if not filtered_data:
            return jsonify({'message': '没有需要更新的数据'}), 200

        # 构建更新语句
        set_clause = ', '.join([f"{key} = %s" for key in filtered_data.keys()])
        values = list(filtered_data.values()) + [id]
        sql = f"UPDATE {table_name} SET {set_clause} WHERE id = %s"
        
        print(f"执行SQL: {sql}")  # 添加日志
        print(f"参数值: {values}")  # 添加日志
        
        cursor.execute(sql, values)
        conn.commit()
        
        return jsonify({'message': '更新成功'})
    except Exception as e:
        conn.rollback()
        print(f"更新失败: {str(e)}")  # 添加错误日志
        return jsonify({
            'message': '更新失败',
            'error': str(e),
            'sql': sql if 'sql' in locals() else None,
            'values': values if 'values' in locals() else None
        }), 500
    finally:
        cursor.close()
        conn.close()

# 删除数据
@app.route('/admin/tables/<table_name>/data/<int:id>', methods=['DELETE'])
@admin_required
@with_db_reconnect()
def delete_data(table_name, id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute(f"DELETE FROM {table_name} WHERE id = %s", (id,))
        conn.commit()
        return jsonify({'message': '删除成功'})
    except Exception as e:
        conn.rollback()
        return jsonify({'message': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# 获取单条数据
@app.route('/admin/tables/<table_name>/data/<int:id>', methods=['GET'])
@admin_required
@with_db_reconnect()
def get_single_data(table_name, id):
    conn = get_db_connection()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    
    try:
        cursor.execute(f"SELECT * FROM {table_name} WHERE id = %s", (id,))
        data = cursor.fetchone()
        if data:
            # 处理特殊数据类型
            processed_data = {}
            for key, value in data.items():
                if isinstance(value, (datetime.time, datetime.date, datetime.datetime)):
                    processed_data[key] = value.isoformat()
                elif isinstance(value, timedelta):
                    processed_data[key] = str(value)
                elif isinstance(value, bytes):
                    processed_data[key] = value.decode('utf-8')
                else:
                    processed_data[key] = value
            return jsonify(processed_data)
        return jsonify({'message': '数据不存在'}), 404
    except Exception as e:
        print(f"获取数据错误: {str(e)}")
        return jsonify({'message': '获取数据失败', 'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    app.run(debug=True, port=5001, host='0.0.0.0') 