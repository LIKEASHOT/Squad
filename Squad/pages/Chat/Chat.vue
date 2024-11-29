<template>
  <view class="chat-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-left" @click="goBack">
        <uni-icons type="left" size="20" color="#000" />
      </view>
      <view class="nav-title">
        <text class="friend-name">{{ friendInfo.username }}</text>
        <text class="online-status" :class="{ online: friendInfo.online }">
          {{ friendInfo.online ? "在线" : "离线" }}
        </text>
      </view>
      <view class="nav-right" @click="showMoreMenu">
        <uni-icons type="more-filled" size="20" color="#000" />
      </view>
    </view>

    <!-- 聊天区域 -->
    <view class="chat-body">
      <!-- 消息列表 -->
      <scroll-view
        class="message-list"
        scroll-y="true"
        :scroll-top="scrollTop"
        @scroll="handleScroll"
      >
        <view v-for="(group, date) in groupedMessages" :key="date">
          <!-- 日期分割线 -->
          <view class="time-divider">
            <text>{{ formatDate(date) }}</text>
          </view>

          <!-- 消息气泡 -->
          <view
            v-for="msg in group"
            :key="msg.id"
            :id="'msg-' + msg.id"
            class="message-item"
            :class="[msg.sender === userInfo.username ? 'self' : 'friend']"
          >
            <image
              class="avatar"
              :src="
                msg.sender === userInfo.username
                  ? userInfo.avatar
                  : friendInfo.avatar
              "
            />
            <view class="message-wrapper">
              <!-- 文本消息 -->
              <view
                v-if="msg.type === 'text'"
                class="message-bubble"
                @click="handleMessageClick(msg)"
              >
                <text class="message-text">{{ msg.content }}</text>
              </view>

              <!-- 打卡邀请消息 -->
              <view
                v-else-if="msg.type === 'invitation'"
                class="invitation-bubble"
              >
                <view class="invitation-card">
                  <view class="invitation-header">
                    <uni-icons type="calendar-filled" size="20" color="#4CD964" />
                    <text class="invitation-title">运动打卡挑战</text>
                  </view>
                  <view class="card-content">
                    <text class="invitation-text">{{ msg.content }}</text>
                    <view class="challenge-details">
                      <view class="detail-item">
                        <text class="icon">🎯</text>
                        <text class="label">挑战天数</text>
                        <text class="value">{{ msg.duration }}天</text>
                      </view>
                      <view class="detail-item">
                        <text class="icon">⏱️</text>
                        <text class="label">每日目标</text>
                        <text class="value">{{ msg.minutes }}分钟</text>
                      </view>
                      <view class="detail-item">
                        <text class="icon">🔥</text>
                        <text class="label">消耗目标</text>
                        <text class="value">{{ msg.calories }}千卡</text>
                      </view>
                    </view>
                  </view>
                  <view v-if="msg.sender === userInfo.username" class="invitation-status">
                    <template v-if="!msg.handled">
                      <uni-icons type="waiting" size="16" color="#999" />
                      <text class="waiting">等待对方接受</text>
                    </template>
                    <template v-else>
                      <uni-icons 
                        :type="msg.accepted ? 'checkmarkempty' : 'closeempty'" 
                        size="16" 
                        :color="msg.accepted ? '#4CD964' : '#999'" 
                      />
                      <text :class="{ accepted: msg.accepted }">
                        {{ msg.accepted ? '对方已接受挑战' : '对方已拒绝' }}
                      </text>
                    </template>
                  </view>
                  <view 
                    v-else-if="!msg.handled" 
                    class="invitation-actions"
                  >
                    <button class="accept-btn" @click="handleAcceptInvitation(msg)">
                      <text class="btn-text">接受</text>
                    </button>
                    <button class="reject-btn" @click="handleRejectInvitation(msg)">
                      <text class="btn-text">婉拒</text>
                    </button>
                  </view>
                  <view v-else class="invitation-status" :class="{ accepted: msg.accepted }">
                    <uni-icons 
                      :type="msg.accepted ? 'checkmarkempty' : 'closeempty'" 
                      size="16" 
                      :color="msg.accepted ? '#4CD964' : '#999'" 
                    />
                    <text>{{ msg.accepted ? '已接受挑战' : '已婉拒' }}</text>
                  </view>
                </view>
              </view>

              <!-- 消息状态 -->
              <view class="message-status">
                <text class="time">{{ formatTime(msg.time) }}</text>
                <text
                  v-if="msg.sender === userInfo.username"
                  :class="[
                    'status',
                    { read: msg.isRead, failed: msg.sendFailed },
                  ]"
                >
                  {{
                    msg.sendFailed ? "发送失败" : msg.isRead ? "已读" : "未读"
                  }}
                </text>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 底部输入区域 -->
    <view class="chat-footer" v-if="input_status === true">
      <view class="input-box">
        <input
          type="text"
          v-model="messageText"
          placeholder="输入消息..."
          @confirm="sendMessage"
        />
        <button class="send-btn" @click="sendMessage">发送</button>
      </view>
    </view>

    <!-- 打卡邀请弹窗 -->
    <uni-popup
      ref="invitationPopup"
      type="bottom"
      @maskClick="handleMenuClick('resetChatBox')"
    >
      <view class="invitation-form">
        <view class="form-header">
          <text class="title">发起打卡挑战</text>
          <uni-icons
            type="close"
            size="20"
            color="#999"
            @click="closeInvitationDialog"
          />
        </view>
        <view class="form-content">
          <view class="input-group">
            <text class="label">邀请内容</text>
            <textarea
              v-model="invitationContent"
              placeholder="写点什么来邀请好友..."
              class="content-input"
            />
          </view>
          <view class="goal-group">
            <text class="label">每日目标</text>
            <view class="goal-inputs">
              <view class="input-item">
                <input
                  type="number"
                  v-model="goalMinutes"
                  class="number-input"
                />
                <text class="unit">分钟</text>
              </view>
              <text class="divider">或</text>
              <view class="input-item">
                <input
                  type="number"
                  v-model="goalCalories"
                  class="number-input"
                />
                <text class="unit">千卡</text>
              </view>
            </view>
          </view>
          <view class="duration-group">
            <text class="label">挑战天数: {{ challengeDuration }}天</text>
            <slider
              :min="1"
              :max="30"
              :value="challengeDuration"
              :step="1"
              @change="onDurationChange"
              activeColor="#4CD964"
              class="duration-slider"
            />
          </view>
        </view>
        <view class="form-footer">
          <button class="cancel-btn" @click="closeInvitationDialog">
            取消
          </button>
          <button class="submit-btn" @click="sendInvitation">发送邀请</button>
        </view>
      </view>
    </uni-popup>

    <!-- 底部弹出菜单 -->
    <uni-popup
      ref="moreMenuPopup"
      type="bottom"
      @maskClick="handleMenuClick('resetChatBox')"
    >
      <view class="menu-list">
        <view class="menu-item" @click="handleMenuClick('clearHistory')">
          <uni-icons type="trash" size="20" color="#FF4D4F" />
          <text>清除聊天记录</text>
        </view>
        <view class="menu-item" @click="handleMenuClick('sendInvitation')">
          <uni-icons type="calendar" size="20" color="#4CD964" />
          <text>发起打卡挑战</text>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed, watch } from "vue";
import { useWebSocketStore } from "@/store/websocket";
const input_status = ref(true);
// const serverUrl = "http://10.133.80.141:3000";
const serverUrl = uni.getStorageSync("serverUrl");
// const websocketUrl = 'ws://10.133.80.141:3001';
const websocketUrl = uni.getStorageSync("websocketUrl");

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
    uni.getStorageSync("userInfo")?.avatar || "/static/default-avatar.jpg",
});
const friendInfo = ref({
  username: "",
  avatar: "/static/default-avatar.jpg",
  online: false,
  level: 1,
  exp: 0,
});

const old_scrollTop = ref(0);
// 添加新的响应式变量
const unreadCount = ref(0);
const showNewMessageTip = ref(false);
const isLoading = ref(false);
const isAtBottom = ref(true);
const currentPage = ref(1);

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
const store = useWebSocketStore();


const deal_with_invitation = (data) => {
    console.log("发送了打卡邀请:", data);
    // 先加载本地消息
    const localMessages = getLocalMessages(friendInfo.value.username);
    messages.value = localMessages;
};
// 发送消息
const sendMessage = async () => {
  if (!messageText.value.trim()) return;
  // console.log("friendInfo:", friendInfo.value);
  const newMessage = {
    type: "text",
    id: Date.now().toString(),
    sender: userInfo.value.username,
    receiver: friendInfo.value.username,
    content: messageText.value.trim(),
    time: new Date().getTime(),
    isRead: false,
    sendFailed: false,
  };
  try {
    messages.value.push(newMessage);
    saveMessageToLocal(newMessage);
    messageText.value = "";
    // 使用全局 WebSocket 发送消息
    if (store.isConnected) {
      store.websocket.send({
        data: JSON.stringify(newMessage),
        success: () => console.log("消息发送成功:", newMessage),
        fail: (error) => {
          console.error("发送消息失败:", error);
          markMessageAsFailed(newMessage.id);
        },
      });
    } else {
      console.warn("WebSocket未连接");
      store.initWebSocket();
      markMessageAsFailed(newMessage.id);
    }
  } catch (error) {
    console.error("发送消息失败:", error);
    markMessageAsFailed(newMessage.id);
  }
  // 使用 uniapp 的滚动方式
  nextTick(() => {
    scrollTop.value = 9999999;
  });
};

// 添加标记消息失败的函数
const markMessageAsFailed = (messageId) => {
  const msgIndex = messages.value.findIndex((m) => m.id === messageId);
  if (msgIndex !== -1) {
    messages.value[msgIndex].sendFailed = true;
    // 更新本地存储
    const key = getLocalStorageKey(friendInfo.value.username);
    let history = uni.getStorageSync(key) || [];
    const historyIndex = history.findIndex((m) => m.id === messageId);
    if (historyIndex !== -1) {
      history[historyIndex].sendFailed = true;
      uni.setStorageSync(key, history);
    }
  }
  uni.showToast({
    title: "发送失败",
    icon: "none",
  });
};

// 显示打卡邀请弹窗
const showInvitationDialog = () => {
  invitationPopup.value.open();
};

// 关闭打卡邀请弹窗
const closeInvitationDialog = () => {
  invitationPopup.value.close();
  invitationContent.value = "";
  input_status.value = true;
};

// 修改发送卡邀请函数
const sendInvitation = () => {
  if (!invitationContent.value.trim()) {
    uni.showToast({
      title: "请输入邀请内容",
      icon: "none",
    });
    return;
  }

  // 构建打卡邀请消息
  const invitation = {
    type: 'invitation',
    id: Date.now().toString(),
    sender: userInfo.value.username,
    receiver: friendInfo.value.username,
    content: invitationContent.value.trim(),
    time: new Date().getTime(),
    handled: false,
    accepted: null,
    isRead: false,
    sendFailed: false,
    challengeData: {
      duration: challengeDuration.value,
      goal: {
        minutes: goalMinutes.value,
        calories: goalCalories.value
      },
      startTime: new Date().getTime()
    }
  };

  // 通过 WebSocket 发送邀请
  if (store.isConnected) {
    store.sendInvitation(invitation);
    closeInvitationDialog();
    uni.showToast({
      title: '邀请已发送',
      icon: 'success'
    });
  } else {
    uni.showToast({
      title: '发送失败',
      icon: 'none'
    });
    store.initWebSocket();
  }
};

// 处理打卡邀请响应
const handleInvitation = (data) => {
  try {
    const invitation = data;
    console.log("处理打卡邀请:", invitation);
    if (
      (data.sender === friendInfo.value.username &&
        data.receiver === userInfo.value.username) ||
      (data.sender === userInfo.value.username &&
        data.receiver === friendInfo.value.username)
    ) {
      // 如果是接收到的新消息，且时间戳大于最后已读时间戳，则标记为未读
      const isUnread =
        data.sender === friendInfo.value.username &&
        data.time > lastReadTimestamp.value;
      invitation.isRead = !isUnread;
      
      // 添加到消息列表
      messages.value.push(invitation);

      // 保存到本地
      // saveMessageToLocal(invitation);

      // 滚动到底部
      scrollToBottom();
    }
  } catch (error) {
    console.error('处理打卡邀请失败:', error, data);
  }
};

// 获取路由数并初始化
const initPage = async () => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const { id, name } = currentPage.$page.options;

  friendInfo.value.username = name;

  // 先加载本地消息
  const localMessages = getLocalMessages(name);
  // console.log("localMessages: " + localMessages);
  for (const msg of localMessages) {
    console.log("msg: " + msg);
  }
  if (localMessages.length > 0) {
    messages.value = localMessages;
    scrollToBottom();
  }

  // 加载服务器消息和未读消息
  // await Promise.all([loadChatHistory(name), loadUnreadMessages()]);
};

// 修改处理滚动事件的函数
const handleScroll = (e) => {
  // 只要发生滚动就标记所有消息为已读
  markAllMessagesAsRead();
  old_scrollTop.value = e.detail.scrollTop;
};

// 添加一个变量记录最后标记已读的时间戳
const lastReadTimestamp = ref(0);

// 优化后的标记已读函数
const markAllMessagesAsRead = () => {
  const key = `chat_history_${userInfo.value.username}_${friendInfo.value.username}`;
  let history = uni.getStorageSync(key) || [];

  // 获取最新的未读消息时间戳
  const latestUnreadMessage = history
    .filter((msg) => msg.sender === friendInfo.value.username && !msg.isRead)
    .reduce(
      (latest, current) =>
        !latest || current.time > latest.time ? current : latest,
      null
    );

  // 如果没有新的未读消息，或者时间戳没有变化，直接返回
  if (
    !latestUnreadMessage ||
    latestUnreadMessage.time <= lastReadTimestamp.value
  ) {
    return;
  }

  // 更新最后已读时间戳
  lastReadTimestamp.value = latestUnreadMessage.time;

  // 批量更新所有消息状态
  uni.setStorageSync(
    key,
    history.map((msg) => {
      if (msg.sender === friendInfo.value.username && !msg.isRead) {
        return { ...msg, isRead: true };
      }
      return msg;
    })
  );

  // 发送已读回执
  if (store.isConnected) {
    store.websocket.send({
      data: JSON.stringify({
        type: "read_ack",
        sender: userInfo.value.username,
        receiver: friendInfo.value.username,
        time: lastReadTimestamp.value,
      }),
    });
  }

  // 触发未读消息计数更新
  uni.$emit("updateUnreadCounts");
};

// 修改 onMounted 钩子
onMounted(() => {
  initPage();
  nextTick(() => {
    scrollToBottom(false);
    // 页面加载完成后标记所有消息为已读
    markAllMessagesAsRead();
  });
  // 监听好友状态变化
  uni.$on("friendStatusChanged", ({ username, status }) => {
    if (username === friendInfo.value.username) {
      friendInfo.value.online = status === "online";
    }
  });
  uni.$on("showMyInvitation", (data) => {
    deal_with_invitation(data);
  });
  // 修改接收新消息的处理
uni.$on("websocketMessage", (data) => {
  try {
    console.log("收到WebSocket消息:", data);

    switch (data.type) {
      case "text":
        // 检查消息是否属于当前聊天
        if (
          (data.sender === friendInfo.value.username &&
            data.receiver === userInfo.value.username) ||
          (data.sender === userInfo.value.username &&
            data.receiver === friendInfo.value.username)
        ) {
          // 如果是接收到的新消息，且时间戳大于最后已读时间戳，则标记为未读
          const isUnread =
            data.sender === friendInfo.value.username &&
            data.time > lastReadTimestamp.value;

          // 添加到消息列表
          messages.value.push({
            ...data,
            isRead: !isUnread,
          });

          // 保存到本地
          // saveMessageToLocal({
          //   ...data,
          //   isRead: !isUnread,
          // });

          // 滚动到底部
          nextTick(() => {
            scrollTop.value = 99999;
          });
        }
        break;

      case "read_ack":
        // 处理已读回执
        if (data.sender === friendInfo.value.username) {
          handleReadAck(data);
        }
        break;
      case "invitation":
        // 处理打卡邀请
        if (data.sender === friendInfo.value.username) {
          handleInvitation(data);
        }
        break;
    }
  } catch (error) {
    console.error("处理WebSocket消息失败:", error);
  }
});
  userInfo.value.username = uni.getStorageSync("username");
  userInfo.value.avatar = uni.getStorageSync(
    "userInfo_" + userInfo.value.username
  ).avatar;
  friendInfo.value.avatar = uni.getStorageSync(
    "friendInfo_" + userInfo.value.username + "_" + friendInfo.value.username
  ).avatar;
  console.log("friendInfo.value.avatar: " + friendInfo.value.avatar);
  // 设置好友在线状态
  const status = store.getFriendStatus(friendInfo.value.username);

  friendInfo.value.online = status.isOnline;
});

// 修改滚动到底部函数
const scrollToBottom = (smooth = true) => {
  scrollTop.value = old_scrollTop.value;
  nextTick(() => {
    scrollTop.value = 999999;
    // 标记所有消息为已读
    markAllMessagesAsRead();
  });
};

// 格式化时间
const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
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
      // 将挑战传递给打卡页面
      uni.$emit("challenge-data", {
        challenger: msg.sender,
        challengeData: msg.challengeData,
        invitationId: msg.id,
      });
    },
  });
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

// 修改重发消息的函数
const resendMessage = async (message) => {
  // 移除发送失败标记
  message.sendFailed = false;

  try {
    if (store.isConnected) {
      store.websocket.send({
        data: JSON.stringify({
          ...message,
          time: Date.now(), // 更新发送时间
        }),
        success: () => {
          // 更新本地消息状态
          const key = getLocalStorageKey(friendInfo.value.username);
          let history = uni.getStorageSync(key) || [];
          history = history.map((msg) => {
            if (msg.id === message.id) {
              return {
                ...msg,
                sendFailed: false,
                time: message.time,
              };
            }
            return msg;
          });
          uni.setStorageSync(key, history);

          // 更新视图中的消息状态
          const msgIndex = messages.value.findIndex((m) => m.id === message.id);
          if (msgIndex !== -1) {
            messages.value[msgIndex].sendFailed = false;
            messages.value[msgIndex].time = message.time;
          }

          console.log("消息重发成功:", message);
        },
        fail: (error) => {
          console.error("重发消息失败:", error);
          markMessageAsFailed(message.id);
          uni.showToast({
            title: "重发失败",
            icon: "none",
          });
        },
      });
    } else {
      console.warn("WebSocket未连接");
      store.initWebSocket();
      markMessageAsFailed(message.id);
      uni.showToast({
        title: "网络未连接",
        icon: "none",
      });
    }
  } catch (error) {
    console.error("重发消息失败:", error);
    markMessageAsFailed(message.id);
    uni.showToast({
      title: "重发失败",
      icon: "none",
    });
  }
};

// 添加消息点击事件处理
const handleMessageClick = (message) => {
  if (message.sendFailed && message.sender === userInfo.value.username) {
    uni.showModal({
      title: "重发消息",
      content: "是否重新发送该消息？",
      success: (res) => {
        if (res.confirm) {
          resendMessage(message);
        }
      },
    });
  }
};

// 添加处理已读回执的函数
const handleReadAck = (data) => {
  console.log("处理已读回执:", data);

  // 更新所有发送给该接收者且时间早于已读时间的未读消息状态
  messages.value = messages.value.map((msg) => {
    if (
      msg.sender === userInfo.value.username &&
      msg.receiver === data.sender &&
      !msg.isRead &&
      msg.time <= data.time
    ) {
      return { ...msg, isRead: true };
    }
    return msg;
  });

  // 更新本地存储
  const key = getLocalStorageKey(friendInfo.value.username);
  let history = uni.getStorageSync(key) || [];
  history = history.map((msg) => {
    if (
      msg.sender === userInfo.value.username &&
      msg.receiver === data.sender &&
      !msg.isRead &&
      msg.time <= data.time
    ) {
      return { ...msg, isRead: true };
    }
    return msg;
  });
  uni.setStorageSync(key, history);
};

// 在 script setup 中添加清除聊天记录函数
const clearHistory = () => {
  uni.showModal({
    title: "清除聊天记录",
    content: "确定要清除与该好友的所有聊天记录吗？",
    success: (res) => {
      if (res.confirm) {
        // 清除本地存储
        const key = getLocalStorageKey(friendInfo.value.username);
        uni.removeStorageSync(key);
        // 清空消息列表
        messages.value = [];
        // 显示提示
        uni.showToast({
          title: "聊天记录已清除",
          icon: "success",
        });
      }
    },
  });
  input_status.value = true;
};

// 添加显示菜单的方法
const moreMenuPopup = ref(null);
const showMoreMenu = () => {
  moreMenuPopup.value.open();
  input_status.value = false;
};

const handleMenuClick = (action) => {
  // 先关闭菜单
  moreMenuPopup.value.close();
  // 延迟执行操作，确保菜单已关闭
  setTimeout(() => {
    switch (action) {
      case "clearHistory":
        clearHistory();
        break;
      case "sendInvitation":
        showInvitationDialog();
        break;
      case "resetChatBox":
        input_status.value = true;
        break;

      default:
        console.warn(`未知的操作: ${action}`);
    }
  }, 100);
};

// 添加监听消息列表变化的处理
watch(
  () => messages.value.length,
  () => {
    if (isAtBottom.value) {
      scrollToBottom();
    }
  }
);

// 添加获取本地存储key的函数
const getLocalStorageKey = (friendUsername) => {
  const currentUser = uni.getStorageSync("username");
  return `chat_history_${currentUser}_${friendUsername}`;
};

// 修改保存消息到本地的函数
const saveMessageToLocal = (message) => {
  const key = getLocalStorageKey(friendInfo.value.username);
  let history = uni.getStorageSync(key) || [];

  // 避免重复消息
  if (!history.some((msg) => msg.id === message.id)) {
    history.push(message);
    uni.setStorageSync(key, history);
  }
};

// 添加从本地获取消息的函数
const getLocalMessages = (friendUsername) => {
  const key = getLocalStorageKey(friendUsername);
  return uni.getStorageSync(key) || [];
};



// 在组件卸载时移除事件监听
onUnmounted(() => {
  uni.$off("websocketMessage");
  uni.$off("showMyInvitation");
  uni.$off("friendStatusChanged");
});

// 添加监听消息可见性的函数
const observeMessageVisibility = () => {
  const observer = uni.createIntersectionObserver();

  observer.relativeTo(".message-list").observe(".message-item", (entries) => {
    entries.forEach((entry) => {
      if (entry.intersectionRatio > 0) {
        // 消息进入可视区域
        const messageId = entry.dataset.id;
        markMessageAsRead(messageId);
      }
    });
  });

  return observer;
};

// 单条消息标记已读
const markMessageAsRead = (messageId) => {
  const key = `chat_history_${userInfo.value.username}_${friendInfo.value.username}`;
  let history = uni.getStorageSync(key) || [];

  const message = history.find((msg) => msg.id === messageId);
  if (
    message &&
    message.sender === friendInfo.value.username &&
    !message.isRead
  ) {
    // 更新本地消息状态
    history = history.map((msg) => {
      if (msg.id === messageId) {
        return { ...msg, isRead: true };
      }
      return msg;
    });

    // 保存更新后的历史记录
    uni.setStorageSync(key, history);

    // 发送已读回执
    if (store.isConnected) {
      store.websocket.send({
        data: JSON.stringify({
          type: "read_ack",
          sender: userInfo.value.username,
          receiver: friendInfo.value.username,
          messageId: messageId,
          time: message.time,
        }),
      });
    }

    // 触发未读消息计数更新
    uni.$emit("updateUnreadCounts");
  }
};

// 修改处理接受邀请的函数
const handleAcceptInvitation = async (msg) => {
  // 构建接受回执消息
  const response = {
    type: "invitation_response",
    id: Date.now().toString(),
    invitationId: msg.id,
    sender: userInfo.value.username,
    receiver: msg.sender,
    content: "已接受运动挑战邀请",
    time: new Date().getTime(),
    accepted: true
  };

  try {
    // 发送回执
    store.websocket.send({
      data: JSON.stringify(response)
    });

    // 更新本地消息状态
    msg.handled = true;
    msg.accepted = true;
    store.saveMessageToLocal(msg);

    // 显示接受提示
    uni.showToast({
      title: "已接受邀请",
      icon: "success"
    });

    // 跳转到打卡页面
    setTimeout(() => {
      uni.navigateTo({
        url: `/pages/Home/Home?challenge=${encodeURIComponent(JSON.stringify({
          duration: msg.duration,
          minutes: msg.minutes,
          calories: msg.calories,
          startTime: msg.startTime,
          partner: msg.sender
        }))}`
      });
    }, 1500);

  } catch (error) {
    console.error('处理打卡邀请失败:', error);
    uni.showToast({
      title: '操作失败',
      icon: 'none'
    });
  }
};

// 处理拒绝邀请
const handleRejectInvitation = (msg) => {
  // 构建拒绝回执消息
  const response = {
    type: "invitation_response",
    id: Date.now().toString(),
    invitationId: msg.id,
    sender: userInfo.username,
    receiver: msg.sender,
    content: "已拒绝运动挑战邀请",
    time: new Date().getTime(),
    accepted: false,
  };

  // 发送回执
  store.websocket.send({
    data: JSON.stringify(response),
  });

  // 更新本地消息状态
  msg.handled = true;
  msg.accepted = false;
  store.saveMessageToLocal(msg);

  uni.showToast({
    title: "已拒绝邀请",
    icon: "none",
  });
};
</script>

<style lang="scss" scoped>
.chat-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f7f7f7;
}

// 顶部导航栏
.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 88rpx;
  background: #ffffff;
  display: flex;
  align-items: center;
  padding: 0 30rpx;
  z-index: 100;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);

  .nav-left,
  .nav-right {
    width: 80rpx;
    display: flex;
    align-items: center;
  }

  .nav-title {
    flex: 1;
    text-align: center;

    .friend-name {
      font-size: 34rpx;
      font-weight: 500;
      color: #333;
    }

    .online-status {
      font-size: 24rpx;
      color: #999;
      margin-left: 10rpx;

      &.online {
        color: #4cd964;
      }
    }
  }
}

// 聊天内容区域
.chat-body {
  flex: 1;
  padding: 20rpx;
  margin-top: 88rpx; // 顶部导航栏高度
  margin-bottom: 120rpx; // 底部输入框高度
}

.message-list {
  height: calc(100vh - 235rpx); // 减去顶部栏和底部栏的高度
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;

  .time-divider {
    text-align: center;
    margin: 20rpx 0;

    text {
      font-size: 24rpx;
      color: #999;
      background: rgba(0, 0, 0, 0.1);
      padding: 4rpx 16rpx;
      border-radius: 8rpx;
    }
  }
}

.message-item {
  display: flex;
  margin-bottom: 30rpx;

  &.self {
    flex-direction: row-reverse;

    .message-bubble {
      background: #95ec69;
      margin-right: 20rpx;

      &:before {
        right: -16rpx;
        border-left-color: #95ec69;
      }
    }
  }

  &.friend {
    .message-bubble {
      background: #ffffff;
      margin-left: 20rpx;

      &:before {
        left: -16rpx;
        border-right-color: #ffffff;
      }
    }
  }
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 8rpx;
}

.message-wrapper {
  max-width: 70%;
}

.message-bubble {
  padding: 20rpx;
  border-radius: 8rpx;
  position: relative;
  word-break: break-all;

  &:before {
    content: "";
    position: absolute;
    top: 20rpx;
    border: 8rpx solid transparent;
  }
}

.message-status {
  font-size: 24rpx;
  color: #999;
  margin-top: 6rpx;
  text-align: right;

  .status {
    margin-left: 10rpx;
    color: #999; // 未读状态的颜色

    &.read {
      color: #4cd964; // 已读状态的颜色
    }

    &.failed {
      color: #ff4d4f; // 发送失败状态的颜色
    }
  }
}

.chat-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 20rpx;
  border-top: 1rpx solid #eee;
  z-index: 100;

  .input-box {
    display: flex;
    align-items: center;
    gap: 20rpx;

    input {
      flex: 1;
      height: 72rpx;
      background: #f5f5f5;
      border-radius: 36rpx;
      padding: 0 30rpx;
      font-size: 28rpx;
    }

    .send-btn {
      width: 120rpx;
      height: 72rpx;
      background: #4cd964;
      color: #fff;
      border-radius: 36rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28rpx;
      border: none;
    }
  }
}

.invitation-card {
  background: #ffffff;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);

  .card-header {
    background: #f8f8f8;
    padding: 20rpx;
    display: flex;
    align-items: center;
    gap: 10rpx;
  }

  .card-content {
    padding: 20rpx;
  }

  .challenge-details {
    margin: 20rpx 0;
    display: flex;
    flex-direction: column;
    gap: 10rpx;
  }

  .card-actions {
    display: flex;
    gap: 20rpx;

    .action-btn {
      flex: 1;
      height: 72rpx;
      line-height: 72rpx;
      text-align: center;
      border-radius: 8rpx;
      font-size: 28rpx;

      &.accept {
        background: #4cd964;
        color: #ffffff;
      }

      &.reject {
        background: #f5f5f5;
        color: #666666;
      }
    }
  }
}

// 修改菜单样式
.menu-list {
  background: #fff;
  border-radius: 16rpx 16rpx 0 0;
  overflow: hidden;
  padding: 20rpx 0;

  .menu-item {
    display: flex;
    align-items: center;
    padding: 24rpx 32rpx;
    margin-bottom: 10rpx;

    text {
      margin-left: 20rpx;
      font-size: 32rpx;
      color: #333;
    }

    &:active {
      background: #f5f5f5;
    }
  }
}

// 修改打卡邀请弹窗样式
.invitation-form {
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  overflow: hidden;

  .form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 32rpx;
    border-bottom: 1rpx solid #eee;

    .title {
      font-size: 36rpx;
      font-weight: 500;
      color: #333;
    }
  }

  .form-content {
    padding: 32rpx;

    .input-group,
    .goal-group,
    .duration-group {
      margin-bottom: 32rpx;

      .label {
        font-size: 28rpx;
        color: #666;
        margin-bottom: 16rpx;
        display: block;
      }
    }

    .content-input {
      width: 100%;
      height: 160rpx;
      padding: 20rpx;
      background: #f8f8f8;
      border-radius: 12rpx;
      font-size: 28rpx;
    }

    .goal-inputs {
      display: flex;
      align-items: center;
      gap: 20rpx;

      .input-item {
        flex: 1;
        display: flex;
        align-items: center;
        background: #f8f8f8;
        border-radius: 12rpx;
        padding: 16rpx;

        .number-input {
          flex: 1;
          font-size: 28rpx;
          text-align: center;
        }

        .unit {
          font-size: 24rpx;
          color: #999;
          margin-left: 8rpx;
        }
      }

      .divider {
        color: #999;
        font-size: 24rpx;
      }
    }

    .duration-slider {
      margin-top: 20rpx;
    }
  }

  .form-footer {
    display: flex;
    padding: 32rpx;
    gap: 20rpx;
    border-top: 1rpx solid #eee;

    button {
      flex: 1;
      height: 88rpx;
      line-height: 88rpx;
      text-align: center;
      border-radius: 44rpx;
      font-size: 32rpx;

      &.cancel-btn {
        background: #f5f5f5;
        color: #666;
      }

      &.submit-btn {
        background: linear-gradient(135deg, #4cd964, #3cb371);
        color: #fff;
      }
    }
  }
}

// ... 其他样式保持不变

.invitation-bubble {
  max-width: 500rpx;
  
  .invitation-card {
    background: #fff;
    border-radius: 16rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
    
    .invitation-header {
      background: linear-gradient(135deg, #4CD964, #3CB371);
      padding: 20rpx;
      display: flex;
      align-items: center;
      gap: 12rpx;
      
      .invitation-title {
        color: #fff;
        font-size: 32rpx;
        font-weight: 600;
      }
    }
    
    .card-content {
      padding: 24rpx;
      
      .invitation-text {
        font-size: 28rpx;
        color: #333;
        margin-bottom: 20rpx;
        display: block;
      }
      
      .challenge-details {
        background: #f8f8f8;
        border-radius: 12rpx;
        padding: 16rpx;
        
        .detail-item {
          display: flex;
          align-items: center;
          margin-bottom: 12rpx;
          
          &:last-child {
            margin-bottom: 0;
          }
          
          .icon {
            font-size: 32rpx;
            margin-right: 12rpx;
          }
          
          .label {
            color: #666;
            font-size: 26rpx;
            flex: 1;
          }
          
          .value {
            color: #333;
            font-size: 28rpx;
            font-weight: 600;
          }
        }
      }
    }
    
    .invitation-actions {
      display: flex;
      padding: 20rpx;
      gap: 16rpx;
      border-top: 1rpx solid #eee;
      
      button {
        flex: 1;
        height: 72rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 36rpx;
        border: none;
        
        .btn-text {
          font-size: 28rpx;
        }
        
        &.accept-btn {
          background: linear-gradient(135deg, #4CD964, #3CB371);
          color: #fff;
          
          &:active {
            opacity: 0.9;
          }
        }
        
        &.reject-btn {
          background: #f5f5f5;
          color: #666;
          
          &:active {
            background: #eee;
          }
        }
      }
    }
    
    .invitation-status {
      padding: 16rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8rpx;
      color: #999;
      font-size: 26rpx;
      border-top: 1rpx solid #eee;
      
      &.accepted {
        color: #4CD964;
      }
      
      .waiting {
        color: #999;
      }
      
      .uni-icons {
        &.waiting {
          animation: rotating 2s linear infinite;
        }
      }
    }
  }
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
