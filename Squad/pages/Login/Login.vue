<template>
  <view class="login-container">
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
      <text class="slogan">让运动更有趣</text>
    </view>

    <!-- 登录表单 -->
    <view class="form-section">
      <view class="input-group">
        <view class="input-wrapper">
          <uni-icons type="person" size="20" color="#6e7ff3"/>
          <input
            type="text"
            v-model="form.username"
            placeholder="请输入账号"
            class="input"
          />
        </view>
        
        <view class="input-wrapper">
          <uni-icons type="locked" size="20" color="#6e7ff3"/>
          <input
            :type="showPassword ? 'text' : 'password'"
            v-model="form.password"
            placeholder="请输入密码"
            class="input"
          />
          <view class="eye-icon" @click="showPassword = !showPassword">
            <uni-icons 
              :type="showPassword ? 'eye-filled' : 'eye-slash-filled'" 
              size="20" 
              color="#999"
            />
          </view>
        </view>
      </view>

      <!-- 记住我和忘记密码 -->
      <view class="options-row">
        <checkbox-group @change="handleRememberMe">
            <checkbox :checked="rememberMe" style="transform: scale(0.7)" />
            <text>记住我</text>
          </checkbox-group>
        <text class="forgot-password">忘记密码?</text>
      </view>

      <!-- 登录按钮 -->
      <button 
        class="login-btn" 
        :class="{ active: isPressed }"
        @touchstart="onButtonPress"
        @touchend="onButtonRelease"
        @click="submitLogin"
      >
        <text>登 录</text>
        <view class="btn-arrow">
          <uni-icons type="arrowright" size="18" color="#fff"/>
        </view>
      </button>

      <!-- 注册链接 -->
      <view class="register-link" @click="goRegister">
        <text>还没有账号？</text>
        <text class="link-text">立即注册</text>
      </view>
    </view>

    <!-- 底部协议 -->
    <view class="agreement">
      <text>登录即代表同意</text>
      <text class="link">《用户协议》</text>
      <text>和</text>
      <text class="link">《隐私政策》</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from "vue";
const showPassword = ref(false); // 密码是否可见
const isPressed = ref(false); // 响应式变量，记录按钮是否被按下
const password = ref(true); // 密码是否可见
const rememberMe = ref(false);
const savedCredentials = ref(null);
// 检查是否有保存的登录状态
onMounted(() => {
  savedCredentials.value = uni.getStorageSync("savedCredentials");
  console.log(savedCredentials.value);  
  if (savedCredentials.value) {
    form.value.username = savedCredentials.value.username;
    form.value.password = savedCredentials.value.password;
    rememberMe.value = true;

    // 可选：自动登录
    if (savedCredentials.value.autoLogin) {
      // submitLogin();
    }
  }
});

// 处理记住我选项变化
const handleRememberMe = (e) => {
  rememberMe.value = e.detail.value.length > 0;
  console.log(rememberMe.value);  
};

const inputpwd = (e) => {
  console.log(e);
};
const changepwd_vis = () => {
  password.value = !password.value;
};

const onButtonPress = () => {
  isPressed.value = true; // 按下时变为 true
};

const onButtonRelease = () => {
  isPressed.value = false; // 松开时恢复为 false
};
const logo = "/static/Squad1.png"; // Logo 图片路径
// const serverUrl = "http://10.133.80.141:3000";
// const websocketUrl = "ws://10.133.80.141:3001";
// Login.vue 登录页面
// 读取环境变量
const serverUrl = import.meta.env.VITE_APP_SERVER_URL;
const websocketUrl = import.meta.env.VITE_APP_WEBSOCKET_URL;
console.log(serverUrl, websocketUrl);
uni.setStorageSync("websocketUrl", websocketUrl);
// 服务器地址存储在本地
uni.setStorageSync("serverUrl", serverUrl);
const form = ref({
  username: "",
  password: "",
});

const submitLogin = () => {
  if (!form.value.username || !form.value.password) {
    uni.showToast({
      title: "请输入账号名和密码",
      icon: "none",
    });
    return;
  }

  uni.request({
    url: serverUrl + "/login",
    method: "POST",
    data: {
      username: form.value.username,
      password: form.value.password,
    },
    success: (res) => {
      if (res.statusCode === 200) {
        // 保存登录信息
        uni.setStorageSync("token", res.data.token);
        uni.setStorageSync("username", form.value.username);
        uni.setStorageSync("Level", res.data.Level);

        // 如果选择了记住我，保存登录凭证
        if (rememberMe.value) {
          uni.setStorageSync("savedCredentials", {
            username: form.value.username,
            password: form.value.password,
            autoLogin: true,
          });
        } else {
          // 如果取消了记住我，清除保存的凭证
          uni.removeStorageSync("savedCredentials");
        }

        uni.showToast({
          title: "登录成功",
          icon: "success",
        });

        // 跳转到首页
        uni.switchTab({
          url: "/pages/Home/Home",
        });
      } else {
        uni.showToast({
          title: "登录失败",
          icon: "none",
        });
      }
    },
  });
};

const goRegister = () => {
  console.log("前往注册页面");
  // 跳转到注册页面逻辑
  uni.navigateTo({ url: "/pages/Register/Register" });
};
</script>

<style lang="scss" scoped>
.login-container {
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
  overflow: hidden;
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

/* 波浪动画 */
.wave-container {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 200rpx;
  overflow: hidden;
}

.wave {
  position: absolute;
  left: -100%;
  bottom: 0;
  width: 300%;
  height: 100%;
  background: url('data:image/svg+xml,<svg viewBox="0 0 1000 150" xmlns="http://www.w3.org/2000/svg"><path d="M0,50 C150,0 350,100 500,50 C650,0 850,100 1000,50 L1000,150 L0,150 Z" fill="rgba(110, 127, 243, 0.1)"/></svg>') repeat-x;
  animation: waveAnimation 20s linear infinite;

  &.wave1 {
    animation-duration: 20s;
    opacity: 0.3;
  }

  &.wave2 {
    animation-duration: 15s;
    opacity: 0.2;
    bottom: -10rpx;
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

.input-group {
  margin-bottom: 40rpx;
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

/* 选项行 */
.options-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40rpx;
  padding: 0 20rpx;

  .remember-me {
    display: flex;
    align-items: center;
    gap: 12rpx;
    font-size: 26rpx;
    color: #666;
  }

  .forgot-password {
    font-size: 26rpx;
    color: #6e7ff3;
  }
}

/* 登录按钮 */
.login-btn {
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
  margin-bottom: 60rpx;
  position: relative;
  overflow: hidden;

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

  &:active {
    transform: scale(0.98);
    opacity: 0.9;

    &::before {
      left: 100%;
    }
  }

  .btn-arrow {
    transition: transform 0.3s ease;
  }

  &:active .btn-arrow {
    transform: translateX(10rpx);
  }
}

/* 注册链接 */
.register-link {
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

@keyframes waveAnimation {
  0% { transform: translateX(0); }
  100% { transform: translateX(50%); }
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
