<template>
  <view class="chat-container">
    <!-- 顶部栏 -->
    <view class="chat-header">
      <view class="back-btn" @click="goBack">
        <uni-icons type="left" size="24" color="#333"/>
      </view>
      <text class="friend-name">{{ friendInfo.username }}</text>
      <view class="more-btn">
        <uni-icons type="more-filled" size="24" color="#333"/>
      </view>
    </view>

    <!-- 聊天内容区域 -->
    <scroll-view 
      class="chat-content" 
      scroll-y="true"
      :scroll-top="scrollTop"
      :scroll-with-animation="true"
      @scrolltoupper="loadMoreMessages"
    >
      <view class="message-list">
        <view 
          v-for="(msg, index) in messages" 
          :key="index"
          :class="['message-item', msg.sender === userInfo.username ? 'self' : 'friend']"
        >
          <image :src="msg.sender === userInfo.username ? userInfo.avatar : friendInfo.avatar" class="avatar"/>
          <view class="message-bubble">
            <text class="message-text">{{ msg.content }}</text>
            <text class="message-time">{{ formatTime(msg.time) }}</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部输入区域 -->
    <view class="chat-input-area">
      <view class="input-box">
        <input 
          type="text" 
          v-model="messageText"
          placeholder="输入消息..."
          @confirm="sendMessage"
        />
        <view class="send-btn" @click="sendMessage">
          <text>发送</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const serverUrl = "http://192.168.56.1:3000";
const messageText = ref('');
const messages = ref([]);
const scrollTop = ref(0);
const userInfo = ref({
  username: uni.getStorageSync('username'),
  avatar: uni.getStorageSync('userInfo')?.avatar || '/static/avatar/default.png'
});
const friendInfo = ref({
  username: '',
  avatar: '/static/avatar/default.png'
});

// 获取路由参数
const initPage = () => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const { id, name } = currentPage.$page.options;
  
  friendInfo.value.username = name;
  loadChatHistory(id);
};

// 加载聊天历史
const loadChatHistory = async (friendId) => {
  try {
    const [error, res] = await uni.request({
      url: `${serverUrl}/chat/history`,
      method: 'POST',
      data: {
        userId: userInfo.value.username,
        friendId: friendId
      }
    });

    if (error) {
      throw error;
    }

    if (res.statusCode === 200) {
      messages.value = res.data;
      scrollToBottom();
    }
  } catch (error) {
    console.error('获取聊天历史失败:', error);
    uni.showToast({
      title: '获取聊天记录失败',
      icon: 'none'
    });
  }
};

// 发送消息
const sendMessage = async () => {
  if (!messageText.value.trim()) return;

  const newMessage = {
    sender: userInfo.value.username,
    content: messageText.value,
    time: new Date().getTime()
  };

  try {
    const [error, res] = await uni.request({
      url: `${serverUrl}/chat/send`,
      method: 'POST',
      data: {
        ...newMessage,
        receiver: friendInfo.value.username
      }
    });

    if (error) {
      throw error;
    }

    if (res.statusCode === 200) {
      messages.value.push(newMessage);
      messageText.value = '';
      scrollToBottom();
    }
  } catch (error) {
    console.error('发送消息失败:', error);
    uni.showToast({
      title: '发送失败',
      icon: 'none'
    });
  }
};

// 格式化时间
const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    const query = uni.createSelectorQuery();
    query.select('.message-list').boundingClientRect();
    query.exec((res) => {
      if (res[0]) {
        scrollTop.value = res[0].height;
      }
    });
  });
};

// 加载更多消息
const loadMoreMessages = () => {
  // 实现加载更多历史消息的逻辑
};

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

onMounted(() => {
  initPage();
});
</script>

<style lang="scss" scoped>
.chat-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.chat-header {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-btn, .more-btn {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.friend-name {
  flex: 1;
  text-align: center;
  font-size: 32rpx;
  font-weight: 500;
}

.chat-content {
  flex: 1;
  padding: 20rpx;
  overflow-y: auto;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.message-item {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
  
  &.self {
    flex-direction: row-reverse;
    
    .message-bubble {
      background-color: #95ec69;
      
      &::before {
        right: -16rpx;
        border-left-color: #95ec69;
      }
    }
  }
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: #eee;
}

.message-bubble {
  max-width: 60%;
  padding: 20rpx;
  background-color: #fff;
  border-radius: 20rpx;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 20rpx;
    left: -16rpx;
    border: 8rpx solid transparent;
    border-right-color: #fff;
  }
}

.message-text {
  font-size: 28rpx;
  color: #333;
  word-break: break-all;
}

.message-time {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
  display: block;
}

.chat-input-area {
  padding: 20rpx;
  background-color: #fff;
  border-top: 1rpx solid #eee;
}

.input-box {
  display: flex;
  align-items: center;
  gap: 20rpx;
  
  input {
    flex: 1;
    height: 80rpx;
    padding: 0 30rpx;
    background-color: #f5f5f5;
    border-radius: 40rpx;
    font-size: 28rpx;
  }
}

.send-btn {
  width: 120rpx;
  height: 80rpx;
  background-color: #07c160;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  
  text {
    color: #fff;
    font-size: 28rpx;
  }
}
</style> 