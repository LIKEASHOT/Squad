// 创建 WebSocket store
import { defineStore } from "pinia";

export const useWebSocketStore = defineStore("websocket", {
  state: () => ({
    websocket: null,
    isConnected: false,
    reconnectAttempts: 0,
    maxReconnectAttempts: 5,
    friendsStatus: new Map(), // 存储好友在线状态
  }),

  actions: {
    initWebSocket() {
      try {
        const websocketUrl = uni.getStorageSync("websocketUrl");
        const username = uni.getStorageSync("username");

        if (!username) {
          console.error("未找到用户信息，无法建立WebSocket连接");
          return;
        }

        this.websocket = uni.connectSocket({
          url: websocketUrl,
          success: () => {
            console.log("WebSocket连接成功");
            this.reconnectAttempts = 0; // 重置重连次数
          },
        });

        this.websocket.onOpen(() => {
          console.log("WebSocket连接已打开");
          this.isConnected = true; 
          // 发送认证消息
          this.websocket.send({
            data: JSON.stringify({
              type: "auth",
              username: username,
            }),
          });
        });

        this.websocket.onClose(() => {
          console.log("WebSocket连接已关闭");
          this.isConnected = false;
          // 添加重连逻辑
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            setTimeout(() => {
              console.log(`尝试第 ${this.reconnectAttempts + 1} 次重连...`);
              this.reconnectAttempts++;
              this.initWebSocket();
            }, 3000);
          }
        });

        this.websocket.onError((error) => {
          console.error("WebSocket错误:", error);
          this.isConnected = false;
        });

        this.websocket.onMessage((res) => {
          try {
            const data = JSON.parse(res.data);
            if (data.type !== "ai_plan") {
              console.log("收到WebSocket消息:", data);
            }

            switch (data.type) {
              case "text":
                // 保存消息到本地
                this.saveMessageToLocal({
                  ...data,
                  isRead: false,
                  sendFailed: false,
                });
                // 更新未读消息计数
                this.updateUnreadCounts();
                // 广播消息给所有组件
                uni.$emit("websocketMessage", data);
                break;

              case "read_ack":
                // 广播已读回执给所有组件
                uni.$emit("websocketMessage", data);
                break;

              case "status":
                this.handleStatusMessage(data);
                break;

              case "friends_status":
                if (Array.isArray(data.statuses)) {
                  data.statuses.forEach((status) => {
                    this.handleStatusMessage(status);
                  });
                }
                break;

              case "offline_messages":
                // 处理离线消息
                if (Array.isArray(data.messages)) {
                  data.messages.forEach((msg) => {
                    this.saveMessageToLocal({
                      ...msg,
                      isRead: false,
                      sendFailed: false,
                    });
                  });
                  // 更新未读消息计数
                  this.updateUnreadCounts();
                }
                break;

              case "ai_plan":
                // 广播 AI 计划消息给组件
                uni.$emit("aiPlanMessage", data);
                break;

              case "invitation":
                this.handleInvitation(data);
                break;

              case "invitation_response":
                this.handleInvitationResponse(data);
                break;
            }
          } catch (error) {
            console.error("处理WebSocket消息失败:", error);
          }
        });
      } catch (error) {
        console.error("初始化WebSocket失败:", error);
      }
    },

    closeWebSocket() {
      if (this.websocket) {
        this.websocket.close();
        this.websocket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
      }
    },

    // 添加处理状态消息的方法
    handleStatusMessage(data) {
      console.log("处理状态消息:", data);
      // 更新好友状态
      this.friendsStatus.set(data.username, {
        isOnline: data.status === "online",
        lastActive: data.timestamp,
      });

      // 触发状态更新事件，通知相关组件
      uni.$emit("friendStatusChanged", {
        username: data.username,
        status: data.status,
      });
    },

    // 获取好友在线状态
    getFriendStatus(username) {
      return this.friendsStatus.get(username) || { isOnline: false };
    },

    // 修改保存消息到本地的函数
    saveMessageToLocal(message) {
      if (!message) return;
      console.log("保存消息:", message);
      const currentUser = uni.getStorageSync("username");
      // 确保消息属于当前用户
      if (message.receiver !== currentUser && message.sender !== currentUser) {
        return;
      }

      try {
        // 构建正确的存储key
        const key = `chat_history_${message.receiver}_${message.sender}`;
        console.log("保存消息使用的key:", key);

        let history = uni.getStorageSync(key) || [];
        // console.log('当前历史记录:', history);

        // 避免重复消息
        if (!history.some((msg) => msg.id === message.id)) {
          // 保存完整的消息对象
          const newMessage = {
            ...message,
            isRead: message.receiver !== currentUser, // 如果是发送的消息，标记为已读
            sendFailed: false,
            time: message.time || message.timestamp || Date.now(),
          };

          history.push(newMessage);
          console.log("添加新消息:", newMessage);

          // 按时间排序
          history.sort((a, b) => (a.time || 0) - (b.time || 0));

          // 保存到本地存储
          uni.setStorageSync(key, history);

          // 如果是接收到的新消息，更新未读计数
          if (message.receiver === currentUser) {
            console.log("触发未读消息计数更新");
            this.updateUnreadCounts();
          }
        }
      } catch (error) {
        console.error("保存消息到本地失败:", error, message);
      }
    },

    // 修改更新未读消息计数的函数
    updateUnreadCounts() {
      try {
        const username = uni.getStorageSync("username");
        const friends = uni.getStorageSync("friendsList_" + username) || [];
        let updated = false;
        console.log("当前好友列表:", friends);
        friends.forEach((friend) => {
          const key = `chat_history_${username}_${friend.username}`;
          const history = uni.getStorageSync(key) || [];

          // 计算未读消息数
          const unreadCount = history.filter(
            (msg) => msg && msg.sender === friend.username && !msg.isRead
          ).length;

          // 只有当未读数发生变化时才更新
          if (friend.unreadCount !== unreadCount) {
            friend.unreadCount = unreadCount;
            updated = true;
            console.log("更新未读消息计数:", friend.username, unreadCount);
          }
        });

        // 只有当有变化时才保存和触发更新
        if (updated) {
          uni.setStorageSync("friendsList_" + username, friends);
          uni.$emit("updateUnreadCounts");
        }
      } catch (error) {
        console.error("更新未读消息计数失败:", error);
      }
    },

    // 添加处理 AI 计划消息的方法
    handleAiPlanMessage(data) {
      if (data.type === "ai_plan") {
        // 广播 AI 计划消息
        uni.$emit("aiPlanMessage", data);
      }
    },

    // 发送 AI 计划请求
    sendAiPlanRequest(prompt) {
      if (this.isConnected && this.websocket) {
        this.websocket.send({
          data: JSON.stringify({
            type: "ai_plan_request",
            prompt,
            username: uni.getStorageSync("username"),
          }),
        });
      } else {
        console.error("WebSocket未连接");
        this.initWebSocket();
      }
    },

    // 发送打卡邀请
    sendInvitation(data) {
      if (this.isConnected && this.websocket) {
        // 构建要发送的消息对象
        // const messageToSend = {
        //   type: data.type,
        //   id: data.id,
        //   sender: data.sender,
        //   receiver: data.receiver,
        //   content: data.content,
        //   time: data.time,
        //   message_data: JSON.stringify({
        //     duration: data.challengeData.duration,
        //     goal: {
        //       minutes: data.challengeData.goal.minutes,
        //       calories: data.challengeData.goal.calories
        //     },
        //     startTime: data.challengeData.startTime
        //   })
        // };

        // 发送消息
        this.websocket.send({
          data: JSON.stringify(data)
        });

        // 构建本地存储的消息对象
        const invitation = {
          type: data.type,
          id: data.id,
          sender: data.sender,
          receiver: data.receiver,
          content: data.content,
          time: data.time,
          handled: false,
          accepted: null,
          duration: data.challengeData.duration,
          calories: data.challengeData.goal.calories,
          minutes: data.challengeData.goal.minutes,
          startTime: data.challengeData.startTime,
          isRead: false,
          sendFailed: false
        };
        console.log("invitation: " + JSON.stringify(invitation));
        // 保存到本地聊天记录
        const key = `chat_history_${data.sender}_${data.receiver}`;
        let history = uni.getStorageSync(key) || [];
        // 避免重复消息
        if (!history.some((msg) => msg.id === invitation.id)) {
          history.push(invitation);
          uni.setStorageSync(key, history);
        }

        // 广播给自己的聊天界面
        uni.$emit('showMyInvitation', invitation);
      } else {
        console.error('WebSocket未连接');
        this.initWebSocket();
      }
    },

    // 处理收到的打卡邀请
    handleInvitation(data) {
      try {
        // 解析 message_data 字符串为对象
        const messageData = data.message_data
          ? JSON.parse(data.message_data)
          : {
              duration: 7,
              goal: {
                minutes: 10,
                calories: 80,
              },
              startTime: Date.now(),
            };

        // 构建邀请消息对象
        const invitation = {
          type: data.type,
          id: data.id,
          sender: data.sender,
          receiver: data.receiver,
          content: data.content,
          time: data.time,
          handled: false,
          accepted: null,
          duration: messageData.duration,
          calories: messageData.goal.calories,
          minutes: messageData.goal.minutes,
          startTime: messageData.startTime,
          isRead: false,
          sendFailed: false,
        };
        this.saveMessageToLocal(invitation);
        this.updateUnreadCounts();
        // uni.$emit("receivedInvitation", data);
        // 广播邀请消息给组件
        uni.$emit("websocketMessage", invitation);
      } catch (error) {
        console.error("处理打卡邀请失败:", error);
      }
    },

    // 修改消息处理函数
    handleInvitationResponse(data) {
      try {
        // 找到原始邀请消息并更新状态
        const currentUser = uni.getStorageSync("username");
        const key = `chat_history_${currentUser}_${data.sender}`;
        let history = uni.getStorageSync(key) || [];

        const invitationIndex = history.findIndex(
          (msg) => msg.type === "invitation" && msg.id === data.invitationId
        );
        if (invitationIndex !== -1) {
          history[invitationIndex].handled = true;
          history[invitationIndex].accepted = data.accepted;
          uni.setStorageSync(key, history);
        }

        // 更新未读消息计数
        this.updateUnreadCounts();
        // 广播消息给所有组件
        uni.$emit("websocketMessage", data);
      } catch (error) {
        console.error("处理WebSocket消息失败:", error);
      }
    },
  },
});

// 添加辅助函数来检查本地存储
const checkLocalStorage = () => {
  const currentUser = uni.getStorageSync("username");
  const friends = uni.getStorageSync("friendsList") || [];

  friends.forEach((friend) => {
    const key = `chat_history_${currentUser}_${friend.username}`;
    const history = uni.getStorageSync(key) || [];
    console.log(`${friend.username} 的聊天记录:`, history);
  });
};

// 在适当的地方调用这个函数进行检查
// checkLocalStorage();
