<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view
        v-for="(tab, index) in tabs"
        :key="index"
        :class="['nav-item', currentTab === tab.key ? 'active' : '']"
        @click="switchTab(tab.key)"
      >
        <text>{{ tab.name }}</text>
      </view>
      <view
        class="nav-slider"
        :style="{
          transform: `translateX(${currentTab === 'friends' ? '0' : '100%'})`,
        }"
      />
    </view>

    <!-- 添加新的侧边栏触发按钮 -->
    <view
      class="sidebar-trigger"
      :class="{ hidden: isSidebarOpen }"
      @click="showSidebar"
    >
      <view class="trigger-line"></view>
      <view class="trigger-line"></view>
      <view class="trigger-line"></view>
    </view>

    <!-- 好友列表页面 -->
    <view v-if="currentTab === 'friends'" class="content">
      <!-- 搜索框 -->
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
      <scroll-view scroll-y="true" class="friends-list" :show-scrollbar="false">
        <view v-for="(group, letter) in groupedFriends" :key="letter">
          <view class="index-letter" :id="`letter-${letter}`">{{
            letter
          }}</view>

          <view v-for="friend in group" :key="friend.id" class="friend-item">
            <view class="friend-content" @click="enterChat(friend)">
              <view class="avatar-box">
                <image :src="friend.avatar || defaultAvatar" class="avatar" />
                <view
                  class="status-dot"
                  :class="{ online: friend.online, offline: !friend.online }"
                ></view>
              </view>
              <view class="info">
                <text class="name">{{ friend.username }}</text>
                <text class="signature">{{
                  friend.signature || "这个人很懒，什么都没写~"
                }}</text>
              </view>
              <view v-if="hasUnreadInvitation(friend)" class="invitation-badge">
                <uni-icons type="calendar" size="18" color="#fff" />
              </view>
              <view v-if="friend.unreadCount > 0" class="unread-badge">
                {{ friend.unreadCount > 99 ? "99+" : friend.unreadCount }}
              </view>
            </view>
          </view>
        </view>
      </scroll-view>

      <!-- 字母导航条 -->
      <!-- <view class="letter-nav">
        <text
          v-for="letter in letters"
          :key="letter"
          :class="['letter', currentLetter === letter ? 'letter-active' : '']"
          @touchstart="touchLetter(letter)"
          @touchend="endTouchLetter"
        >
          {{ letter }}
        </text>
      </view> -->

      <!-- 字母提示框 -->
      <!-- <view v-if="showLetterTip" class="letter-tip">
        {{ currentLetter }}
      </view> -->

      <!-- 添加好友弹窗 -->
      <uni-popup ref="addFriendPopup" type="dialog" @maskClick="closeAddFriend">
        <view class="add-friend-form">
          <text class="form-title">添加好友</text>
          <view class="input-wrapper">
            <uni-icons type="person-add" size="20" color="#999" />
            <input
              type="text"
              v-model="newFriendUsername"
              placeholder="请输入好友用户名"
              class="input-field"
            />
          </view>
          <view class="button-group">
            <button class="cancel-btn" @click="closeAddFriend">取消</button>
            <button class="confirm-btn" @click="confirmAddFriend">
              确认添加
            </button>
          </view>
        </view>
      </uni-popup>
    </view>

    <!-- 组队打卡页面 -->
    <view v-else class="team-content">
      <!-- 每日目标卡片 -->
      <view class="goal-card">
        <text class="card-title">每日目标</text>
        <view class="goal-options">
          <view class="goal-item">
            <text class="goal-value">10</text>
            <text class="goal-unit">min</text>
          </view>
          <text class="goal-divider">或</text>
          <view class="goal-item">
            <text class="goal-value">80</text>
            <text class="goal-unit">千卡</text>
          </view>
        </view>
      </view>

      <!-- 用户等级卡片 -->
      <view class="level-card">
        <image class="user-avatar" :src="userInfo.avatar || defaultAvatar" />
        <view class="level-info">
          <text class="level-text">LV.{{ userInfo.level || 1 }}</text>
          <progress
            class="level-progress"
            :percent="userInfo.exp || 0"
            stroke-width="4"
            color="#4B7BF9"
          />
        </view>
      </view>

      <!-- 打卡状态列表 -->
      <view class="checkin-container">
        <view class="checkin-list">
          <view
            v-for="(status, index) in checkInStatuses"
            :key="index"
            :class="['checkin-item', status.status]"
          >
            <text class="day-text">Day {{ index + 1 }}</text>
            <text class="status-text">{{ status.text }}</text>
          </view>
        </view>
      </view>

      <!-- 邀请按钮 -->
      <view
        class="invite-btn"
        @click="navigateToInvite"
        hover-class="btn-hover"
      >
        <uni-icons type="person-add" size="20" color="#fff" />
        <text class="invite-text">邀请好友一起运动</text>
      </view>
    </view>

    <!-- 侧边栏 -->
    <uni-popup ref="sidebarPopup" type="left" @maskClick="handleMaskClick">
      <view class="sidebar">
        <view class="sidebar-header">
          <text class="sidebar-title">好友管理</text>
          <!-- <uni-icons
            type="close"
            size="24"
            color="#333"
            @click="closeSidebar"
          /> -->
        </view>

        <view class="sidebar-content">
          <view class="sidebar-item" @click="showAddFriendDialog">
            <uni-icons type="personadd-filled" size="24" color="#4cd964" />
            <text>添加好友</text>
          </view>

          <view class="sidebar-item" @click="showFriendsList">
            <uni-icons type="staff-filled" size="24" color="#007aff" />
            <text>好友列表</text>
          </view>
        </view>
      </view>
    </uni-popup>

    <!-- 好友列表弹窗 -->
    <uni-popup
      ref="friendsListPopup"
      type="bottom"
      @maskClick="closeFriendsList"
    >
      <view class="friends-manage-list">
        <view class="popup-header">
          <text class="popup-title">好友列表</text>
          <uni-icons
            type="close"
            size="24"
            color="#333"
            @click="closeFriendsList"
          />
        </view>

        <scroll-view class="friends-scroll" scroll-y>
          <view
            v-for="friend in friendsList"
            :key="friend.id"
            class="friend-manage-item"
          >
            <view class="friend-info">
              <image
                :src="friend.avatar || defaultAvatar"
                class="friend-avatar"
              />
              <text class="friend-name">{{ friend.username }}</text>
            </view>
            <button class="delete-btn" @click.stop="handleDelete(friend)">
              删除
            </button>
          </view>
        </scroll-view>
      </view>
    </uni-popup>
  </view>
</template>
<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import { useWebSocketStore } from "@/store/websocket";
import { onPullDownRefresh } from "@dcloudio/uni-app";
// 添加 WebSocket 连接
const websocketUrl = uni.getStorageSync("websocketUrl");
const store = useWebSocketStore();
const tabs = [
  { key: "friends", name: "好友" },
  { key: "team", name: "组队打卡" },
];

const currentTab = ref("friends");
const searchQuery = ref("");
const currentLetter = ref("");
const showLetterTip = ref(false);
const defaultAvatar = "/static/default-avatar.png";
const serverUrl = uni.getStorageSync("serverUrl");

const letters = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
  "#",
];

const friendsList = ref([
  {
    id: 1,
    username: "Alice",
    status: "在线",
    avatar: "",
    signature: "生活就像一盒巧克力...",
  },
  {
    id: 2,
    username: "Bob",
    status: "离线",
    avatar: "",
    signature: "让运动成为习惯",
  },
]);

const touchLetter = (letter) => {
  currentLetter.value = letter;
  showLetterTip.value = true;
  scrollToLetter(letter);
};

const endTouchLetter = () => {
  setTimeout(() => {
    showLetterTip.value = false;
  }, 500);
};

// 切换标签页
const switchTab = (tab) => {
  currentTab.value = tab;
};

// 进入聊天
const enterChat = (friend) => {
  uni.setStorageSync(
    "friendInfo_" + userInfo.value.username + "_" + friend.username,
    friend
  );
  console.log("friendInfo_" + userInfo.value.username + "_" + friend.username);
  console.log("friend: ", friend);
  uni.navigateTo({
    url: `/pages/Chat/Chat?id=${friend.id}&name=${friend.username}`,
    success: () => {
      console.log("进入聊天页面");
    },
    fail: (err) => {
      console.error("打开聊天页面失败:", err);
      uni.showToast({
        title: "打开聊天失败",
        icon: "none",
      });
    },
  });
};

// 计算属性：按字母分组的好友列表
const groupedFriends = computed(() => {
  const filtered = friendsList.value.filter((friend) =>
    friend.username.toLowerCase().includes(searchQuery.value.toLowerCase())
  );

  const grouped = {};

  // 初始化字母分组
  letters.forEach((letter) => {
    grouped[letter] = [];
  });
  // 初始化 # 分组
  grouped["#"] = [];
  filtered.forEach((friend) => {
    // 获取好友名称的首字符
    const firstChar = friend.username.charAt(0).toUpperCase();

    // 判断首字符是否是字母
    if (/[A-Z]/.test(firstChar)) {
      // 如果是字母，添加到对应字母分组
      if (!grouped[firstChar]) {
        grouped[firstChar] = [];
      }
      grouped[firstChar].push(friend);
    } else {
      // 如果不是字母，添加到 # 分组
      grouped["#"].push(friend);
    }
  });

  // 删除空分组
  Object.keys(grouped).forEach((key) => {
    if (grouped[key].length === 0) {
      delete grouped[key];
    }
  });

  return grouped;
});

// 滚动到指定字母分组
const scrollToLetter = (letter) => {
  const query = uni.createSelectorQuery();
  query.select(`#letter-${letter}`).boundingClientRect();
  query.selectViewport().scrollOffset();
  query.exec((res) => {
    if (res[0]) {
      uni.pageScrollTo({
        scrollTop: res[0].top,
        duration: 0,
      });
    }
  });
};

// 删除好友
const deleteFriend = async (friendUsername) => {
  try {
    const res = await uni.request({
      url: `${serverUrl}/friends/delete`,
      method: "POST",
      data: {
        userId: uni.getStorageSync("username"),
        friendUsername,
      },
    });

    if (res.statusCode === 200) {
      // 清除本地好友列表缓存，强制从服务器重新获取
      uni.removeStorageSync("friendsList_" + uni.getStorageSync("username"));
      await loadFriendsList();

      uni.showToast({
        title: "删除成功",
        icon: "success",
      });
    }
  } catch (error) {
    console.error("删除好友失败:", error);
    uni.showToast({
      title: "删除失败",
      icon: "none",
    });
  }
};
// 添加新的响应式变量
const addFriendPopup = ref(null);
const newFriendUsername = ref("");

// 显示添加好友弹窗
const showAddFriend = () => {
  addFriendPopup.value.open();
};

// 关闭添加好友弹窗
const closeAddFriend = () => {
  newFriendUsername.value = "";
  addFriendPopup.value.close();
  // 显示导航栏和侧边栏按钮
  setTimeout(() => {
    isSidebarOpen.value = false;
    uni.showTabBar({
      animation: true,
    });
  }, 300);
};

// 确认添加好友
const confirmAddFriend = async () => {
  if (!newFriendUsername.value) {
    uni.showToast({
      title: "请输入用户名",
      icon: "none",
    });
    return;
  }

  try {
    const res = await uni.request({
      url: `${serverUrl}/friends/add`,
      method: "POST",
      header: {
        "Content-Type": "application/json",
      },
      data: {
        userId: uni.getStorageSync("username"),
        friendUsername: newFriendUsername.value,
      },
    });

    if (res.statusCode === 200 && res.data.status === "success") {
      uni.showToast({
        title: "添加成功",
        icon: "success",
      });
      closeAddFriend();

      // 清除本地好友列表缓存，强制从服务器重新获取
      uni.removeStorageSync("friendsList");
      await loadFriendsList();
    } else {
      let errorMessage = "添加失败";
      if (res.data.message === "Friend not found") {
        errorMessage = "用户不存在";
      } else if (res.data.message === "Already friends") {
        errorMessage = "已经是好友了";
      } else if (res.data.message === "Cannot add yourself as friend") {
        errorMessage = "不能添加自己为好友";
      }
      uni.showToast({
        title: errorMessage,
        icon: "none",
      });
    }
  } catch (error) {
    console.error("添加好友失败:", error);
    uni.showToast({
      title: "网络请求失败",
      icon: "none",
    });
  }
};

// 修改加载好友列表函数
const loadFriendsList = async () => {
  try {
    const username = uni.getStorageSync("username");
    if (!username) {
      throw new Error("用户未登录");
    }

    // 先尝试从本地获取好友列表
    // const localFriends = uni.getStorageSync("friendsList");

    // if (localFriends && localFriends.length > 0) {
    //   // 使用本地数据，只更新在线状态
    //   friendsList.value = localFriends.map(friend => ({
    //     ...friend,
    //     online: store.getFriendStatus(friend.username).isOnline
    //   }));

    //   // 加载未读消息数
    //   loadUnreadCounts();
    //   console.log("从本地加载的好友列表:", friendsList.value);
    //   return;
    // }

    // 如果本地没有数据，才从服务器获取
    const res = await uni.request({
      url: `${serverUrl}/friends`,
      method: "GET",
      data: {
        userId: username,
      },
    });

    if (res.statusCode === 200) {
      // 格式化好友列表数据
      const formattedFriends = res.data.map((friend) => ({
        ...friend,
        online: store.getFriendStatus(friend.username).isOnline,
        unreadCount: 0, // 初始化未读消息数
      }));

      // 保存到本地存储
      uni.setStorageSync("friendsList_" + username, formattedFriends);

      // 更新响���式数据
      friendsList.value = formattedFriends;

      // 立即加载未读消息数
      loadUnreadCounts();

      console.log("从服务器更新的好友列表:", friendsList.value);
    } else {
      throw new Error(res.data.message || "获取好友列表失败");
    }
  } catch (error) {
    console.error("获取好友列表失败:", error);
    uni.showToast({
      title: "获取好友列表失败",
      icon: "none",
    });
  }
};

// 修改加载未读消息数的函数
const loadUnreadCounts = async () => {
  const currentUser = uni.getStorageSync("username");

  friendsList.value = friendsList.value.map((friend) => {
    const key = `chat_history_${currentUser}_${friend.username}`;
    const history = uni.getStorageSync(key) || [];

    // 计算未读消息数
    const unreadCount = history.filter(
      (msg) => msg.sender === friend.username && !msg.isRead
    ).length;

    console.log(`好友 ${friend.username} 的未读消息数:`, unreadCount);
    console.log(`聊天历史:`, history);

    return {
      ...friend,
      unreadCount,
    };
  });
};

onMounted(async () => {
  await loadFriendsList();
  // 每600秒刷新一次好友列表
  if (!store.isConnected) {
    console.log("websocket未连接，尝试新连接");
    store.initWebSocket();
  }

  // 监听未读消息更新事件
  uni.$on("updateUnreadCounts", () => {
    console.log("收到未读消息更新事件");
    loadUnreadCounts();
  });
});
onPullDownRefresh(async () => {
  console.log("refresh");
  await loadFriendsList();
  await loadUnreadCounts();
  setTimeout(() => {
    uni.stopPullDownRefresh();
  }, 1000);
});
onUnmounted(() => {
  // 清除定时器
  // if (refreshInterval) {
  //   clearInterval(refreshInterval);
  // }
  uni.$off("updateUnreadCounts");
});

// 组队打卡相关数据
const teamList = ref([
  {
    id: 1,
    name: "早起健身团",
    description: "每天清晨6点相约运动",
    memberCount: 8,
    maxMembers: 10,
    checkInDays: 15,
    avatar: "/static/team/team1.png",
  },
  {
    id: 2,
    name: "夜跑小队",
    description: "晚上8点夜跑活动",
    memberCount: 5,
    maxMembers: 8,
    checkInDays: 7,
    avatar: "/static/team/team2.png",
  },
]);

// 创建队伍
const createTeam = () => {
  uni.navigateTo({
    url: "/pages/CreateTeam/CreateTeam",
  });
};

// 加入队伍
const joinTeam = (team) => {
  if (team.memberCount >= team.maxMembers) {
    uni.showToast({
      title: "队伍已满",
      icon: "none",
    });
    return;
  }

  uni.showModal({
    title: "加入队伍",
    content: `确定要加入"${team.name}"吗？`,
    success: (res) => {
      if (res.confirm) {
        // 这里添加加入队伍的逻辑
        uni.showToast({
          title: "加入成功",
          icon: "success",
        });
      }
    },
  });
};

// 用户信息
const userInfo = ref({
  username: uni.getStorageSync("username"),
  avatar:
    uni.getStorageSync("userInfo")?.avatar || "/static/default-avatar.jpg",
});

// 更新打卡状态数据
const checkInStatuses = ref([
  { text: "待打卡", status: "pending", day: 1 },
  { text: "已完成", status: "completed", day: 2 },
  { text: "已完成", status: "completed", day: 3 },
  { text: "已完成", status: "completed", day: 4 },
  { text: "已完成", status: "completed", day: 5 },
  { text: "待打卡", status: "pending", day: 6 },
  { text: "待打卡", status: "pending", day: 7 },
]);

// 跳转到邀请好友页面
const navigateToInvite = () => {
  uni.navigateTo({
    url: "/pages/InviteFriends/InviteFriends",
  });
};

// 监听好友状态变化
uni.$on("friendStatusChanged", ({ username, status }) => {
  // 更新好友列表中的状态
  const friendIndex = friendsList.value.findIndex(
    (f) => f.username === username
  );
  if (friendIndex !== -1) {
    friendsList.value[friendIndex].online = status === "online";
  }
});
// 添加删除处理函数
const handleDelete = (friend) => {
  uni.showModal({
    title: "删除好友",
    content: `确定要删除好友 ${friend.username} 吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await uni.request({
            url: `${serverUrl}/friends/delete`,
            method: "POST",
            data: {
              userId: uni.getStorageSync("username"),
              friendUsername: friend.username,
            },
          });

          if (result.statusCode === 200) {
            // 清除本地好友列表缓存
            uni.removeStorageSync(
              "friendsList_" + uni.getStorageSync("username")
            );
            // 清空与好友的聊天记录
            uni.removeStorageSync(
              `chat_history_${uni.getStorageSync("username")}_${
                friend.username
              }`
            );
            // 重新加载好友列表
            await loadFriendsList();

            uni.showToast({
              title: "删除成功",
              icon: "success",
            });
          } else {
            throw new Error("删除失败");
          }
        } catch (error) {
          console.error("删除好友失败:", error);
          uni.showToast({
            title: "删除失败",
            icon: "none",
          });
        }
      }
    },
  });
};

// 添加侧边栏相关的响应式变量和方法
const sidebarPopup = ref(null);
const friendsListPopup = ref(null);

// 添加控制按钮显示的响应式变量
const isSidebarOpen = ref(false);

// 修改显示侧边栏的方法
const showSidebar = () => {
  isSidebarOpen.value = true;
  // 隐藏导航栏
  uni.hideTabBar({
    animation: true,
  });
  sidebarPopup.value.open();
};

// 修改关闭侧边栏的方法
const closeSidebar = () => {
  sidebarPopup.value.close();
  // 添加延时，等待侧边栏关闭动画完成后再显示按钮和导航栏
  setTimeout(() => {
    isSidebarOpen.value = false;
    // 显示导航栏
    uni.showTabBar({
      animation: true,
    });
  }, 300);
};

// 修改其他打开弹窗的方法
const showAddFriendDialog = () => {
  sidebarPopup.value.close();
  // 隐藏导航栏
  uni.hideTabBar({
    animation: true,
  });
  setTimeout(() => {
    addFriendPopup.value.open();
  }, 300);
};

// 修改显示好友列表的方法
const showFriendsList = () => {
  sidebarPopup.value.close();
  // 隐藏导航栏
  uni.hideTabBar({
    animation: true,
  });
  setTimeout(() => {
    friendsListPopup.value.open();
  }, 300);
};

// 修改关闭好友列表的方法
const closeFriendsList = () => {
  friendsListPopup.value.close();
  // 显示导航栏和侧边栏按钮
  setTimeout(() => {
    isSidebarOpen.value = false;
    uni.showTabBar({
      animation: true,
    });
  }, 300);
};

// 添加遮罩点击处理
const handleMaskClick = () => {
  closeSidebar();
};

// 修改检查未读打卡邀请的方法
const hasUnreadInvitation = (friend) => {
  const currentUser = uni.getStorageSync("username");
  const key = `chat_history_${currentUser}_${friend.username}`;
  const history = uni.getStorageSync(key);
  
  // 确保 history 是数组
  if (!Array.isArray(history)) return false;
  
  return history.some(msg => 
    msg.type === 'invitation' && 
    msg.sender === friend.username && 
    !msg.isRead
  );
};
</script>

<style lang="scss">
.container {
  height: 100vh;
  // height:auto;
  background: #f8f8f8;
}

.nav-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  position: relative;
  display: flex;
  padding: 20rpx 40rpx;
  background: #fff;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.nav-item {
  flex: 1;
  text-align: center;
  font-size: 32rpx;
  color: #666;
  padding: 20rpx 0;
  transition: all 0.3s;
}

.nav-item.active {
  color: #12b7f5;
  font-weight: 500;
}

.nav-slider {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50%;
  height: 4rpx;
  background: #12b7f5;
  transition: transform 0.3s;
}

.content {
  height: calc(100vh - 88rpx);
}

.search-box {
  margin: 20rpx;
  padding: 20rpx 30rpx;
  background: #fff;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.search-input {
  flex: 1;
  margin-left: 20rpx;
  font-size: 28rpx;
}

.friends-list {
  width: 92%;
  height: calc(100% - 120rpx);
  padding: 0 30rpx;
}

.index-letter {
  padding: 16rpx 20rpx;
  font-size: 24rpx;
  color: #999;
}

.friend-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  padding: 20rpx 30rpx;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

  .friend-content {
    flex: 1;
    display: flex;
    align-items: center;
    padding-right: 20rpx;
    position: relative;
  }

  .action-buttons {
    display: flex;
    align-items: center;
    gap: 10rpx;

    .delete-btn {
      min-width: 100rpx;
      height: 60rpx;
      line-height: 60rpx;
      padding: 0 20rpx;
      background: #ff4d4f;
      color: #fff;
      font-size: 24rpx;
      border-radius: 30rpx;
      border: none;

      &:active {
        opacity: 0.8;
      }
    }
  }

  .avatar-box {
    position: relative;
    margin-right: 20rpx;

    .avatar {
      width: 100rpx;
      height: 100rpx;
      border-radius: 50%;
      background: #f0f0f0;
    }

    .online-dot {
      position: absolute;
      right: 0;
      bottom: 0;
      width: 20rpx;
      height: 20rpx;
      background: #4cd964;
      border: 4rpx solid #fff;
      border-radius: 50%;
    }

    .status-dot {
      position: absolute;
      right: 0;
      bottom: 0;
      width: 20rpx;
      height: 20rpx;
      border-radius: 50%;
      border: 4rpx solid #fff;
      box-shadow: 0 0 4rpx rgba(0, 0, 0, 0.2);

      &.online {
        background-color: #4cd964; // 在线状态为绿色
      }

      &.offline {
        background-color: #ff3b30; // 离线状态为红色
      }
    }
  }

  .info {
    flex: 1;

    .name {
      font-size: 32rpx;
      font-weight: 500;
      color: #333;
      margin-bottom: 8rpx;
    }

    .signature {
      font-size: 24rpx;
      color: #999;
    }
  }

  &:active {
    transform: scale(0.98);
    background: #f9f9f9;
  }

  .unread-badge {
    position: absolute;
    right: 20rpx;
    top: 50%;
    transform: translateY(-50%);
    min-width: 40rpx;
    height: 40rpx;
    padding: 0 10rpx;
    background: #ff4d4f;
    border-radius: 20rpx;
    color: #fff;
    font-size: 24rpx;
    line-height: 40rpx;
    text-align: center;
    font-weight: 500;
    box-shadow: 0 2rpx 8rpx rgba(255, 77, 79, 0.3);

    // 添加动画效果
    animation: badge-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}

.friend-item-hover {
  transform: scale(0.98);
  background: #f5f5f5;
}

// .letter-nav {
//   position: fixed;
//   right: 20rpx;
//   top: 65%;
//   transform: translateY(-50%);
//   background: rgba(255, 255, 255, 0.9);
//   padding: 20rpx 10rpx;
//   border-radius: 30rpx;
//   box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);

//   .letter {
//     display: block;
//     width: 40rpx;
//     height: 40rpx;
//     line-height: 40rpx;
//     text-align: center;
//     font-size: 24rpx;
//     color: #666;

//     &.letter-active {
//       color: #4cd964;
//       font-weight: bold;
//       background: #e8f7eb;
//       border-radius: 20rpx;
//     }
//   }
// }

// .letter-tip {
//   position: fixed;
//   left: 50%;
//   top: 50%;
//   transform: translate(-50%, -50%);
//   width: 160rpx;
//   height: 160rpx;
//   background: rgba(0, 0, 0, 0.7);
//   border-radius: 20rpx;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   font-size: 80rpx;
//   color: #fff;
//   font-weight: bold;
// }

.team-content {
  padding: 30rpx;
  background: #f8f8f8;
}

.goal-card {
  background: #000;
  padding: 30rpx;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
}

.card-title {
  color: #fff;
  font-size: 28rpx;
  margin-bottom: 20rpx;
}

.goal-options {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30rpx;
}

.goal-item {
  display: flex;
  align-items: baseline;
}

.goal-value {
  color: #4b7bf9;
  font-size: 40rpx;
  font-weight: bold;
}

.goal-unit {
  color: #4b7bf9;
  font-size: 24rpx;
  margin-left: 4rpx;
}

.goal-divider {
  color: #666;
  font-size: 24rpx;
}

.level-card {
  background: #fff;
  padding: 30rpx;
  border-radius: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30rpx;
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  margin-bottom: 20rpx;
  border: 4rpx solid #4b7bf9;
}

.level-info {
  width: 200rpx;
  text-align: center;
}

.level-text {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 10rpx;
}

.level-progress {
  width: 100%;
  border-radius: 10rpx;
}

.checkin-container {
  background: #fff;
  padding: 30rpx;
  border-radius: 20rpx;
  margin-bottom: 30rpx;
}

.checkin-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.checkin-item {
  padding: 24rpx;
  border-radius: 12rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.checkin-item.completed {
  background: #4b7bf9;
}

.checkin-item.pending {
  background: #f5f5f5;
}

.day-text {
  font-size: 28rpx;
  color: #333;
}

.status-text {
  font-size: 28rpx;
}

.checkin-item.completed .day-text,
.checkin-item.completed .status-text {
  color: #fff;
}

.checkin-item.pending .status-text {
  color: #999;
}

.invite-btn {
  background: linear-gradient(135deg, #4cd964, #3cb371);
  padding: 30rpx;
  border-radius: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  box-shadow: 0 4rpx 20rpx rgba(76, 217, 100, 0.3);
  transition: all 0.2s;
}

.invite-text {
  color: #fff;
  font-size: 32rpx;
}

.btn-hover {
  transform: scale(0.98);
  opacity: 0.9;
}

.add-friend-form {
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

  .input-wrapper {
    display: flex;
    align-items: center;
    background: #f8f8f8;
    border-radius: 44rpx;
    padding: 0 30rpx;
    margin-bottom: 40rpx;

    .input-field {
      flex: 1;
      height: 88rpx;
      font-size: 28rpx;
      margin-left: 20rpx;
      background: transparent;
    }
  }

  .button-group {
    display: flex;
    gap: 30rpx;

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

// 添加新好友动画
.friend-item-enter-active {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.friend-item {
  // ... 其他样式保持不变 ...

  .friend-avatar {
    position: relative;

    .online-indicator {
      position: absolute;
      right: 0;
      bottom: 0;
      width: 16rpx;
      height: 16rpx;
      border-radius: 50%;
      background: #999;
      border: 2rpx solid #fff;

      &.is-online {
        background: #4cd964;
      }
    }
  }

  .friend-info {
    position: relative;

    .unread-badge {
      position: absolute;
      right: -10rpx;
      top: -10rpx;
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
  }
}

.unread-badge {
  position: absolute;
  right: 20rpx;
  top: 50%;
  transform: translateY(-50%);
  min-width: 40rpx;
  height: 40rpx;
  padding: 0 10rpx;
  background: #ff4d4f;
  border-radius: 20rpx;
  color: #fff;
  font-size: 24rpx;
  line-height: 40rpx;
  text-align: center;
}

// 添加弹出动画
@keyframes badge-pop {
  0% {
    transform: translateY(-50%) scale(0);
    opacity: 0;
  }
  100% {
    transform: translateY(-50%) scale(1);
    opacity: 1;
  }
}

// 添加侧边栏样式
.sidebar {
  width: 500rpx;
  height: 100vh;
  background: #fff;
  padding: 30rpx;
  box-shadow: 0 0 20rpx rgba(0, 0, 0, 0.1);

  .sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 30rpx;
    border-bottom: 1rpx solid #eee;

    .sidebar-title {
      font-size: 32rpx;
      font-weight: 500;
    }
  }

  .sidebar-content {
    margin-top: 30rpx;

    .sidebar-item {
      display: flex;
      align-items: center;
      padding: 30rpx 0;
      border-bottom: 1rpx solid #eee;

      text {
        margin-left: 20rpx;
        font-size: 28rpx;
        color: #333;
      }

      &:active {
        background: #f5f5f5;
      }
    }
  }
}

// 好友管理列表样式
.friends-manage-list {
  background: #fff;
  border-radius: 20rpx 20rpx 0 0;
  padding: 30rpx;
  height: 70vh; // 固定高度为屏幕高度的70%
  display: flex;
  flex-direction: column; // 使用flex布局

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 20rpx;
    border-bottom: 1rpx solid #eee;

    .popup-title {
      font-size: 32rpx;
      font-weight: 500;
    }
  }

  .friends-scroll {
    flex: 1; // 占据剩余空间
    overflow-y: auto; // 允许垂直滚动
    padding: 20rpx 0;
    -webkit-overflow-scrolling: touch; // 优化iOS滚动
  }

  .friend-manage-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #eee;

    .friend-info {
      display: flex;
      align-items: center;

      .friend-avatar {
        width: 80rpx;
        height: 80rpx;
        border-radius: 50%;
        margin-right: 20rpx;
      }

      .friend-name {
        font-size: 28rpx;
        color: #333;
      }
    }

    .delete-btn {
      min-width: 120rpx;
      height: 56rpx;
      line-height: 56rpx;
      padding: 0 20rpx;
      background: #ff4d4f;
      color: #fff;
      font-size: 24rpx;
      border-radius: 28rpx;
      margin: 0;
    }
  }
}

// 修改侧边栏触发按钮样式
.sidebar-trigger {
  position: fixed;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 40rpx;
  height: 80rpx;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 0 20rpx 20rpx 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 6rpx;
  padding: 10rpx;
  z-index: 100;
  transition: all 0.3s;

  &.hidden {
    opacity: 0;
    transform: translateY(-50%) translateX(-100%);
    pointer-events: none;
  }

  &:active {
    background: rgba(0, 0, 0, 0.8);
  }

  .trigger-line {
    width: 20rpx;
    height: 2rpx;
    background: #fff;
    border-radius: 2rpx;
  }
}

.invitation-badge {
  position: absolute;
  top: 50%;
  right: 95rpx;
  transform: translateY(-50%);
  width: 48rpx;
  height: 48rpx;
  background: #ff4d4f;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
