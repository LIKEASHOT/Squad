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
import { useRouter } from "vue-router";
import { useWebSocketStore } from "@/store/webSocket";

// 路由导航
const router = useRouter();

const goToPersonalInfo = () => {
  uni.navigateTo({
    url: "/pages/Setting/Info/Info",
  });
};

const goToPasswordSetting = () => {
  uni.navigateTo({
    url: "/pages/Setting/changePassword/changePassword",
  });
};

const goToSportSetting = () => {
  uni.navigateTo({
    url: "/pages/Setting/sportSetting/sportSetting",
  });
};

const logout = () => {
  uni.showModal({
    title: "提示",
    content: "确认退出登录吗？",
    success: (res) => {
      if (res.confirm) {
        // 清除用户相关的本地存储
        // uni.clearStorageSync(); // 清除所有存储
        // 或者选择性清除：
        uni.removeStorageSync("username");
        uni.removeStorageSync("friendsList");
        // ... 清除其他相关存储

        // 关闭WebSocket连接
        const store = useWebSocketStore();
        store.closeWebSocket();

        // 重置页面栈并跳转到登录页
        uni.reLaunch({
          url: '/pages/Login/Login',
          success: () => {
            // 确保页面栈被清空
            console.log('已退出登录并重置页面栈');
          },
          fail: (error) => {
            console.error('退出登录失败:', error);
          }
        });
      }
    },
  });
};
</script>
<style lang="scss" scoped>
.settings-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f6f7f9 0%, #ffffff 100%);
  padding: 30rpx;
}

// 卡片基础样式
.section {
  background: #fff;
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.06);
  animation: slideUp 0.6s ease-out;

  .section-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 24rpx;
    margin-left: 20rpx;
    display: flex;
    align-items: center;
    gap: 12rpx;

    &::before {
      content: '';
      width: 8rpx;
      height: 32rpx;
      background: linear-gradient(to bottom, #5B8FF9, #6094EA);
      border-radius: 4rpx;
    }
  }

  .option {
    position: relative;
    padding: 30rpx 40rpx;
    background: #f8f9fa;
    border-radius: 16rpx;
    margin-bottom: 20rpx;
    font-size: 28rpx;
    color: #333;
    transition: all 0.3s ease;

    &::after {
      content: '›';
      position: absolute;
      right: 40rpx;
      color: #999;
      font-size: 36rpx;
      top: 50%;
      transform: translateY(-50%);
    }

    &:active {
      transform: translateX(10rpx);
      background: #f0f2f5;
    }
  }
}

// 退出按钮
.footer {
  padding: 40rpx 30rpx;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, transparent, #f6f7f9);

  .logout-btn {
    width: 100%;
    height: 96rpx;
    background: linear-gradient(135deg, #ff6b6b, #ff8787);
    border-radius: 48rpx;
    color: #fff;
    font-size: 32rpx;
    font-weight: 600;
    border: none;
    box-shadow: 0 8rpx 20rpx rgba(255, 107, 107, 0.2);
    transition: all 0.3s ease;

    &:active {
      transform: scale(0.98);
      opacity: 0.9;
    }
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
