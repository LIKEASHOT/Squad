<template>
  <view class="register-container">
    <!-- Logo 和标题 -->
    <view class="logo-container">
      <image :src="logo" class="logo"></image>
      <text class="title">注册</text>
    </view>

    <!-- 注册表单 -->
    <view class="form-container">
      <fui-input
        placeholder="请输入账号名"
        borderTop
        :padding="['20rpx', '32rpx']"
        v-model="form.username"
        :isFillet="true"
        clearable
      ></fui-input>

      <view class="spacing"></view>
      <!-- 输入密码 -->
      <!-- <uni-easyinput
        v-model="form.password"
        type="password"
        placeholder="请输入密码"
        clearable
        class="input-field"
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
      <view class="spacing"></view>
      <!-- 再次输入密码 -->
      <!-- <uni-easyinput
        v-model="form.confirmPassword"
        type="password"
        placeholder="请再次输入密码"
        clearable
        class="input-field"
      ></uni-easyinput> -->
      <fui-input
        borderTop
        :padding="['20rpx', '32rpx']"
        placeholder="请再次输入密码"
        :password="password_confirm"
        clearable
        v-model="form.confirmPassword"
        :isFillet="true"
        @input="inputpwd_confirm"
      >
        <fui-icon
          :name="password_confirm ? 'invisible' : 'visible'"
          color="#B2B2B2"
          :size="50"
          @click="changepwd_vis_confirm"
        ></fui-icon>
      </fui-input>
      <view class="spacing"></view>
      <!-- 注册按钮 -->
      <button class="register-button" @click="submitRegister">注册</button>
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
import { ref } from "vue";
const password = ref(true); // 密码是否可见
const password_confirm = ref(true); // 密码是否可见
const inputpwd = (e) => {
  console.log(e);
};
const changepwd_vis = () => {
  password.value = !password.value;
};
const inputpwd_confirm = (e) => {
  console.log(e);
};
const changepwd_vis_confirm = () => {
  password_confirm.value = !password_confirm.value;
};
const logo = "/static/Squad1.png"; // Logo 图片路径
const serverUrl = "http://10.133.80.141:3000"; // 服务器地址
const form = ref({
  username: "",
  password: "",
  confirmPassword: "",
});

const submitRegister = () => {
  if (
    !form.value.username ||
    !form.value.password ||
    !form.value.confirmPassword
  ) {
    uni.showToast({
      title: "请填写完整信息",
      icon: "none",
    });
    return;
  }
  if (form.value.password !== form.value.confirmPassword) {
    uni.showToast({
      title: "两次密码输入不一致",
      icon: "none",
    });
    return;
  }
  console.log("提交注册表单", form.value);
  // 注册逻辑处理
  uni.request({
    url: serverUrl + "/register",
    method: "POST",
    data: {
      username: form.value.username,
      password: form.value.password,
      confirmPassword: form.value.confirmPassword,
    },
    success: (res) => {
      console.log("注册请求返回：", res); // 打印出响应
      if (res.statusCode === 201 && res.data.success) {
        uni.showToast({
          title: "注册成功",
          icon: "success",
        });
        // 保存当前用户信息到本地存储
        uni.setStorage({
          key: "username",
          data: form.value.username,
          success: function () {
            console.log("success");
          },
        });
        uni
          .navigateTo({ url: "/pages/FirstLogin/FirstLogin" })
          .then(() => {
            console.log("跳转成功");
          })
          .catch((err) => {
            console.error("跳转失败：", err);
          });
      } else {
        uni.showToast({
          title: res.data.message || "注册失败",
          icon: "none",
        });
      }
    },
    fail: (err) => {
      uni.showToast({
        title: "网络请求失败",
        icon: "none",
      });
      console.error("注册请求失败：", err);
    },
  });
};
</script>

<style lang="scss" scoped>
.register-container {
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

.form-container {
  width: 100%;
  padding: 0 20px;
  margin-bottom: 20px;
}

.input-field {
  border-radius: 25px; /* 圆角输入框 */
}

.register-button {
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
.agreement {
  font-size: 12px;
  color: #999;
  margin-top: 155px;
  text-align: center;
}

.link {
  color: #007bff;
  cursor: pointer;
}
.spacing {
  height: 25px;
}
</style>
