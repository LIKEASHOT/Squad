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
        <view v-if="unreadCount > 0" class="unread-badge">
          {{ unreadCount }}
        </view>
      </view>
      <view class="more-btn" @click="showMoreActions = true">
        <uni-icons type="more-filled" size="24" color="#333" />
      </view>
    </view>

    <!-- 添加新消息提醒 -->
    <view
      v-if="showNewMessageTip"
      class="new-message-tip"
      @click="scrollToBottom"
    >
      <text>{{ unreadCount }}条新消息</text>
      <uni-icons type="bottom" size="12" color="#fff" />
    </view>

    <!-- 聊天内容区域 -->
    <scroll-view
      class="chat-content"
      scroll-y="true"
      :scroll-top="scrollTop"
      :scroll-with-animation="true"
      @scrolltoupper="loadMoreMessages"
      @scroll="handleScroll"
      :scroll-into-view="lastMessageId"
    >
      <!-- 加载更多提示 -->
      <view v-if="isLoading" class="loading-more">
        <text>加载中...</text>
      </view>

      <view class="message-list">
        <!-- 日期分割线 -->
        <view v-for="(group, date) in groupedMessages" :key="date">
          <view class="date-divider">
            <text>{{ formatDate(date) }}</text>
          </view>

          <view
            v-for="msg in group"
            :key="msg.id"
            :id="'msg-' + msg.id"
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
              <!-- 消息内容 -->
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
                    <text
                      >每日目标: {{ msg.challengeData.goal.minutes }}分钟</text
                    >
                    <text
                      >或消耗: {{ msg.challengeData.goal.calories }}千卡</text
                    >
                  </view>
                </view>
                <view
                  v-if="msg.sender !== userInfo.username"
                  class="invitation-actions"
                >
                  <button
                    class="accept-btn"
                    @click="handleInvitation(msg, true)"
                    v-if="!msg.handled"
                  >
                    接受
                  </button>
                  <button
                    class="reject-btn"
                    @click="handleInvitation(msg, false)"
                    v-if="!msg.handled"
                  >
                    拒绝
                  </button>
                  <view v-else class="handled-status">
                    <text class="handled-text">{{
                      msg.accepted ? "已接受" : "已拒绝"
                    }}</text>
                    <button
                      v-if="msg.accepted"
                      class="enter-challenge-btn"
                      @click="enterChallenge(msg)"
                    >
                      进入打卡
                    </button>
                  </view>
                </view>
              </view>

              <!-- 消息状态 -->
              <view class="message-status">
                <text class="message-time">{{ formatTime(msg.time) }}</text>
                <view
                  v-if="msg.sender === userInfo.username"
                  class="send-status"
                >
                  <text
                    v-if="msg.sendFailed"
                    class="failed-text"
                    @click="resendMessage(msg)"
                  >
                    发送失败，点击重试
                  </text>
                  <text v-else class="read-status">
                    {{ msg.isRead ? "已读" : "未读" }}
                  </text>
                </view>
              </view>
            </view>
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
      <view class="invitation-form">
        <text class="form-title">发送打卡邀请</text>

        <!-- 邀请内容 -->
        <input
          type="text"
          v-model="invitationContent"
          placeholder="请输入邀请内容..."
          class="input-field"
        />

        <!-- 运动标设置 -->
        <view class="goal-setting">
          <text class="setting-title">运动目标</text>
          <view class="goal-inputs">
            <view class="input-group">
              <input type="number" v-model="goalMinutes" class="goal-input" />
              <text class="unit">分钟</text>
            </view>
            <text class="or">或</text>
            <view class="input-group">
              <input type="number" v-model="goalCalories" class="goal-input" />
              <text class="unit">千卡</text>
            </view>
          </view>
        </view>

        <!-- 挑战天数设置 -->
        <view class="duration-setting">
          <text class="setting-title">挑战天数</text>
          <slider
            :min="1"
            :max="30"
            :value="challengeDuration"
            :step="1"
            @change="onDurationChange"
            show-value
            class="duration-slider"
          />
        </view>

        <!-- 按钮组 -->
        <view class="button-group">
          <button class="cancel-btn" @click="closeInvitationDialog">
            取消
          </button>
          <button class="confirm-btn" @click="sendInvitation">发送邀请</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from "vue";

const serverUrl = "http://10.133.80.141:3000";
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

// 添加新的响应式变量
const unreadCount = ref(0);
const showNewMessageTip = ref(false);
const isLoading = ref(false);
const isAtBottom = ref(true);
const currentPage = ref(1);
const hasMore = ref(true);

// 消息分组计算属性
const groupedMessages = computed(() => {
  const groups = {};
  messages.value.forEach((msg) => {
    const date = new Date(msg.time).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(msg);
  });
  return groups;
});

// 初始化WebSocket连接
const initWebSocket = () => {
  try {
    websocket.value = uni.connectSocket({
      url: `ws://10.133.80.141:3001/chat`,
      complete: () => {
        console.log("WebSocket连接尝试完成");
      },
    });

    // 监听连接成功
    websocket.value.onOpen(() => {
      console.log("WebSocket连接成功");
      // 发送身份验证信息
      sendWebSocketMessage({
        type: "auth",
        username: userInfo.value.username,
      });
    });

    // 监听连接失败
    websocket.value.onError((error) => {
      console.error("WebSocket连接错误:", error);
      uni.showToast({
        title: "连接失败，请重试",
        icon: "none",
      });
    });

    // 监听消息
    websocket.value.onMessage((res) => {
      try {
        const data = JSON.parse(res.data);
        handleWebSocketMessage(data);
      } catch (error) {
        console.error("解析消息失败:", error);
      }
    });
  } catch (error) {
    console.error("初始化WebSocket失败:", error);
  }
};

// 添加安全的消息发送函数
const sendWebSocketMessage = (message) => {
  if (!websocket.value) {
    console.error("WebSocket未连接");
    return false;
  }

  try {
    websocket.value.send({
      data: JSON.stringify(message),
      success: () => {
        console.log("消息发送成功:", message);
        return true;
      },
      fail: (error) => {
        console.error("消息发送失败:", error);
        return false;
      },
    });
  } catch (error) {
    console.error("发送消息时出错:", error);
    return false;
  }
};

// 添加消息处理函数
const handleWebSocketMessage = (data) => {
  switch(data.type) {
    case 'text':
    case 'invitation':
      if (data.sender === friendInfo.value.username) {
        messages.value.push(data);
        // 保存到本地存储
        saveMessageToLocal(data);
        if (!isAtBottom.value) {
          unreadCount.value++;
          showNewMessageTip.value = true;
        } else {
          scrollToBottom();
        }
      }
      break;
    case 'status':
      if (data.username === friendInfo.value.username) {
        friendInfo.value.online = data.status === 'online';
      }
      break;
    case 'invitation_response':
      handleInvitationResponse(data);
      break;
  }
};

// 添加本地存储相关函数
const getLocalStorageKey = (friendId) => {
  return `chat_history_${userInfo.value.username}_${friendId}`;
};

// 保存消息到本地
const saveMessageToLocal = (message) => {
  const key = getLocalStorageKey(friendInfo.value.username);
  let history = uni.getStorageSync(key) || [];
  history.push(message);
  uni.setStorageSync(key, history);
};

// 从本地获取消息历史
const getLocalMessages = (friendId) => {
  const key = getLocalStorageKey(friendId);
  return uni.getStorageSync(key) || [];
};

// 修改加载聊天历史的函数
const loadChatHistory = async (friendId) => {
  try {
    const result = await uni.request({
      url: `${serverUrl}/chat/history`,
      method: "POST",
      data: {
        userId: userInfo.value.username,
        friendId: friendId,
      }
    });
    
    // uni.request 返回的是一个数组 [err, res]
    const [err, res] = result;
    
    if (err) {
      throw err;
    }

    if (res.statusCode === 200 && res.data.status === 'success') {
      const { messages: serverMessages } = res.data.data;
      if (serverMessages && serverMessages.length > 0) {
        messages.value = serverMessages;
        // 保存到本地
        uni.setStorageSync(getLocalStorageKey(friendId), serverMessages);
        scrollToBottom();
      }
    } else {
      throw new Error(res.data.message || 'Failed to load chat history');
    }
  } catch (error) {
    console.error("获取聊天历史失败:", error);
    uni.showToast({
      title: "获取聊天记录失败",
      icon: "none",
    });
  }
};

// 修改加载未读消息的函数
const loadUnreadMessages = async () => {
  try {
    const result = await uni.request({
      url: `${serverUrl}/chat/unread`,
      method: "GET",
      data: {
        userId: userInfo.value.username
      }
    });
    
    // uni.request 返回的是一个数组 [err, res]
    const [err, res] = result;
    
    if (err) {
      throw err;
    }

    if (res.statusCode === 200 && res.data.status === 'success') {
      const unreadMessages = res.data.unreadMessages;
      const friendUnread = unreadMessages.find(
        m => m.sender_id === friendInfo.value.username
      );
      unreadCount.value = friendUnread ? friendUnread.unreadCount : 0;
    } else {
      throw new Error(res.data.message || 'Failed to load unread messages');
    }
  } catch (error) {
    console.error("获取未读消息失败:", error);
    uni.showToast({
      title: "获取未读消息失败",
      icon: "none"
    });
  }
};

// 修改发送消息函数
const sendMessage = async () => {
  if (!messageText.value.trim()) return;

  const newMessage = {
    type: "text",
    sender: userInfo.value.username,
    receiver: friendInfo.value.username,
    content: messageText.value,
    time: new Date().getTime(),
    isRead: false,
    id: Date.now().toString()
  };

  // 先添加到本地消息列表和存储
  messages.value.push(newMessage);
  saveMessageToLocal(newMessage);
  messageText.value = "";
  scrollToBottom();

  try {
    const res = await uni.request({
      url: `${serverUrl}/chat/send`,
      method: "POST",
      data: {
        senderId: newMessage.sender,
        receiverId: newMessage.receiver,
        content: newMessage.content
      }
    });

    // 检查响应状态
    if (res.statusCode !== 200) {
      throw new Error(res.data.message || '发送失败');
    }

    // 发送成功，更新消息状态
    const msgIndex = messages.value.findIndex(m => m.id === newMessage.id);
    if (msgIndex !== -1) {
      messages.value[msgIndex].sent = true;
    }

  } catch (error) {
    console.error("发送消息失败:", error);
    // 标记消息发送失败
    const msgIndex = messages.value.findIndex(m => m.id === newMessage.id);
    if (msgIndex !== -1) {
      messages.value[msgIndex].sendFailed = true;
      // 更新本地存储
      const key = getLocalStorageKey(friendInfo.value.username);
      let history = uni.getStorageSync(key) || [];
      const historyIndex = history.findIndex(m => m.id === newMessage.id);
      if (historyIndex !== -1) {
        history[historyIndex].sendFailed = true;
        uni.setStorageSync(key, history);
      }
    }
    uni.showToast({
      title: "发送失败",
      icon: "none"
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

// 修改发送打卡邀请函数
const sendInvitation = async () => {
  if (!invitationContent.value.trim()) {
    uni.showToast({
      title: "请输入邀请内容",
      icon: "none"
    });
    return;
  }

  const invitation = {
    type: "invitation",
    id: Date.now().toString(),
    sender: userInfo.value.username,
    receiver: friendInfo.value.username,
    content: invitationContent.value,
    time: new Date().getTime(),
    handled: false,
    accepted: null,
    challengeData: {
      duration: challengeDuration.value,
      goal: {
        minutes: goalMinutes.value,
        calories: goalCalories.value
      },
      startTime: new Date().getTime()
    }
  };

  // 先添加到本地消息列表
  messages.value.push(invitation);
  saveMessageToLocal(invitation);
  closeInvitationDialog();
  scrollToBottom();

  try {
    const [err, res] = await uni.request({
      url: `${serverUrl}/chat/send`,
      method: "POST",
      data: {
        senderId: invitation.sender,
        receiverId: invitation.receiver,
        content: JSON.stringify(invitation)
      }
    });

    if (err) {
      throw err;
    }

    if (res.statusCode !== 200) {
      throw new Error(res.data.message || '发送失败');
    }

    // 发送成功
    uni.showToast({
      title: "邀请已发送",
      icon: "success"
    });

  } catch (error) {
    console.error("发送邀请失败:", error);
    // 标记消息发送失败
    const msgIndex = messages.value.findIndex(m => m.id === invitation.id);
    if (msgIndex !== -1) {
      messages.value[msgIndex].sendFailed = true;
      // 更新本地存储
      const key = getLocalStorageKey(friendInfo.value.username);
      let history = uni.getStorageSync(key) || [];
      const historyIndex = history.findIndex(m => m.id === invitation.id);
      if (historyIndex !== -1) {
        history[historyIndex].sendFailed = true;
        uni.setStorageSync(key, history);
      }
    }
    uni.showToast({
      title: "发送失败",
      icon: "none"
    });
  }
};

// 处理打卡邀请响应
const handleInvitation = (msg, accepted) => {
  const response = {
    type: "invitation_response",
    sender: userInfo.value.username,
    receiver: msg.sender,
    invitationId: msg.id,
    accepted,
    time: new Date().getTime(),
  };

  websocket.value.send({
    data: JSON.stringify(response),
    success: () => {
      // 更新本地消息状态
      const msgIndex = messages.value.findIndex((m) => m.id === msg.id);
      if (msgIndex !== -1) {
        messages.value[msgIndex].handled = true;
        messages.value[msgIndex].accepted = accepted;

        // 如果接受邀请，自动进入打卡界面
        if (accepted) {
          enterChallenge(messages.value[msgIndex]);
        }
      }
    },
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
const initPage = async () => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const { id, name } = currentPage.$page.options;

  friendInfo.value.username = name;

  // 先初始化WebSocket
  await initWebSocket();

  // 再加载聊天历史
  await loadChatHistory(id);

  // 最后加载未读消息
  await loadUnreadMessages();
};

// 处理滚动事件
const handleScroll = (e) => {
  const { scrollTop, scrollHeight, clientHeight } = e.detail;
  isAtBottom.value = scrollHeight - scrollTop <= clientHeight + 50;

  if (!isAtBottom.value && unreadCount.value > 0) {
    showNewMessageTip.value = true;
  } else {
    showNewMessageTip.value = false;
  }
};

// 加载更多消息
const loadMoreMessages = async () => {
  if (!hasMore.value || isLoading.value) return;

  isLoading.value = true;
  try {
    const [error, res] = await uni.request({
      url: `${serverUrl}/chat/history`,
      method: "POST",
      data: {
        userId: userInfo.value.username,
        friendId: friendInfo.value.username,
        page: currentPage.value + 1,
      },
    });

    if (error) throw error;

    if (res.statusCode === 200) {
      const { messages: newMessages, pagination } = res.data.data;
      messages.value = [...newMessages, ...messages.value];
      currentPage.value = pagination.page;
      hasMore.value = currentPage.value * pagination.limit < pagination.total;
    }
  } catch (error) {
    console.error("加载更多消息失败:", error);
  } finally {
    isLoading.value = false;
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

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

// 进入打卡挑战
const enterChallenge = (msg) => {
  uni.navigateTo({
    url: "/pages/Challenge/Challenge",
    success: () => {
      // 将挑战数传递给打卡页面
      uni.$emit("challenge-data", {
        challenger: msg.sender,
        challengeData: msg.challengeData,
        invitationId: msg.id,
      });
    },
  });
};

// 添加挑战进度更新函数
const updateChallengeProgress = (data) => {
  const msgIndex = messages.value.findIndex((m) => m.id === data.invitationId);
  if (msgIndex !== -1) {
    const msg = messages.value[msgIndex];
    if (data.sender === userInfo.value.username) {
      msg.challengeData.progress.self = data.progress;
    } else {
      msg.challengeData.progress.friend = data.progress;
    }
  }
};

// 添加新的响应式变量
const goalMinutes = ref(10);
const goalCalories = ref(80);
const challengeDuration = ref(7);

// 处理滑块变化
const onDurationChange = (e) => {
  challengeDuration.value = e.detail.value;
};

// 格式化日期
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "今天";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "昨天";
  } else {
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }
};

// 添加重发消息功能
const resendMessage = async (message) => {
  // 移除发送失败标记
  message.sendFailed = false;

  try {
    const res = await uni.request({
      url: `${serverUrl}/chat/send`,
      method: "POST",
      data: {
        senderId: message.sender,
        receiverId: message.receiver,
        content:
          message.type === "invitation"
            ? JSON.stringify(message)
            : message.content,
      },
    });

    if (res[1].statusCode !== 200) {
      message.sendFailed = true;
      uni.showToast({
        title: "重发失败",
        icon: "none",
      });
    }
  } catch (error) {
    console.error("重发消息失败:", error);
    message.sendFailed = true;
    uni.showToast({
      title: "重发失败",
      icon: "none",
    });
  }
};

onMounted(() => {
  initPage();
});

onUnmounted(() => {
  if (websocket.value) {
    websocket.value.close();
  }
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
  background: #fff;
  padding: 30rpx;
  border-radius: 20rpx;
  max-width: 80%;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

  .invitation-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
  }

  .invitation-info {
    margin: 20rpx 0;

    .invitation-content {
      font-size: 28rpx;
      color: #666;
      margin-bottom: 16rpx;
      display: block;
    }

    .challenge-info {
      background: #f8f8f8;
      padding: 20rpx;
      border-radius: 12rpx;

      text {
        display: block;
        font-size: 26rpx;
        color: #666;
        line-height: 1.8;
      }
    }
  }

  .invitation-actions {
    display: flex;
    gap: 20rpx;
    margin-top: 30rpx;

    button {
      flex: 1;
      height: 80rpx;
      line-height: 80rpx;
      border-radius: 40rpx;
      font-size: 28rpx;
      border: none;

      &.accept-btn {
        background: linear-gradient(135deg, #4cd964, #3cb371);
        color: #fff;
        box-shadow: 0 4rpx 12rpx rgba(76, 217, 100, 0.3);
      }

      &.reject-btn {
        background: #f5f5f5;
        color: #666;
      }
    }

    .handled-status {
      text-align: center;

      .handled-text {
        font-size: 26rpx;
        color: #999;
        margin-bottom: 16rpx;
        display: block;
      }

      .enter-challenge-btn {
        display: inline-block;
        background: #4cd964;
        color: #fff;
        font-size: 26rpx;
        padding: 12rpx 30rpx;
        border-radius: 30rpx;
        border: none;
        box-shadow: 0 4rpx 12rpx rgba(76, 217, 100, 0.3);

        &:active {
          transform: scale(0.95);
        }
      }
    }
  }
}

.input-tools {
  padding: 20rpx;
  border-top: 1rpx solid #eee;
  background: #fff;

  .tool-btn {
    background: none;
    padding: 16rpx;
    border-radius: 12rpx;

    &:active {
      background: #f5f5f5;
    }
  }
}

.invitation-form {
  padding: 40rpx;
  background: #fff;
  border-radius: 20rpx;
  width: 600rpx;

  .form-title {
    font-size: 36rpx;
    font-weight: bold;
    text-align: center;
    margin-bottom: 40rpx;
    color: #333;
  }

  .input-field {
    width: 100%;
    height: 88rpx;
    padding: 0 30rpx;
    background: #f8f8f8;
    border-radius: 44rpx;
    font-size: 28rpx;
    margin-bottom: 40rpx;
    border: none;
    box-sizing: border-box;
  }

  .goal-setting,
  .duration-setting {
    margin-bottom: 40rpx;

    .setting-title {
      font-size: 30rpx;
      color: #333;
      font-weight: 500;
      margin-bottom: 20rpx;
    }
  }

  .goal-inputs {
    display: flex;
    align-items: center;
    gap: 30rpx;

    .input-group {
      flex: 1;
      display: flex;
      align-items: center;
      background: #f8f8f8;
      border-radius: 44rpx;
      padding: 0 30rpx;
      height: 88rpx;

      .goal-input {
        flex: 1;
        height: 100%;
        font-size: 28rpx;
        background: transparent;
        border: none;
      }

      .unit {
        font-size: 26rpx;
        color: #666;
        margin-left: 10rpx;
        padding-right: 10rpx;
      }
    }

    .or {
      font-size: 28rpx;
      color: #999;
      font-weight: 500;
    }
  }

  .duration-slider {
    margin: 30rpx 0;
    width: 100%;
  }

  .button-group {
    display: flex;
    gap: 30rpx;
    margin-top: 60rpx;

    button {
      flex: 1;
      height: 88rpx;
      line-height: 88rpx;
      border-radius: 44rpx;
      font-size: 32rpx;
      border: none;

      &.cancel-btn {
        background: #f5f5f5;
        color: #666;
      }

      &.confirm-btn {
        background: linear-gradient(135deg, #4cd964, #3cb371);
        color: #fff;
        box-shadow: 0 4rpx 12rpx rgba(76, 217, 100, 0.3);
      }

      &:active {
        transform: scale(0.98);
      }
    }
  }
}

.unread-badge {
  position: absolute;
  top: -6rpx;
  right: -6rpx;
  min-width: 32rpx;
  height: 32rpx;
  padding: 0 6rpx;
  background: #ff4d4f;
  border-radius: 16rpx;
  color: #fff;
  font-size: 20rpx;
  line-height: 32rpx;
  text-align: center;
}

.new-message-tip {
  position: fixed;
  bottom: 120rpx;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  padding: 10rpx 20rpx;
  border-radius: 30rpx;
  display: flex;
  align-items: center;
  gap: 10rpx;
  z-index: 100;

  text {
    color: #fff;
    font-size: 24rpx;
  }
}

.date-divider {
  text-align: center;
  margin: 20rpx 0;

  text {
    background: rgba(0, 0, 0, 0.1);
    color: #999;
    font-size: 24rpx;
    padding: 4rpx 16rpx;
    border-radius: 10rpx;
  }
}

.message-status {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-top: 6rpx;

  .read-status {
    font-size: 20rpx;
    color: #999;
  }
}

.loading-more {
  text-align: center;
  padding: 20rpx;

  text {
    font-size: 24rpx;
    color: #999;
  }
}

.send-status {
  display: flex;
  align-items: center;

  .failed-text {
    font-size: 24rpx;
    color: #ff4d4f;
    margin-left: 10rpx;

    &:active {
      opacity: 0.8;
    }
  }

  .read-status {
    font-size: 24rpx;
    color: #999;
    margin-left: 10rpx;
  }
}

// 修改消息气泡样式，添加发送失败状态
.message-bubble {
  &.send-failed {
    opacity: 0.8;

    &::after {
      content: "!";
      position: absolute;
      right: -40rpx;
      top: 50%;
      transform: translateY(-50%);
      width: 32rpx;
      height: 32rpx;
      background: #ff4d4f;
      border-radius: 50%;
      color: #fff;
      font-size: 24rpx;
      line-height: 32rpx;
      text-align: center;
    }
  }
}
</style>
