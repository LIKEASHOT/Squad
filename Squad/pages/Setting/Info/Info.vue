<template>
  <view class="profile-container">
    <!-- 顶部标题 -->
    <view class="header">
      <text class="page-title">个人资料</text>
      <text class="sub-title">完善你的个人信息</text>
    </view>

    <!-- 信息展示卡片 -->
    <view class="info-card">
      <view class="info-item">
        <text class="label">用户名</text>
        <text class="value">{{ userInfo.username }}</text>
      </view>
      <view class="info-item">
        <text class="label">身高</text>
        <text class="value">{{ userInfo.height }} cm</text>
      </view>
      <view class="info-item">
        <text class="label">体重</text>
        <text class="value">{{ userInfo.weight }} kg</text>
      </view>
      <view class="info-item">
        <text class="label">年龄</text>
        <text class="value">{{ userInfo.age }} 岁</text>
      </view>
      <view class="info-item">
        <text class="label">性别</text>
        <text class="value">{{ userInfo.gender }}</text>
      </view>
    </view>

    <!-- 编辑按钮 -->
    <button class="edit-btn" @click="openEditModal">
      <uni-icons type="compose" size="16" color="#fff"/>
      <text>编辑资料</text>
    </button>

    <!-- 编辑弹窗 -->
    <view v-if="isEditing" class="modal">
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">编辑个人信息</text>
        </view>
        
        <scroll-view class="modal-body" scroll-y>
          <view class="input-group">
            <text class="label">用户名</text>
            <input 
              v-model="editData.username" 
              placeholder="请输入用户名"
              class="input"
            />
          </view>
          
          <view class="input-group">
            <text class="label">身高 (cm)</text>
            <input 
              v-model="editData.height" 
              type="number" 
              placeholder="请输入身高"
              class="input"
            />
          </view>
          
          <view class="input-group">
            <text class="label">体重 (kg)</text>
            <input 
              v-model="editData.weight" 
              type="number" 
              placeholder="请输入体重"
              class="input"
            />
          </view>
          
          <view class="input-group">
            <text class="label">年龄</text>
            <input 
              v-model="editData.age" 
              type="number" 
              placeholder="请输入年龄"
              class="input"
            />
          </view>
          
          <view class="input-group">
            <text class="label">性别</text>
            <picker 
              mode="selector" 
              :range="['男', '女']" 
              @change="onGenderChange"
              class="picker"
            >
              <view class="picker-value">
                {{ editData.gender || '请选择性别' }}
              </view>
            </picker>
          </view>
        </scroll-view>
        
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
const serverUrl = uni.getStorageSync("serverUrl"); // 服务器地址
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
	  //  uni.navigateTo({
	  //          url:"/pages/My_Info/My_Info"  // 替换为你想刷新的页面路径
      //        });
    uni.navigateBack(); 
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
<style lang="scss" scoped>
.profile-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f6f7f9 0%, #ffffff 100%);
  padding: 30rpx;
}

.header {
  text-align: center;
  margin-bottom: 40rpx;
  
  .page-title {
    font-size: 44rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 12rpx;
    display: block;
  }
  
  .sub-title {
    font-size: 28rpx;
    color: #666;
  }
}

.info-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.06);
  animation: slideIn 0.6s ease-out;

  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx 0;
    border-bottom: 2rpx solid #f0f2f5;
    transition: all 0.3s ease;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: #f8f9fa;
      border-radius: 12rpx;
      padding: 24rpx 20rpx;
    }

    .label {
      font-size: 28rpx;
      color: #666;
    }

    .value {
      font-size: 28rpx;
      font-weight: 500;
      color: #333;
    }
  }
}

.edit-btn {
  width: 90%;
  height: 96rpx;
  margin: 0 auto;
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

  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  width: 80%;
  max-height: 80vh;
  background: #fff;
  border-radius: 24rpx;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 30rpx;
  text-align: center;
  background: linear-gradient(135deg, #5B8FF9, #6094EA);
  border-radius: 24rpx 24rpx 0 0;

  .modal-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #fff;
  }
}

.modal-body {
  flex: 1;
  padding: 30rpx;
  max-height: calc(80vh - 240rpx);
  box-sizing: border-box;

  .input-group {
    margin-bottom: 30rpx;
    width: 100%;
    box-sizing: border-box;

    &:last-child {
      margin-bottom: 0;
    }

    .label {
      font-size: 28rpx;
      color: #333;
      margin-bottom: 12rpx;
      display: block;
    }

    .input {
      width: 100%;
      height: 88rpx;
      background: #f8f9fa;
      border: 2rpx solid #e9ecef;
      border-radius: 16rpx;
      padding: 0 24rpx;
      font-size: 28rpx;
      box-sizing: border-box;

      &:focus {
        border-color: #5B8FF9;
        background: #fff;
        box-shadow: 0 0 0 2rpx rgba(91, 143, 249, 0.1);
      }
    }

    .picker {
      width: 100%;
      height: 88rpx;
      background: #f8f9fa;
      border: 2rpx solid #e9ecef;
      border-radius: 16rpx;
      overflow: hidden;
      box-sizing: border-box;

      .picker-value {
        height: 88rpx;
        line-height: 88rpx;
        padding: 0 24rpx;
        font-size: 28rpx;
        color: #333;
      }
    }
  }
}

.modal-footer {
  padding: 30rpx;
  display: flex;
  gap: 20rpx;
  border-top: 2rpx solid #f0f2f5;
  background: #fff;

  button {
    flex: 1;
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    font-weight: 500;
    border-radius: 16rpx;
    border: none;
    transition: all 0.3s ease;

    &.cancel-btn {
      background: #f8f9fa;
      color: #666;
    }

    &.save-btn {
      background: linear-gradient(135deg, #5B8FF9, #6094EA);
      color: #fff;
      box-shadow: 0 4rpx 12rpx rgba(91, 143, 249, 0.2);
    }

    &:active {
      transform: scale(0.98);
      opacity: 0.9;
    }
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
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
