<template>
  <view class="diet-record">
    <!-- 日期导航 -->
    <view class="date-nav">
      <button @click="changeDate(-1)" class="nav-btn">前一天</button>
      <text class="current-date">{{ formatDate(selectedDate) }}</text>
      <button @click="changeDate(1)" class="nav-btn">后一天</button>
    </view>
    
    <!-- 当日统计 -->
    <view class="daily-summary">
      <text class="summary-title">当日摄入统计</text>
      <text class="total-calories">总热量: {{ dailyTotalCalories }}千卡</text>
    </view>
    
    <!-- 食物记录列表 -->
    <scroll-view class="food-list" scroll-y>
      <view v-for="(food, index) in dailyFoods" 
            :key="index" 
            class="food-item">
        <!-- 食物图片 -->
        <view class="food-image-wrapper">
          <image :src="food.imageUrl || defaultFoodImage" 
                 class="food-image"
                  />
        </view>
        
        <!-- 食物信息 -->
        <view class="food-info">
          <view class="food-name">{{ food.食物名称 }}</view>
          <view class="food-details">
            <text>食用量: {{ food.amount }}g</text>
            <text>热量: {{ food.currentCalories }}千卡</text>
          </view>
          <text class="food-time">{{ food.time }}</text>
        </view>
        
        <!-- 操作按钮 -->
        <view class="food-actions">
          <button class="edit-btn" @click="editFood(index)">编辑</button>
          <button class="delete-btn" @click="deleteFood(index)">删除</button>
        </view>
      </view>
    </scroll-view>
    
    <!-- 编辑弹窗 -->
    <view v-if="showEditPopup" class="edit-popup">
      <view class="popup-content">
        <text class="popup-title">编辑食物</text>
        <view class="form-item">
          <text>食用量(g)</text>
          <input type="number" v-model="editingFood.amount" />
        </view>
        <view class="popup-buttons">
          <button @click="cancelEdit">取消</button>
          <button @click="saveEdit">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const selectedDate = ref(new Date());
const dailyFoods = ref([]);
const defaultFoodImage = '/static/default-food.png';
const showEditPopup = ref(false);
const editingFood = ref({});
const editingIndex = ref(-1);
const serverUrl = "http://192.168.56.1:3000"; // 服务器地址
const username = uni.getStorageSync("username"); // 获取已登录用户的用户名
// 格式化日期显示
const formatDate = (date) => {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
};

// 计算当日总热量
const dailyTotalCalories = computed(() => {
  return dailyFoods.value.reduce((total, food) => total + (food.currentCalories || 0), 0);
});

// 切换日期
const changeDate = (days) => {
  const newDate = new Date(selectedDate.value);
  newDate.setDate(newDate.getDate() + days);
  selectedDate.value = newDate;
  loadDailyFoods();
};
//获取用户每日饮食
const loadDailyFoods = async () => {
  try {
    const formattedDate = selectedDate.value.toISOString().split('T')[0]; // 获取 YYYY-MM-DD 格式的日期
    const res = await uni.request({
      url: serverUrl + '/getDailyFoods',
      method: 'POST',
      data: {
        username: username,
        date: formattedDate,   // 使用格式化后的日期
      },
    });

    if (res.statusCode === 200 && res.data.success) {
      dailyFoods.value = res.data.foods.map((food) => ({
        食物名称: food.食物名称,
        baseCalories: food.基础热量,
        amount: food.食用量,
        currentCalories: food.当前热量,
        imageUrl: serverUrl + '/' + food.图片路径, // 拼接完整路径
        time: food.时间,
      })); 
    } else {
      console.error('获取饮食记录失败:', res.data.message);
      uni.showToast({ title: '获取饮食记录失败', icon: 'none' });
    }
  } catch (error) {
    console.error('请求失败:', error);
    uni.showToast({ title: '网络错误', icon: 'none' });
  }
};


// 编辑食物
const editFood = (index) => {
  editingFood.value = { ...dailyFoods.value[index] };
  editingIndex.value = index;
  showEditPopup.value = true;
};

// 删除食物
const deleteFood = (index) => {
  uni.showModal({
    title: '确认删除',
    content: '是否确认删除这条记录？',
    success: async (res) => {
      if (res.confirm) {
		  // let remainingCalories = uni.getStorageSync(`today_left_eat_${username}`);//获取剩余热量
		  // remainingCalories+=currentCalories;//加上被删除的热量
		  // // 保存更新后的剩余热量到本地
		  // uni.setStorageSync(`today_left_eat_${username}`, remainingCalories);
		  
		  
        const foodToDelete = dailyFoods.value[index];
        try {
          // 向后端发送删除请求，使用食物名称作为标识
          const res = await uni.request({
            url: serverUrl + '/deleteFood',  // 后端删除接口
            method: 'POST',
            data: {
              username: username,  // 当前用户名
              foodName: foodToDelete.食物名称,  // 食物名称作为唯一标识
            },
          });

          if (res.statusCode === 200 && res.data.success) {
            // 删除成功后从前端数据中移除该记录
            dailyFoods.value.splice(index, 1); 
            saveDailyFoods();  // 保存更新后的数据到本地存储
            uni.showToast({
              title: '删除成功',
              icon: 'success',
            });
          } else {
            uni.showToast({
              title: '删除失败',
              icon: 'none',
            });
          }
        } catch (error) {
          console.error('删除失败:', error);
          uni.showToast({
            title: '网络错误',
            icon: 'none',
          });
        }
      }
    }
  });
  
};


// 保存编辑
const saveEdit = () => {
  if (editingIndex.value > -1) {
    // 更新热量
    editingFood.value.currentCalories = Math.round(
      (editingFood.value.baseCalories * editingFood.value.amount) / 100
    );
    
    dailyFoods.value[editingIndex.value] = { ...editingFood.value };
    saveDailyFoods();
    showEditPopup.value = false;
  }
};

// 取消编辑
const cancelEdit = () => {
  showEditPopup.value = false;
};

// 保存到本地存储
const saveDailyFoods = () => {
  const username = uni.getStorageSync("username");
  const dateKey = selectedDate.value.toISOString().split('T')[0];
  const storageKey = `dailyFoods_${username}_${dateKey}`;
  uni.setStorageSync(storageKey, dailyFoods.value);
};

// 页面加载时初始化
onMounted(() => {
  loadDailyFoods();
});
</script>

<style lang="scss" scoped>
.diet-record {
  padding: 20rpx;
  
  .date-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx;
    background: #fff;
    border-radius: 16rpx;
    margin-bottom: 20rpx;
    
    .nav-btn {
      font-size: 28rpx;
      padding: 10rpx 30rpx;
      background: #f5f5f5;
      border: none;
      border-radius: 8rpx;
    }
    
    .current-date {
      font-size: 32rpx;
      font-weight: bold;
    }
  }
  
  .daily-summary {
    background: #fff;
    padding: 20rpx;
    border-radius: 16rpx;
    margin-bottom: 20rpx;
    
    .summary-title {
      font-size: 28rpx;
      color: #666;
    }
    
    .total-calories {
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
      margin-top: 10rpx;
    }
  }
  
  .food-list {
    height: calc(100vh - 300rpx);
    
    .food-item {
      display: flex;
      background: #fff;
      padding: 20rpx;
      border-radius: 16rpx;
      margin-bottom: 20rpx;
      
      .food-image-wrapper {
        width: 120rpx;
        height: 120rpx;
        margin-right: 20rpx;
        
        .food-image {
          width: 100%;
          height: 100%;
          border-radius: 12rpx;
          object-fit: cover;
        }
      }
      
      .food-info {
        flex: 1;
        
        .food-name {
          font-size: 32rpx;
          font-weight: bold;
          margin-bottom: 10rpx;
        }
        
        .food-details {
          font-size: 28rpx;
          color: #666;
          margin-bottom: 10rpx;
          
          text {
            margin-right: 20rpx;
          }
        }
        
        .food-time {
          font-size: 24rpx;
          color: #999;
        }
      }
      
      .food-actions {
        display: flex;
        flex-direction: column;
        gap: 10rpx;
        
        button {
          font-size: 24rpx;
          padding: 6rpx 20rpx;
          border-radius: 8rpx;
          
          &.edit-btn {
            background: #007aff;
            color: #fff;
          }
          
          &.delete-btn {
            background: #ff3b30;
            color: #fff;
          }
        }
      }
    }
  }
  
  .edit-popup {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    
    .popup-content {
      background: #fff;
      padding: 30rpx;
      border-radius: 16rpx;
      width: 80%;
      
      .popup-title {
        font-size: 32rpx;
        font-weight: bold;
        margin-bottom: 30rpx;
      }
      
      .form-item {
        margin-bottom: 20rpx;
        
        input {
          border: 1px solid #ddd;
          padding: 10rpx;
          border-radius: 8rpx;
          margin-top: 10rpx;
        }
      }
      
      .popup-buttons {
        display: flex;
        justify-content: flex-end;
        gap: 20rpx;
        margin-top: 30rpx;
        
        button {
          padding: 10rpx 30rpx;
          border-radius: 8rpx;
          
          &:first-child {
            background: #f5f5f5;
          }
          
          &:last-child {
            background: #007aff;
            color: #fff;
          }
        }
      }
    }
  }
}
</style> 