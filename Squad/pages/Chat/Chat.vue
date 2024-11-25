<template>
  <view class="chat-container">
    <!-- 顶部栏 -->
    <view class="chat-header">
      <view class="back-btn" @click="goBack">
        <uni-icons type="left" size="24" color="#333" />
      </view>
      <view class="friend-info">
        <text class="friend-name">{{ friendInfo.username }}</text>
        <text class="online-status" :class="{ online: friendInfo.online }">
          {{ friendInfo.online ? "在线" : "离线" }}
        </text>
      </view>
      <view class="more-btn" @click="showMoreActions = true">
        <uni-icons type="more-filled" size="24" color="#333" />
      </view>
    </view>

    <!-- 聊天内容区域 -->
    <scroll-view
      class="chat-content"
      scroll-y="true"
      :scroll-top="scrollTop"
      :scroll-with-animation="true"
      @scrolltoupper="loadMoreMessages"
      :scroll-into-view="lastMessageId"
    >
      <view class="message-list">
        <view
          v-for="(msg, index) in messages"
          :key="index"
          :id="'msg-' + index"
          :class="[
            'message-item',
            msg.sender === userInfo.username ? 'self' : 'friend',
          ]"
        >
          <image
            :src="
              msg.sender === userInfo.username
                ? userInfo.avatar
                : friendInfo.avatar
            "
            class="avatar"
          />
          <view class="message-content">
            <!-- 普通消息 -->
            <view v-if="msg.type === 'text'" class="message-bubble">
              <text class="message-text">{{ msg.content }}</text>
            </view>

            <!-- 打卡邀请消息 -->
            <view
              v-else-if="msg.type === 'invitation'"
              class="invitation-bubble"
            >
              <text class="invitation-title">打卡邀请</text>
              <view class="invitation-info">
                <text class="invitation-content">{{ msg.content }}</text>
                <view class="challenge-info">
                  <text>挑战时长: {{ msg.challengeData.duration }}天</text>
                  <text>每日目标: {{ msg.challengeData.goal.minutes }}分钟</text>
                  <text>或消耗: {{ msg.challengeData.goal.calories }}千卡</text>
                </view>
              </view>
              <view v-if="msg.sender !== userInfo.username" class="invitation-actions">
                <button 
                  class="accept-btn" 
                  @click="handleInvitation(msg, true)"
                  v-if="!msg.handled"
                >接受</button>
                <button 
                  class="reject-btn" 
                  @click="handleInvitation(msg, false)"
                  v-if="!msg.handled"
                >拒绝</button>
                <view v-else class="handled-status">
                  <text class="handled-text">{{ msg.accepted ? '已接受' : '已拒绝' }}</text>
                  <button 
                    v-if="msg.accepted" 
                    class="enter-challenge-btn"
                    @click="enterChallenge(msg)"
                  >进入打卡</button>
                </view>
              </view>
            </view>

            <text class="message-time">{{ formatTime(msg.time) }}</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部输入区域 -->
    <view class="chat-input-area">
      <view class="input-tools">
        <button class="tool-btn" @click="showInvitationDialog">
          <uni-icons type="calendar" size="24" color="#666" />
        </button>
      </view>
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

    <!-- 打卡邀请弹窗 -->
    <uni-popup ref="invitationPopup" type="dialog">
      <uni-popup-dialog
        title="发送打卡邀请"
        :content="invitationContent"
        :beforeClose="true"
        @confirm="sendInvitation"
        @close="closeInvitationDialog"
      >
        <view class="invitation-form">
          <input
            type="text"
            v-model="invitationContent"
            placeholder="请输入邀请内容..."
          />
        </view>
      </uni-popup-dialog>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from "vue";

const serverUrl = "http://your-server-url:3000";
const messageText = ref("");
const messages = ref([]);
const scrollTop = ref(0);
const websocket = ref(null);
const lastMessageId = ref("");
const invitationContent = ref("");
const invitationPopup = ref(null);

// 用户信息
const userInfo = ref({
  username: uni.getStorageSync("username"),
  avatar:
    uni.getStorageSync("userInfo")?.avatar || "/static/avatar/default.png",
});
const friendInfo = ref({
  username: "",
  avatar: "/static/avatar/default.png",
  online: false,
});

// 初始化WebSocket连接
const initWebSocket = () => {
  websocket.value = uni.connectSocket({
    url: `ws://your-server-url:3000/chat`,
    success: () => {
      console.log("WebSocket连接成功");
    },
  });

  websocket.value.onOpen(() => {
    // 发送身份验证信息
    websocket.value.send({
      data: JSON.stringify({
        type: "auth",
        username: userInfo.value.username,
      }),
    });
  });

  websocket.value.onMessage((res) => {
    try {
      const data = JSON.parse(res.data);
      switch (data.type) {
        case "text":
        case "invitation":
          if (data.sender === friendInfo.value.username) {
            messages.value.push(data);
            scrollToBottom();
          }
          break;
        case "status":
          if (data.username === friendInfo.value.username) {
            friendInfo.value.online = data.status === "online";
          }
          break;
        case "invitation_response":
          handleInvitationResponse(data);
          break;
      }
    } catch (error) {
      console.error("解析消息失败:", error);
    }
  });
};

// 发送消息
const sendMessage = async () => {
  if (!messageText.value.trim()) return;

  const newMessage = {
    type: "text",
    sender: userInfo.value.username,
    receiver: friendInfo.value.username,
    content: messageText.value,
    time: new Date().getTime(),
  };

  try {
    websocket.value.send({
      data: JSON.stringify(newMessage),
      success: () => {
        messages.value.push(newMessage);
        messageText.value = "";
        scrollToBottom();
      },
    });
  } catch (error) {
    console.error("发送消息失败:", error);
    uni.showToast({
      title: "发送失败",
      icon: "none",
    });
  }
};

// 显示打卡邀请弹窗
const showInvitationDialog = () => {
  invitationPopup.value.open();
};

// 关闭打卡邀请弹窗
const closeInvitationDialog = () => {
  invitationPopup.value.close();
  invitationContent.value = "";
};

// 发送打卡邀请
const sendInvitation = () => {
  if (!invitationContent.value.trim()) {
    uni.showToast({
      title: "请输入邀请内容",
      icon: "none",
    });
    return;
  }

  const invitation = {
    type: "invitation",
    sender: userInfo.value.username,
    receiver: friendInfo.value.username,
    content: invitationContent.value,
    time: new Date().getTime(),
    handled: false,
  };

  websocket.value.send({
    data: JSON.stringify(invitation),
    success: () => {
      messages.value.push(invitation);
      closeInvitationDialog();
      scrollToBottom();
    },
  });
};

// 处理打卡邀请响应
const handleInvitation = (msg, accepted) => {
  const response = {
    type: 'invitation_response',
    sender: userInfo.value.username,
    receiver: msg.sender,
    invitationId: msg.id,
    accepted,
    time: new Date().getTime()
  };

  websocket.value.send({
    data: JSON.stringify(response),
    success: () => {
      // 更新本地消息状态
      const msgIndex = messages.value.findIndex(m => m.id === msg.id);
      if (msgIndex !== -1) {
        messages.value[msgIndex].handled = true;
        messages.value[msgIndex].accepted = accepted;
        
        // 如果接受邀请，自动进入打卡界面
        if (accepted) {
          enterChallenge(messages.value[msgIndex]);
        }
      }
    }
  });
};

// 处理收到的打卡邀请响应
const handleInvitationResponse = (data) => {
  const msgIndex = messages.value.findIndex((m) => m.id === data.invitationId);
  if (msgIndex !== -1) {
    messages.value[msgIndex].handled = true;
    messages.value[msgIndex].accepted = data.accepted;
  }
};

// 获取路由参数并初始化
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
      method: "POST",
      data: {
        userId: userInfo.value.username,
        friendId: friendId,
      },
    });

    if (error) {
      throw error;
    }

    if (res.statusCode === 200) {
      messages.value = res.data;
      scrollToBottom();
    }
  } catch (error) {
    console.error("获取聊天历史失败:", error);
    uni.showToast({
      title: "获取聊天记录失败",
      icon: "none",
    });
  }
};


// 格式化时间
const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    const query = uni.createSelectorQuery();
    query.select(".message-list").boundingClientRect();
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

// 进入打卡挑战
const enterChallenge = (msg) => {
  uni.navigateTo({
    url: '/pages/Challenge/Challenge',
    success: () => {
      // 将挑战数据传递给打卡页面
      uni.$emit('challenge-data', {
        challenger: msg.sender,
        challengeData: msg.challengeData,
        invitationId: msg.id
      });
    }
  });
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

.back-btn,
.more-btn {
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
    content: "";
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

.friend-info {
  flex: 1;
  text-align: center;

  .friend-name {
    font-size: 32rpx;
    font-weight: 500;
  }

  .online-status {
    font-size: 24rpx;
    color: #999;
    margin-left: 10rpx;

    &.online {
      color: #07c160;
    }
  }
}

.invitation-bubble {
  background-color: #f8f8f8;
  padding: 20rpx;
  border-radius: 12rpx;

  .invitation-title {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 10rpx;
  }

  .invitation-info {
    margin: 10rpx 0;
  }
  
  .challenge-info {
    margin-top: 10rpx;
    font-size: 24rpx;
    color: #666;
    
    text {
      display: block;
      line-height: 1.5;
    }
  }
  
  .handled-status {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10rpx;
  }
  
  .enter-challenge-btn {
    background-color: #4cd964;
    color: #fff;
    font-size: 24rpx;
    padding: 8rpx 20rpx;
    border-radius: 30rpx;
    margin-top: 10rpx;
  }
}

.input-tools {
  padding: 10rpx 20rpx;
  border-top: 1rpx solid #eee;

  .tool-btn {
    background: none;
    padding: 10rpx;
    line-height: 1;
  }
}
</style>
