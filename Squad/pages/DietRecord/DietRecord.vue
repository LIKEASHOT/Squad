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
      <view v-for="(food, index) in dailyFoods" :key="index" class="food-item">
        <!-- 食物图片 -->
        <view class="food-image-wrapper">
          <image :src="food.imageUrl || defaultFoodImage" class="food-image" />
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
import { ref, computed, onMounted } from "vue";

const selectedDate = ref(new Date());
const dailyFoods = ref([]);
const defaultFoodImage = "/static/default-food.png";
const showEditPopup = ref(false);
const editingFood = ref({});
const editingIndex = ref(-1);
// const serverUrl = "http://10.133.80.141:3000"; // 服务器地址
const serverUrl = uni.getStorageSync("serverUrl");
console.log(serverUrl);
const username = uni.getStorageSync("username"); // 获取已登录用户的用户名
// 格式化日期显示
const formatDate = (date) => {
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
};

// 计算当日总热量
const dailyTotalCalories = computed(() => {
  return dailyFoods.value.reduce(
    (total, food) => total + (food.currentCalories || 0),
    0
  );
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
    const formattedDate = selectedDate.value.toISOString().split("T")[0]; // 获取 YYYY-MM-DD 格式的日期
    const res = await uni.request({
      url: serverUrl + "/getDailyFoods",
      method: "POST",
      data: {
        username: username,
        date: formattedDate, // 使用格式化后的日期
      },
    });

    if (res.statusCode === 200 && res.data.success) {
      dailyFoods.value = res.data.foods.map((food) => ({
        食物名称: food.食物名称,
        baseCalories: food.基础热量,
        amount: food.食用量,
        currentCalories: food.当前热量,
        imageUrl: serverUrl + "/" + food.图片路径, // 拼接完整路径
        time: food.时间,
      }));
    } else {
      console.error("获取饮食记录失败:", res.data.message);
      uni.showToast({ title: "获取饮食记录失败", icon: "none" });
    }
  } catch (error) {
    console.error("请求失败:", error);
    uni.showToast({ title: "网络错误", icon: "none" });
  }
};

// 编辑食物
const editFood = (index) => {
  editingFood.value = { ...dailyFoods.value[index] }; // 深拷贝选中食物数据
  editingIndex.value = index;
  showEditPopup.value = true; // 显示编辑弹窗
};

// 删除食物
const deleteFood = (index) => {
  uni.showModal({
    title: "确认删除",
    content: "是否确认删除这条记录？",
    success: async (res) => {
      if (res.confirm) {
        const foodToDelete = dailyFoods.value[index];
        try {
          const res = await uni.request({
            url: serverUrl + "/deleteFood", // 后端删除接口
            method: "POST",
            data: {
              username: username, // 当前用户名
              foodName: foodToDelete.食物名称, // 食物名称
              date: selectedDate.value.toISOString().split("T")[0], // 日期（ISO格式）
            },
          });

          if (res.statusCode === 200 && res.data.success) {
            const { deletedCalories } = res.data; // 获取被删除食物的热量
			 // 如果删除的是当天的食物，更新本地剩余热量
            if (deletedCalories && selectedDate.value.toDateString() === new Date().toDateString()) {
              let remainingCalories = uni.getStorageSync(`today_left_eat_${username}`) || 0;
              remainingCalories += deletedCalories; 
              uni.setStorageSync(`today_left_eat_${username}`, remainingCalories); 
			  // 通知 Home 页面删除食物事件
			  uni.$emit("foodDeleted");
            }

            // 删除成功后更新前端数据
            dailyFoods.value.splice(index, 1);
            saveDailyFoods(); // 保存更新后的数据到本地存储
			
            uni.showToast({
              title: "删除成功",
              icon: "success",
            });
          } else {
            uni.showToast({
              title: "删除失败",
              icon: "none",
            });
          }
        } catch (error) {
          console.error("删除失败:", error);
          uni.showToast({
            title: "网络错误",
            icon: "none",
          });
        }
      }
    },
  });
};

// 保存编辑
const saveEdit = async () => {
  if (editingIndex.value > -1) {
    // 获取编辑前的热量
    const originalCalories =
      dailyFoods.value[editingIndex.value].currentCalories;

    // 计算编辑后的热量
    editingFood.value.currentCalories = Math.round(
      (editingFood.value.baseCalories * editingFood.value.amount) / 100
    );

    // 计算热量差异（编辑后 - 编辑前）
    const calorieDifference =
      editingFood.value.currentCalories - originalCalories;

    // 更新前端列表
    dailyFoods.value[editingIndex.value] = { ...editingFood.value };
    saveDailyFoods(); // 保存更新后的本地存储

    // 如果是当天的食物，更新本地剩余热量
    const today = new Date().toDateString();
    if (selectedDate.value.toDateString() === today) {
      let remainingCalories =
        uni.getStorageSync(`today_left_eat_${username}`) || 0;
      remainingCalories -= calorieDifference; // 更新剩余热量
      uni.setStorageSync(`today_left_eat_${username}`, remainingCalories);
    }
    // 通知 Home 页面删除食物事件
    uni.$emit("foodEdit");
    // 向后端发送更新请求
    try {
      const res = await uni.request({
        url: serverUrl + "/updateFood", // 后端更新接口
        method: "POST",
        data: {
          username: username,
          foodName: editingFood.value.食物名称,
          amount: editingFood.value.amount,
          currentCalories: editingFood.value.currentCalories,
        },
      });

      if (res.statusCode === 200 && res.data.success) {
        uni.showToast({
          title: "更新成功",
          icon: "success",
        });
      } else {
        uni.showToast({
          title: "更新失败",
          icon: "none",
        });
      }
    } catch (error) {
      console.error("更新失败:", error);
      uni.showToast({
        title: "网络错误",
        icon: "none",
      });
    }

    // 通知 Home 页面食物更新事件
    uni.$emit("foodUpdated");

    // 隐藏编辑弹窗
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
  const dateKey = selectedDate.value.toISOString().split("T")[0];
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
