<template>
  <view class="password-container">
    <!-- 顶部标题区域 -->
    <view class="header">
      <text class="page-title">修改密码</text>
      <text class="sub-title">请设置一个安全的新密码</text>
    </view>

    <!-- 密码表单区域 -->
    <view class="form-card">
      <!-- 原密码输入框 -->
      <view class="input-group">
        <text class="label">当前密码</text>
        <view class="input-wrapper">
          <input 
            :type="showOldPassword ? 'text' : 'password'"
            v-model="form.oldPassword" 
            placeholder="请输入当前密码"
            class="input"
          />
          <view class="eye-icon" @click="showOldPassword = !showOldPassword">
            <uni-icons :type="showOldPassword ? 'eye-filled' : 'eye-slash-filled'" size="20" color="#999"/>
          </view>
        </view>
      </view>

      <!-- 新密码输入框 -->
      <view class="input-group">
        <text class="label">新密码</text>
        <view class="input-wrapper">
          <input 
            :type="showNewPassword ? 'text' : 'password'"
            v-model="form.newPassword" 
            placeholder="请输入新密码"
            class="input"
            @input="validateForm"
          />
          <view class="eye-icon" @click="showNewPassword = !showNewPassword">
            <uni-icons :type="showNewPassword ? 'eye-filled' : 'eye-slash-filled'" size="20" color="#999"/>
          </view>
        </view>
        
        <!-- 添加密码强度提示 -->
        <view class="password-strength-section">
          <text class="strength-label">密码强度: {{ strengthText }}</text>
          <view class="password-strength">
            <view 
              v-for="(level, index) in 3" 
              :key="index"
              class="strength-bar"
              :class="getStrengthClass(index)"
            ></view>
          </view>
          <text class="strength-tips">提示：密码需包含字母、数字和特殊字符</text>
        </view>
      </view>

      <!-- 确认密码输入框 -->
      <view class="input-group">
        <text class="label">确认新密码</text>
        <view class="input-wrapper">
          <input 
            :type="showConfirmPassword ? 'text' : 'password'"
            v-model="form.confirmPassword" 
            placeholder="请再次输入新密码"
            class="input"
            @input="validateForm"
          />
          <view class="eye-icon" @click="showConfirmPassword = !showConfirmPassword">
            <uni-icons :type="showConfirmPassword ? 'eye-filled' : 'eye-slash-filled'" size="20" color="#999"/>
          </view>
        </view>
      </view>
    </view>

    <!-- 提交按钮 -->
    <button 
      class="submit-btn" 
      :class="{ active: isFormValid }"
      :disabled="!isFormValid" 
      @click="submitPassword"
    >
      <text>确认修改</text>
      <uni-icons type="checkmarkempty" size="20" color="#fff"/>
    </button>
  </view>
</template>

<script setup>
import { ref, computed } from "vue";

const serverUrl = uni.getStorageSync("serverUrl"); // 服务器地址
const form = ref({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});

// 添加这些控制密码显示/隐藏的变量
const showOldPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

const isFormValid = ref(false);

// 添加密码强度检查函数
const getStrengthClass = (index) => {
  const password = form.value.newPassword;
  if (!password) return '';
  
  // 简单的密码强度检查逻辑
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);
  const isLongEnough = password.length >= 8;
  
  let strength = 0;
  if (hasLetter) strength++;
  if (hasNumber) strength++;
  if (hasSpecial) strength++;
  if (isLongEnough) strength++;
  
  if (index < strength) {
    if (strength === 1) return 'weak';
    if (strength === 2) return 'medium';
    return 'strong';
  }
  return '';
};

// 表单校验
const validateForm = () => {
  isFormValid.value =
    form.value.oldPassword &&
    form.value.newPassword &&
    form.value.confirmPassword;
};

// 提交密码修改
const submitPassword = async () => {
  if (form.value.newPassword !== form.value.confirmPassword) {
    uni.showToast({ title: "新密码与确认密码不一致", icon: "none" });
    return;
  }

  try {
    const res = await uni.request({
      url: `${serverUrl}/changePassword`, // 后端接口地址
      method: "POST",
      data: {
        username: uni.getStorageSync("username"),
        oldPassword: form.value.oldPassword,
        newPassword: form.value.newPassword,
      },
    });

    if (res.data.success) {
      // 清空输入框
      form.value.oldPassword = "";
      form.value.newPassword = "";
      form.value.confirmPassword = "";
      isFormValid.value = false;
      // 返回上一级页面
      uni.navigateBack();
      uni.showToast({ title: "密码修改成功", icon: "success" });
    } else {
      uni.showToast({ title: res.data.message || "修改失败", icon: "none" });
    }
  } catch (error) {
    console.error("密码修改请求失败:", error);
    uni.showToast({ title: "服务器错误", icon: "none" });
  }
};

// 添加密码强度文本计算
const strengthText = computed(() => {
  const password = form.value.newPassword;
  if (!password) return '弱';
  
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);
  const isLongEnough = password.length >= 8;
  
  let strength = 0;
  if (hasLetter) strength++;
  if (hasNumber) strength++;
  if (hasSpecial) strength++;
  if (isLongEnough) strength++;
  
  if (strength <= 1) return '弱';
  if (strength === 2) return '中';
  return '强';
});
</script>

<style lang="scss" scoped>
.password-container {
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

.form-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.06);
  animation: slideUp 0.6s ease-out;
}

.input-group {
  margin-bottom: 40rpx;
  
  .label {
    font-size: 28rpx;
    color: #333;
    margin-bottom: 16rpx;
    display: block;
  }
  
  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    
    .input {
      flex: 1;
      height: 88rpx;
      background: #f8f9fa;
      border: 2rpx solid #e9ecef;
      border-radius: 16rpx;
      padding: 0 88rpx 0 24rpx;
      font-size: 28rpx;
      color: #333;
      transition: all 0.3s ease;
      
      &:focus {
        border-color: #5B8FF9;
        background: #fff;
        box-shadow: 0 0 0 2rpx rgba(91, 143, 249, 0.1);
      }
    }
    
    .eye-icon {
      position: absolute;
      right: 24rpx;
      top: 50%;
      transform: translateY(-50%);
      padding: 20rpx;
      display: flex;
      align-items: center;
    }
  }
}

.password-strength-section {
  margin-top: 16rpx;
  
  .strength-label {
    font-size: 24rpx;
    color: #666;
    margin-bottom: 8rpx;
    display: block;
  }
  
  .password-strength {
    display: flex;
    gap: 8rpx;
    margin-bottom: 8rpx;
    
    .strength-bar {
      flex: 1;
      height: 6rpx;
      background: #eee;
      border-radius: 3rpx;
      transition: all 0.3s ease;
      
      &.weak { background: #ff4d4f; }
      &.medium { background: #faad14; }
      &.strong { background: #52c41a; }
    }
  }
  
  .strength-tips {
    font-size: 22rpx;
    color: #999;
    margin-top: 8rpx;
    display: block;
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
  
  &.active {
    animation: pulse 2s infinite;
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(91, 143, 249, 0.4);
  }
  70% {
    box-shadow: 0 0 0 20rpx rgba(91, 143, 249, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(91, 143, 249, 0);
  }
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
