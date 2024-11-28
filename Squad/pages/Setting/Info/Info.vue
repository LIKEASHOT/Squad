<template>
  <view class="profile-container">
    <!-- 信息展示部分 -->
    <view class="info-display">
      <view class="info-item">
        <text class="label">用户名：</text>
        <text class="value">{{ userInfo.username }}</text>
      </view>
      <view class="info-item">
        <text class="label">身高：</text>
        <text class="value">{{ userInfo.height }} cm</text>
      </view>
      <view class="info-item">
        <text class="label">体重：</text>
        <text class="value">{{ userInfo.weight }} kg</text>
      </view>
      <view class="info-item">
        <text class="label">年龄：</text>
        <text class="value">{{ userInfo.age }} 岁</text>
      </view>
      <view class="info-item">
        <text class="label">性别：</text>
        <text class="value">{{ userInfo.gender }}</text>
      </view>
    </view>

    <!-- 编辑按钮 -->
    <button class="edit-btn" @click="openEditModal">编辑</button>

    <!-- 编辑弹窗 -->
    <view v-if="isEditing" class="modal">
      <view class="modal-content">
        <view class="modal-header">
          <text>编辑个人信息</text>
        </view>
        <view class="modal-body">
          <view class="input-group">
            <text class="label">用户名：</text>
            <input v-model="editData.username" placeholder="请输入用户名" />
          </view>
          <view class="input-group">
            <text class="label">身高：</text>
            <input v-model="editData.height" type="number" placeholder="请输入身高(cm)" />
          </view>
          <view class="input-group">
            <text class="label">体重：</text>
            <input v-model="editData.weight" type="number" placeholder="请输入体重(kg)" />
          </view>
          <view class="input-group">
            <text class="label">年龄：</text>
            <input v-model="editData.age" type="number" placeholder="请输入年龄" />
          </view>
          <view class="input-group">
            <text class="label">性别：</text>
            <input v-model="editData.gender" placeholder="请输入性别" />
          </view>
        </view>
        <view class="modal-footer">
          <button class="cancel-btn" @click="closeEditModal">取消</button>
          <button class="save-btn" @click="saveEdit">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref,onMounted } from "vue";
const serverUrl = "http://192.168.56.1:3000"; 
const username = uni.getStorageSync("username"); // 获取已登录用户的用户名
const userInfo = ref({
  username: username,
  height: 170,
  weight: 60,
  age: 25,
  gender: "男",
});
// 在页面加载时获取用户信息
onMounted(() => {
  fetchUserInfo();
});
const fetchUserInfo = async () => {
  try {
    const res = await uni.request({
      url: `${serverUrl}/getUserInfo`, // 请求后端接口
      method: "POST",
      data: { username }, // 将用户名发送给后端
    });

    if (res.data.success) {
      userInfo.value = res.data.data; // 更新用户信息 
	  userInfo.value.username = uni.getStorageSync("username");
    } else { 
      uni.showToast({ title: "获取用户信息失败", icon: "none" });
    } 
  } catch (error) {
    console.error("获取用户信息失败:", error);
    uni.showToast({ title: "服务器错误", icon: "none" });
  }
};
const editData = ref({ ...userInfo.value });
const isEditing = ref(false);
// 打开编辑弹窗
const openEditModal = () => {
  editData.value = { ...userInfo.value };
  isEditing.value = true;
};
//取消编辑
const closeEditModal = () => {
  isEditing.value = false;
};

// 保存编辑
const saveEdit = async () => {
  try {
    const res = await uni.request({
      url: `${serverUrl}/updateUserInfo`, // 后端接口
      method: "POST",
      data: {
        oldUsername: userInfo.value.username, // 提交旧用户名
        ...editData.value, // 提交修改后的数据，包括新用户名
      },
    });

    if (res.data.success) {
      userInfo.value = { ...editData.value }; // 更新本地数据
	  uni.setStorageSync(`username`, userInfo.value.username);
	  const username = uni.getStorageSync("username");
	  console.log(`1: ${username}`);
	  // 通知 My_Info界面重新获取用户名
	  uni.$emit("saveEdit");
	   uni.navigateTo({
	           url:"/pages/My_Info/My_Info"  // 替换为你想刷新的页面路径
	         });
      uni.showToast({ title: "修改成功", icon: "success" });
    } else {
      uni.showToast({ title: res.data.message || "修改失败", icon: "none" });
    }
  } catch (error) {
    console.error("保存用户信息失败:", error);
    uni.showToast({ title: "服务器错误", icon: "none" });
  } finally {
    isEditing.value = false;
  } 
};
</script>
<style scoped>
.profile-container {
  padding: 20rpx;
  background: linear-gradient(120deg, #f6f9fc, #e9eef5);
  min-height: 100vh;
}

.info-display {
  background-color: #ffffff;
  padding: 30rpx;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
  margin-bottom: 40rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10rpx 0;
  border-bottom: 1rpx solid #ffffff;
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.value {
  font-size: 30rpx;
  color: #666666;
}

.edit-btn {
  width: 100%;
  padding: 25rpx;
  font-size: 34rpx;
  background: linear-gradient(90deg, #4caf50, #66bb6a);
  color: white;
  border: none;
  border-radius: 15rpx;
  text-align: center;
  box-shadow: 0 4rpx 8rpx rgba(76, 175, 80, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-btn:active {
  box-shadow: 0 2rpx 6rpx rgba(76, 175, 80, 0.4);
  transform: scale(0.98);
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  width: 90%;
  max-width: 600rpx;
  background: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 6rpx 12rpx rgba(0, 0, 0, 0.2);
}

.modal-header {
  font-size: 36rpx;
  font-weight: bold;
  text-align: center;
  color: #4caf50;
  margin-bottom: 20rpx;
}

.modal-body {
  margin-bottom: 30rpx;
}

.input-group {
  margin-bottom: 25rpx;
}

.input-group:last-child {
  margin-bottom: 0;
}

.label {
  font-size: 30rpx;
  margin-bottom: 8rpx;
  display: block;
  color: #333333;
}

input {
  width: 95%;
  padding: 15rpx;
  font-size: 30rpx;
  border: 1rpx solid #ccc;
  border-radius: 10rpx;
  background: #f9f9f9;
  transition: border 0.3s ease, background 0.3s ease;
}

input:focus {
  border: 1rpx solid #4caf50;
  background: #ffffff;
  outline: none;
  box-shadow: 0 2rpx 6rpx rgba(76, 175, 80, 0.2);
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
}

.cancel-btn,
.save-btn {
  flex: 1;
  padding: 20rpx;
  font-size: 28rpx;
  border-radius: 12rpx;
  text-align: center;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #666;
  border: 1rpx solid #ccc;
  transition: background 0.3s ease, color 0.3s ease;
}

.cancel-btn:hover {
  background-color: #eeeeee;
  color: #333333;
}

.save-btn {
  background: linear-gradient(90deg, #4caf50, #66bb6a);
  color: white;
  border: none;
  box-shadow: 0 4rpx 8rpx rgba(76, 175, 80, 0.3);
  transition: transform 0.3s ease;
}

.save-btn:active {
  transform: scale(0.98);
}

</style>
