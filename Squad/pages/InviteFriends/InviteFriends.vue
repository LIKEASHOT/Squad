<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="back-btn" @click="goBack">
        <uni-icons type="left" size="24" color="#333" />
      </view>
      <text class="nav-title">邀请好友</text>
    </view>

    <!-- 顶部搜索 -->
    <view class="search-box">
      <uni-icons type="search" size="18" color="#999" />
      <input
        type="text"
        v-model="searchQuery"
        placeholder="搜索好友"
        class="search-input"
      />
    </view>

    <!-- 好友列表 -->
    <scroll-view scroll-y class="friends-list">
      <view
        v-for="friend in filteredFriends"
        :key="friend.id"
        class="friend-item"
        hover-class="friend-item-hover"
      >
        <view class="friend-info">
          <image :src="friend.avatar || defaultAvatar" class="avatar" />
          <text class="name">{{ friend.username }}</text>
        </view>
        <button
          class="invite-btn"
          :class="{ invited: friend.invited }"
          @click="inviteFriend(friend)"
        >
          {{ friend.invited ? "已邀请" : "邀请" }}
        </button>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { onMounted, ref, computed, onUnmounted} from "vue";
import { useWebSocketStore } from '@/store/websocket';
import { onPullDownRefresh } from "@dcloudio/uni-app";
const username = uni.getStorageSync("username");
const searchQuery = ref("");
const defaultAvatar = "/static/default-avatar.png";
const serverUrl = uni.getStorageSync("serverUrl");
console.log(serverUrl);
// 好友列表数据
const friendsList = ref([
  { id: 1, username: "Alice", avatar: "", invited: false },
  { id: 2, username: "Bob", avatar: "", invited: false },
  // ... 更多好友数据
]);
onMounted(() => {
  friendsList.value = uni.getStorageSync("friendsList_" + username);
});
onPullDownRefresh(() => {
  friendsList.value = uni.getStorageSync("friendsList_" + username);
  setTimeout(() => {
    uni.stopPullDownRefresh();
  }, 1000);
});
// 搜索过滤
const filteredFriends = computed(() => {
  return friendsList.value.filter((friend) =>
    friend.username.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const store = useWebSocketStore();

// 修改邀请好友函数
const inviteFriend = (friend) => {
  if (friend.invited) return;
  
  // 构建打卡邀请消息
  const invitation = {
    type: 'invitation',
    id: Date.now().toString(),
    sender: uni.getStorageSync('username'),
    receiver: friend.username,
    content: '邀请你参加7天运动挑战',
    time: new Date().getTime(),
    handled: false,
    accepted: null,
    challengeData: {
      duration: 7,
      goal: {
        minutes: 10,
        calories: 80
      },
      startTime: new Date().getTime()
    }
  };

  // 通过 WebSocket 发送邀请
  if (store.isConnected) {
    store.sendInvitation(invitation);
    // 保存到本地聊天记录
    store.saveMessageToLocal(invitation);
    friend.invited = true;
    uni.showToast({
      title: '邀请已发送',
      icon: 'success'
    });
  } else {
    uni.showToast({
      title: '发送失败',
      icon: 'none'
    });
  }
};

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};
</script>

<style lang="scss" scoped>
.container {
  padding: 30rpx;
  background: #f8f8f8;
  min-height: 100vh;
}

.nav-bar {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  margin-bottom: 20rpx;

  .back-btn {
    width: 80rpx;
    height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .nav-title {
    flex: 1;
    text-align: center;
    font-size: 32rpx;
    font-weight: 500;
    margin-right: 80rpx;
  }
}

.search-box {
  background: #fff;
  padding: 20rpx 30rpx;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
}

.search-input {
  flex: 1;
  margin-left: 20rpx;
  font-size: 28rpx;
}

.friends-list {
  height: calc(100vh - 280rpx);
}

.friend-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
}

.friend-info {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
}

.name {
  font-size: 32rpx;
  color: #333;
}

.invite-btn {
  background: #4cd964;
  color: #fff;
  padding: 12rpx 40rpx;
  border-radius: 100rpx;
  font-size: 28rpx;
  border: none;
  margin: 0;
  min-width: 140rpx;

  &.invited {
    background: #ccc;
  }

  &:active {
    opacity: 0.8;
  }
}

.friend-item-hover {
  background: #f5f5f5;
}
</style>
