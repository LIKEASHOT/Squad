<template>
  <view class="register-container">
    <!-- 动态背景 -->
    <view class="animated-background">
      <view class="gradient-overlay"></view>
      <view class="particles">
        <view v-for="i in 20" :key="i" class="particle"></view>
      </view>
      <view class="wave-container">
        <view class="wave wave1"></view>
        <view class="wave wave2"></view>
      </view>
    </view>

    <!-- Logo区域 -->
    <view class="logo-section">
      <image :src="logo" class="logo" mode="aspectFit"/>
      <text class="brand-name">Squad</text>
      <text class="slogan">开启你的运动之旅</text>
    </view>

    <!-- 注册表单 -->
    <view class="form-section">
      <view class="input-group">
        <view class="input-wrapper">
          <uni-icons type="person" size="20" color="#6e7ff3"/>
          <input
            type="text"
            v-model="form.username"
            placeholder="请设置用户名"
            class="input"
          />
        </view>
        
        <view class="input-wrapper">
          <uni-icons type="locked" size="20" color="#6e7ff3"/>
          <input
            :type="password ? 'password' : 'text'"
            v-model="form.password"
            placeholder="请设置密码"
            class="input"
            @input="checkPasswordStrength"
          />
          <view class="eye-icon" @click="changepwd_vis">
            <uni-icons 
              :type="password ? 'eye-slash-filled' : 'eye-filled'" 
              size="20" 
              color="#999"
            />
          </view>
        </view>

        <!-- 密码强度指示器 -->
        <view class="password-strength">
          <text class="strength-text">密码强度: {{ strengthLevel }}</text>
          <view class="strength-bars">
            <view 
              v-for="n in 3" 
              :key="n"
              class="strength-bar"
              :class="getStrengthClass(n)"
            ></view>
          </view>
          <text class="strength-tips">提示：密码需包含字母、数字和特殊字符</text>
        </view>
        
        <view class="input-wrapper">
          <uni-icons type="locked" size="20" color="#6e7ff3"/>
          <input
            :type="password_confirm ? 'password' : 'text'"
            v-model="form.confirmPassword"
            placeholder="请确认密码"
            class="input"
          />
          <view class="eye-icon" @click="changepwd_vis_confirm">
            <uni-icons 
              :type="password_confirm ? 'eye-slash-filled' : 'eye-filled'" 
              size="20" 
              color="#999"
            />
          </view>
        </view>
      </view>

      <!-- 注册按钮 -->
      <button 
        class="register-btn" 
        :disabled="!isFormValid"
        @click="submitRegister"
      >
        <text class="register-btn-text">注册账号</text>
        <view class="btn-arrow">
          <uni-icons type="arrowright" size="18" color="#fff"/>
        </view>
      </button>

      <!-- 返回登录 -->
      <view class="back-to-login" @click="goToLogin">
        <text>已有账号？</text>
        <text class="link-text">返回登录</text>
      </view>
    </view>

    <!-- 底部协议 -->
    <view class="agreement">
      <text>注册即代表同意</text>
      <text class="link">《用户协议》</text>
      <text>和</text>
      <text class="link">《隐私政策》</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';

const password = ref(true);
const password_confirm = ref(true);
const logo = "/static/Squad1.png";
const serverUrl = import.meta.env.VITE_APP_SERVER_URL;
const websocketUrl = import.meta.env.VITE_APP_WEBSOCKET_URL;
const strengthLevel = ref('弱');

const form = ref({
  username: "",
  password: "",
  confirmPassword: "",
});

// 计算表单是否有效
const isFormValid = computed(() => {
  return form.value.username && 
         form.value.password && 
         form.value.confirmPassword &&
         form.value.password === form.value.confirmPassword;
});

// 检查密码强度
const checkPasswordStrength = () => {
  const pwd = form.value.password;
  if (!pwd) {
    strengthLevel.value = '弱';
    return;
  }
  
  let strength = 0;
  // 检查长度
  if (pwd.length >= 8) strength++;
  // 检查是否包含字母
  if (/[a-zA-Z]/.test(pwd)) strength++;
  // 检查是否包含数字
  if (/[0-9]/.test(pwd)) strength++;
  // 检查是否包含特殊字符
  if (/[!@#$%^&*]/.test(pwd)) strength++;
  
  if (strength <= 1) strengthLevel.value = '弱';
  else if (strength === 2) strengthLevel.value = '中';
  else strengthLevel.value = '强';
};

// 获取密码强度样式
const getStrengthClass = (index) => {
  const strength = {
    '弱': 1,
    '中': 2,
    '强': 3
  }[strengthLevel.value] || 0;
  
  if (index <= strength) {
    switch (strengthLevel.value) {
      case '弱': return 'weak';
      case '中': return 'medium';
      case '强': return 'strong';
      default: return '';
    }
  }
  return '';
};

// 密码可见性切换
const changepwd_vis = () => {
  password.value = !password.value;
};

const changepwd_vis_confirm = () => {
  password_confirm.value = !password_confirm.value;
};

// 提交注册
const submitRegister = async () => {
  if (!isFormValid.value) {
    uni.showToast({
      title: "请完善注册信息",
      icon: "none"
    });
    return;
  }

  try {
    const res = await uni.request({
      url: serverUrl + "/register",
      method: "POST",
      data: {
        username: form.value.username,
        password: form.value.password,
        confirmPassword: form.value.confirmPassword,
      }
    });

    if (res.statusCode === 201 && res.data.success) {
      uni.showToast({
        title: "注册成功",
        icon: "success"
      });
      
      uni.setStorage({
        key: "username",
        data: form.value.username,
        success: () => {
          uni.navigateTo({
            url: "/pages/FirstLogin/FirstLogin"
          });
        }
      });
    } else {
      uni.showToast({
        title: res.data.message || "注册失败",
        icon: "none"
      });
    }
  } catch (err) {
    console.error("注册失败:", err);
    uni.showToast({
      title: "网络错误",
      icon: "none"
    });
  }
};

// 返回登录页
const goToLogin = () => {
  uni.navigateBack();
};
</script>

<style lang="scss" scoped>
.register-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f6f7f9 0%, #ffffff 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 40rpx;
}

/* 动态背景 */
.animated-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
}

.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(110, 127, 243, 0.1), rgba(92, 109, 243, 0.05));
}

/* 粒子动画 */
.particles {
  position: absolute;
  width: 100%;
  height: 100%;
}

.particle {
  position: absolute;
  width: 6rpx;
  height: 6rpx;
  background: rgba(110, 127, 243, 0.15);
  border-radius: 50%;
  animation: float 15s infinite linear;

  @for $i from 1 through 20 {
    &:nth-child(#{$i}) {
      left: random(100) * 1%;
      top: random(100) * 1%;
      animation-delay: random(5) * -1s;
      animation-duration: (random(10) + 10) * 1s;
      opacity: random(10) * 0.1;
      transform: scale(random(3) * 0.6);
    }
  }
}

/* Logo区域 */
.logo-section {
  margin-bottom: 80rpx;
  text-align: center;
  animation: fadeInDown 1s ease-out;

  .logo {
    width: 180rpx;
    height: 180rpx;
    margin-bottom: 24rpx;
    animation: float 6s ease-in-out infinite;
  }

  .brand-name {
    font-size: 48rpx;
    font-weight: 600;
    background: linear-gradient(135deg, #6e7ff3, #5c6df3);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 12rpx;
    display: block;
  }

  .slogan {
    font-size: 28rpx;
    color: #666;
  }
}

/* 表单区域 */
.form-section {
  width: 100%;
  animation: fadeInUp 1s ease-out;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:focus-within {
    box-shadow: 0 4rpx 24rpx rgba(110, 127, 243, 0.15);
    transform: translateY(-2rpx);
  }

  .input {
    flex: 1;
    margin-left: 20rpx;
    font-size: 28rpx;
    color: #333;
  }

  .eye-icon {
    padding: 20rpx;
  }
}

/* 密码强度指示器 */
.password-strength {
  padding: 20rpx;
  margin: 20rpx 0;
  background: #f8f9fa;
  border-radius: 12rpx;

  .strength-text {
    font-size: 24rpx;
    color: #666;
    margin-bottom: 12rpx;
    display: block;
  }

  .strength-bars {
    display: flex;
    gap: 8rpx;
    margin-bottom: 12rpx;
  }

  .strength-bar {
    flex: 1;
    height: 6rpx;
    background: #eee;
    border-radius: 3rpx;
    transition: all 0.3s ease;

    &.weak {
      background: #ff4d4f !important;
    }

    &.medium {
      background: #faad14 !important;
    }

    &.strong {
      background: #52c41a !important;
    }
  }

  .strength-tips {
    font-size: 22rpx;
    color: #999;
    margin-top: 8rpx;
  }
}

/* 注册按钮 */
.register-btn {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, #6e7ff3, #5c6df3);
  border-radius: 48rpx;
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  border: none;
  box-shadow: 0 8rpx 20rpx rgba(110, 127, 243, 0.3);
  transition: all 0.3s ease;
  margin-bottom: 40rpx;
  position: relative;
  overflow: hidden;
  .register-btn-text {
    font-size: 32rpx;
    color: #fff;
  }
  &:disabled {
    background: #ccc;
    box-shadow: none;
    opacity: 0.7;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: 0.5s;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
    opacity: 0.9;

    &::before {
      left: 100%;
    }
  }
}

/* 返回登录链接 */
.back-to-login {
  text-align: center;
  font-size: 28rpx;
  color: #666;

  .link-text {
    color: #6e7ff3;
    margin-left: 8rpx;
  }
}

/* 底部协议 */
.agreement {
  position: absolute;
  bottom: 40rpx;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 24rpx;
  color: #999;

  .link {
    color: #6e7ff3;
    margin: 0 4rpx;
  }
}

/* 动画关键帧 */
@keyframes float {
  0% { transform: translate(0, 0); }
  50% { transform: translate(0, -10rpx); }
  100% { transform: translate(0, 0); }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
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
