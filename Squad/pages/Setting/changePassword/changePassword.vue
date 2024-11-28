<template>
  <view class="password-container">
    <view class="input-group">
      <text class="label">原密码：</text>
      <input 
        v-model="form.oldPassword" 
        placeholder="请输入原密码" 
        type="password"
        @input="validateForm" 
      />
    </view>

    <view class="input-group">
      <text class="label">新密码：</text>
      <input 
        v-model="form.newPassword" 
        placeholder="请输入新密码" 
        type="password"
        @input="validateForm" 
      />
    </view>

    <view class="input-group">
      <text class="label">确认密码：</text>
      <input 
        v-model="form.confirmPassword" 
        placeholder="请再次输入新密码" 
        type="password"
        @input="validateForm" 
      />
    </view>

    <button 
      class="submit-btn" 
      :class="{ 'active': isFormValid }" 
      :disabled="!isFormValid" 
      @click="submitPassword"
    >
      提交
    </button>
  </view>
</template>

<script setup>
import { ref } from "vue";

const serverUrl = "http://192.168.56.1:3000"; // 后端服务器地址

const form = ref({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const isFormValid = ref(false);

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
</script>

<style scoped>
.password-container {
  padding: 30rpx;
  background-color: #f7f7f7;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.input-group {
  margin-bottom: 20rpx;
  width: 100%;
}

.label {
  font-size: 32rpx;
  margin-bottom: 10rpx;
  display: block;
  color: #333;
}

input {
  width: 95%;
  padding: 15rpx;
  font-size: 30rpx;
  border: 1rpx solid #ccc;
  border-radius: 8rpx;
  background: #f9f9f9;
  transition: border 0.3s ease, background 0.3s ease;
}

input:focus {
  border: 1rpx solid #4caf50;
  background: #fff;
  outline: none;
  box-shadow: 0 2rpx 6rpx rgba(76, 175, 80, 0.2);
}

.submit-btn {
  width: 100%;
  padding: 20rpx;
  font-size: 34rpx;
  background-color: #ccc;
  color: #fff;
  border: none;
  border-radius: 10rpx;
  text-align: center;
  transition: all 0.3s ease;
  margin-top: 20rpx;
}

.submit-btn.active {
  background-color: #4caf50;
  box-shadow: 0 4rpx 8rpx rgba(76, 175, 80, 0.3);
}

.submit-btn:disabled {
  cursor: not-allowed;
  background-color: #dcdcdc;
}

.submit-btn:active {
  transform: scale(0.98);
}

</style>
