<template>
  <view class="settings-container">
    <!-- 账号部分 -->
    <view class="section">
      <text class="section-title">账号</text>
      <view class="option" @click="goToPersonalInfo">个人信息</view>
      <view class="option" @click="goToPasswordSetting">密码设置</view>
    </view>

    <!-- 通用部分 -->
    <view class="section">
      <text class="section-title">通用</text>
      <view class="option" @click="goToSportSetting">运动设置</view>
    </view>

    <!-- 退出按钮 -->
    <view class="footer">
      <button class="logout-btn" @click="logout">退出</button>
    </view>
  </view>
</template>


<script setup>
import { useRouter } from 'vue-router';

// 路由导航
const router = useRouter();

const goToPersonalInfo = () => {
  uni.navigateTo({
    url: '/pages/Setting/Info/Info'
  });
};

const goToPasswordSetting = () => {
  uni.navigateTo({
    url: '/pages/Setting/changePassword/changePassword'
  });
};

const goToSportSetting = () => {
  uni.navigateTo({
    url: '/pages/Setting/sportSetting/sportSetting'
  });
};

const logout = () => {
  uni.showModal({
    title: "提示",
    content: "确认退出登录吗？",
    success: (res) => {
      if (res.confirm) {
        // uni.removeStorageSync("username"); // 清除用户信息
        uni.navigateTo({
          url: '/pages/Login/Login'
        });
      }
    },
  });
};
</script>
<style scoped>
.settings-container {
  padding: 20rpx;
  background-color: #f7f7f7;
  min-height: 100vh; /* 确保占满屏幕高度 */
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* 保证退出按钮贴底 */
}

.section {
  margin-bottom: 40rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #666;
  margin-bottom: 20rpx;
  margin-left: 10px;
}

.option {
  background-color: #fff;
  padding: 20rpx;
  margin-bottom: 20rpx;
  font-size: 28rpx;
  color: #333;
  border-radius: 10rpx;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.option:active {
  background-color: #f0f0f0;
}

.footer {
  margin-top: auto; /* 将退出按钮推至底部 */
}

.logout-btn {
  width: 100%;
  padding: 5rpx; /* 增大按钮 */
  font-size: 36rpx; /* 增大字体 */
  background-color: #f44336;
  color: #fff;
  border: none;
  border-radius: 10rpx;
  text-align: center;
  box-shadow: 0 4rpx 8rpx rgba(244, 67, 54, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 20px;
}

.logout-btn:active {
  box-shadow: 0 2rpx 6rpx rgba(244, 67, 54, 0.4);
  transform: scale(0.98);
}
</style>
