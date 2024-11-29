<template>
  <view class="sport-container">
    <!-- 顶部标题区域 -->
    <view class="header">
      <text class="page-title">运动偏好设置</text>
      <text class="sub-title">选择你感兴趣的运动目标和类型</text>
    </view>

    <!-- 运动目标选择区域 -->
    <view class="section goals-section">
      <view class="section-title">
        <uni-icons type="star-filled" size="20" color="#5B8FF9"/>
        <text>运动目标</text>
      </view>
      <view class="checkbox-grid">
        <view 
          v-for="(item, index) in goalOptions" 
          :key="index"
          class="checkbox-item"
          :class="{ active: form.goals.includes(item.value) }"
          @click="toggleGoal(item.value)"
        >
          <uni-icons 
            :type="form.goals.includes(item.value) ? 'checkbox-filled' : 'circle'" 
            size="18" 
            :color="form.goals.includes(item.value) ? '#5B8FF9' : '#999'"
          />
          <text>{{ item.name }}</text>
        </view>
      </view>
    </view>

    <!-- 运动类型选择区域 -->
    <view class="section types-section">
      <view class="section-title">
        <uni-icons type="flag-filled" size="20" color="#5B8FF9"/>
        <text>运动类型</text>
      </view>
      <view class="checkbox-grid">
        <view 
          v-for="(item, index) in typeOptions" 
          :key="index"
          class="checkbox-item"
          :class="{ active: form.types.includes(item.value) }"
          @click="toggleType(item.value)"
        >
          <uni-icons 
            :type="form.types.includes(item.value) ? 'checkbox-filled' : 'circle'" 
            size="18" 
            :color="form.types.includes(item.value) ? '#5B8FF9' : '#999'"
          />
          <text>{{ item.name }}</text>
        </view>
      </view>
    </view>

    <!-- 提交按钮 -->
    <button 
      class="submit-btn" 
      :disabled="!isFormValid" 
      @click="submitData"
    >
      <text class="submit-text">保存设置</text>
      <uni-icons type="checkmarkempty" size="20" color="#fff"/>
    </button>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';

const serverUrl = uni.getStorageSync("serverUrl"); // 服务器地址

const goalOptions = ref([
  { value: "减脂", name: "减脂", checked: false },
  { value: "增肌", name: "增肌", checked: false },
  { value: "耐力", name: "耐力", checked: false },
  { value: "柔韧性", name: "柔韧性", checked: false },
  { value: "综合健身", name: "综合健身", checked: false },
]);

const typeOptions = ref([
  { value: "跑步", name: "跑步", checked: false },
  { value: "游泳", name: "游泳", checked: false },
  { value: "徒手", name: "徒手", checked: false },
  { value: "瑜伽", name: "瑜伽", checked: false },
  { value: "篮球", name: "篮球", checked: false },
]);

const form = ref({
  goals: [],
  types: [],
});

// 校验表单是否有选择项
const isFormValid = computed(() => {
  return form.value.goals.length > 0 && form.value.types.length > 0;
});

// 切换目标选择
const toggleGoal = (value) => {
  const index = form.value.goals.indexOf(value);
  if (index === -1) {
    form.value.goals.push(value);
  } else {
    form.value.goals.splice(index, 1);
  }
};

// 切换类型选择
const toggleType = (value) => {
  const index = form.value.types.indexOf(value);
  if (index === -1) {
    form.value.types.push(value);
  } else {
    form.value.types.splice(index, 1);
  }
};

// 获取用户的运动数据
onMounted(() => {
  fetchUserSportData();
});

const fetchUserSportData = async () => {
  try {
    const res = await uni.request({
      url: `${serverUrl}/getSportData`, // 后端接口地址
      method: "POST",
      data: { username: uni.getStorageSync("username") },
    });

    if (res.data.success) {
      // 获取运动目标和类型
      const fitnessGoal = res.data.data.fitnessGoal.split(',');
      const exerciseType = res.data.data.exerciseType.split(',');

      // 更新goalOptions中的checked状态
      goalOptions.value.forEach(item => {
        if (fitnessGoal.includes(item.value)) {
          item.checked = true;
        }
      });

      // 更新typeOptions中的checked状态
      typeOptions.value.forEach(item => {
        if (exerciseType.includes(item.value)) {
          item.checked = true;
        }
      });

      // 更新表单默认值
      form.value.goals = fitnessGoal;
      form.value.types = exerciseType;
    } else {
      uni.showToast({ title: "获取数据失败", icon: "none" });
    }
  } catch (error) {
    console.error("获取运动数据失败:", error);
    uni.showToast({ title: "服务器错误", icon: "none" });
  }
};

// 提交用户选择的数据
const submitData = async () => {
  try {
    const res = await uni.request({
      url: `${serverUrl}/updateSportData`, // 后端接口地址
      method: "POST",
      data: {
        username: uni.getStorageSync("username"),
        fitnessGoal: form.value.goals.join(','),
        exerciseType: form.value.types.join(','),
      },
    });

    if (res.data.success) {
      // 返回上一级页面
      uni.navigateBack();
      uni.showToast({ title: "数据提交成功", icon: "success" });
    } else {
      uni.showToast({ title: res.data.message || "提交失败", icon: "none" });
    }
  } catch (error) {
    console.error("提交数据失败:", error);
    uni.showToast({ title: "服务器错误", icon: "none" });
  }
};
</script>

<style lang="scss" scoped>
.sport-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f6f7f9 0%, #ffffff 100%);
  padding: 40rpx 30rpx;
}

.header {
  text-align: center;
  margin-bottom: 60rpx;
  
  .page-title {
    font-size: 44rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 16rpx;
    display: block;
  }
  
  .sub-title {
    font-size: 28rpx;
    color: #666;
  }
}

.section {
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.06);
  animation: slideUp 0.6s ease-out;
  
  .section-title {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 30rpx;
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
  }
}

.checkbox-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 24rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
  transition: all 0.3s ease;
  
  &.active {
    background: rgba(91, 143, 249, 0.1);
    border: 2rpx solid #5B8FF9;
  }
  
  text {
    font-size: 28rpx;
    color: #333;
  }
  
  &:active {
    transform: scale(0.98);
  }
}

.submit-btn {
  width: 90%;
  height: 96rpx;
  margin: 60rpx auto;
  background: linear-gradient(135deg, #5B8FF9, #6094EA);
  border-radius: 48rpx;
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  border: none;
  box-shadow: 0 8rpx 20rpx rgba(91, 143, 249, 0.2);
  transition: all 0.3s ease;
  &:disabled {
    background: #ccc;
    box-shadow: none;
    opacity: 0.7;
  }
  
  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
}
.submit-text{
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
} 
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
