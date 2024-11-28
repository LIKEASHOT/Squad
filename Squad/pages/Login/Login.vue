<template>
  <view class="login-container">
    <!-- Logo 和标题 -->
    <view class="logo-container">
      <image :src="logo" class="logo"></image>
      <text class="title">Squad</text>
    </view>

    <!-- 登录表单 -->
    <view class="form-container">
      <!-- <uni-easyinput
        v-model="form.account"
        placeholder="请输入账号"
        clearable
        class="input-field rounded-input"
      ></uni-easyinput> -->
      <fui-input
        placeholder="请输入账号名"
        borderTop
        :padding="['20rpx', '32rpx']"
        v-model="form.username"
        :isFillet="true"
        clearable
      ></fui-input>
      <view class="spacing"></view>
      <!-- 账号和密码之间的间距 -->
      <!-- <uni-easyinput
        v-model="form.password"
        placeholder="请输入密码"
        type="password"
        clearable
        class="input-field rounded-input"
      ></uni-easyinput> -->
      <fui-input
        borderTop
        :padding="['20rpx', '32rpx']"
        placeholder="请输入密码"
        :password="password"
        clearable
        v-model="form.password"
        :isFillet="true"
        @input="inputpwd"
      >
        <fui-icon
          :name="password ? 'invisible' : 'visible'"
          color="#B2B2B2"
          :size="50"
          @click="changepwd_vis"
        ></fui-icon>
      </fui-input>
      <!-- <fui-input
        placeholder="请输入密码"
        v-model="form.password"
        :isFillet="true"
        type="password"
        clearable
      ></fui-input> -->
      <view class="spacing"></view>
      <!-- 登录按钮 -->
      <button
        :class="['login-button', { active: isPressed }]"
        @touchstart="onButtonPress"
        @touchend="onButtonRelease"
        @click="submitLogin"
      >
        登录
      </button>
      <view class="spacing"></view>
      <view class="b_bar">
        <!-- 注册按钮 -->
        <text class="register-text" @click="goRegister">注册</text>
        <!-- 添加记住我选项 -->
        <view class="remember-me">
          <checkbox-group @change="handleRememberMe">
            <checkbox :checked="rememberMe" style="transform: scale(0.7)" />
            <text>记住我</text>
          </checkbox-group>
        </view>
      </view>
    </view>

    <!-- 底部协议 -->
    <view class="agreement">
      登录/注册表示您已同意
      <text class="link">《用户协议》</text> 和
      <text class="link">《隐私政策》</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from "vue";

const isPressed = ref(false); // 响应式变量，记录按钮是否被按下
const password = ref(true); // 密码是否可见
const rememberMe = ref(false);

// 检查是否有保存的登录状态
onMounted(() => {
  const savedCredentials = uni.getStorageSync("savedCredentials");
  if (savedCredentials) {
    form.value.username = savedCredentials.username;
    form.value.password = savedCredentials.password;
    rememberMe.value = true;

    // 可选：自动登录
    if (savedCredentials.autoLogin) {
      // submitLogin();
    }
  }
});

// 处理记住我选项变化
const handleRememberMe = (e) => {
  rememberMe.value = e.detail.value.length > 0;
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
// Login.vue
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
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  height: 100vh;
  justify-content: flex-start; /* 内容靠上对齐 */
}

.logo-container {
  margin-bottom: 30px; /* 向下移动 */
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo {
  width: 120px;
  height: 120px;
  border-radius: 50%;
}

.title {
  font-size: 28px;
  font-weight: bold;
  margin-top: 10px;
}

.input-field {
  margin-bottom: 15px;
  padding: 12px;
  border: 1px solid #e0e0e0;
  transition: border-color 0.3s; /* 平滑过渡 */
}

.rounded-input {
  border-radius: 30px; /* 圆角输入框 */
  background-color: #f5f5f5; /* 背景颜色 */
}
.form-container {
  width: 100%;
  padding: 0 20px;
}

.spacing {
  height: 25px; /* 账号和密码之间的间距 */
}

.login-button {
  width: 100%;
  background-color: black;
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  text-align: center;
  transition: background-color 0.3s ease; /* 添加平滑过渡效果 */

  &.active {
    background-color: #333; /* 按下时变暗 */
  }
}

.register-text {
  margin-top: 10px;
  font-size: 14px;
  color: #999;
  text-align: left; /* 左对齐 */
  padding-left: 10px;
}

.agreement {
  font-size: 12px;
  color: #999;
  margin-top: 200px;
  text-align: center;
}

.link {
  color: #007bff;
  cursor: pointer;
}

.remember-me {
  display: flex;
  align-items: center;
  margin: 20rpx 0;

  checkbox-group {
    display: flex;
    align-items: center;
  }

  text {
    font-size: 28rpx;
    color: #666;
    margin-left: 10rpx;
  }
}
.b_bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;

}
</style>
