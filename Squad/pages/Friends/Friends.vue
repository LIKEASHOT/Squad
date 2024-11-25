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
          <!-- 字母索引 -->
          <view class="index-letter" :id="`letter-${letter}`">{{
            letter
          }}</view>

          <!-- 好友项 -->
          <view
            v-for="friend in group"
            :key="friend.id"
            class="friend-item"
            hover-class="friend-item-hover"
            @click="enterChat(friend)"
          >
            <view class="avatar-box">
              <image :src="friend.avatar || defaultAvatar" class="avatar" />
              <view v-if="friend.status === '在线'" class="online-dot" />
            </view>
            <view class="info">
              <text class="name">{{ friend.username }}</text>
              <text class="signature">{{
                friend.signature || "这个人很懒，什么都没写~"
              }}</text>
            </view>
          </view>
        </view>
      </scroll-view>

      <!-- 字母导航条 -->
      <view class="letter-nav">
        <text
          v-for="letter in letters"
          :key="letter"
          :class="['letter', currentLetter === letter ? 'letter-active' : '']"
          @touchstart="touchLetter(letter)"
          @touchend="endTouchLetter"
        >
          {{ letter }}
        </text>
      </view>

      <!-- 字母提示框 -->
      <view v-if="showLetterTip" class="letter-tip">
        {{ currentLetter }}
      </view>

      <!-- 添加好友按钮 -->
      <view class="add-btn" @click="showAddFriend" hover-class="btn-hover">
        <uni-icons type="plus" size="24" color="#fff" />
      </view>
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
  </view>
</template>

<script setup>
import { ref, computed } from "vue";

const tabs = [
  { key: "friends", name: "好友" },
  { key: "team", name: "组队打卡" },
];

const currentTab = ref("friends");
const searchQuery = ref("");
const currentLetter = ref("");
const showLetterTip = ref(false);
const defaultAvatar = "/static/avatar/default.png";

// 字母表
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
];

// 模拟好友数据
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
  // ... 更多好友数据
]);

// 处理字母导航触摸
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
  letters.forEach((letter) => {
    const friends = filtered.filter((friend) =>
      friend.username.toUpperCase().startsWith(letter)
    );
    if (friends.length > 0) {
      grouped[letter] = friends;
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
const deleteFriend = async (friend) => {
  try {
    const res = await uni.showModal({
      title: "提示",
      content: `确定要删除好友 ${friend.username} 吗？`,
    });

    if (res.confirm) {
      friendsList.value = friendsList.value.filter((f) => f.id !== friend.id);
      uni.showToast({
        title: "删除成功",
        icon: "success",
      });
    }
  } catch (error) {
    console.error("删除好友失败:", error);
    uni.showToast({
      title: "操作失败",
      icon: "none",
    });
  }
};

// 打开聊天
const chatWithFriend = (friend) => {
  uni.showToast({
    title: "聊天功能开发中",
    icon: "none",
  });
};

// 显示添加好友弹窗
const showAddFriend = () => {
  addFriendPopup.value.open();
};

// 关闭添加好友弹窗
const closeAddFriend = () => {
  newFriendUsername.value = "";
  addFriendPopup.value.close();
};

// 确认添加好友
const confirmAddFriend = () => {
  if (!newFriendUsername.value) {
    uni.showToast({
      title: "请输入用户名",
      icon: "none",
    });
    return;
  }

  // 模拟添加好友
  const newFriend = {
    id: friendsList.value.length + 1,
    username: newFriendUsername.value,
    status: "在线",
    avatar: defaultAvatar,
  };

  friendsList.value.push(newFriend);
  uni.showToast({
    title: "添加成功",
    icon: "success",
  });
  closeAddFriend();
};

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
  avatar: "",
  level: 1,
  exp: 45, // 当前等级进度
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
</script>

<style>
.container {
  height: 100vh;
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
  height: calc(100% - 120rpx);
  padding: 0 30rpx;
}

.index-letter {
  padding: 16rpx 20rpx;
  font-size: 24rpx;
  color: #999;
}

.friend-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  margin-bottom: 20rpx;
  background: #fff;
  border-radius: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
}

.friend-item-hover {
  transform: scale(0.98);
  background: #f5f5f5;
}

.avatar-box {
  position: relative;
}

.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: #f0f0f0;
}

.online-dot {
  position: absolute;
  right: 4rpx;
  bottom: 4rpx;
  width: 16rpx;
  height: 16rpx;
  background: #07c160;
  border: 4rpx solid #fff;
  border-radius: 50%;
}

.info {
  flex: 1;
  margin-left: 24rpx;
}

.name {
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
}

.signature {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.letter-nav {
  position: fixed;
  right: 20rpx;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  padding: 20rpx 10rpx;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.letter {
  padding: 8rpx;
  font-size: 24rpx;
  color: #666;
  transition: all 0.2s;
}

.letter-active {
  color: #12b7f5;
  font-weight: 500;
  transform: scale(1.2);
}

.letter-tip {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 160rpx;
  height: 160rpx;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 80rpx;
  color: #fff;
}

.add-btn {
  position: fixed;
  right: 40rpx;
  bottom: 120rpx;
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #12b7f5, #0e9bd4);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 20rpx rgba(18, 183, 245, 0.3);
  transition: all 0.2s;
}

.btn-hover {
  transform: scale(0.95);
  box-shadow: 0 2rpx 10rpx rgba(18, 183, 245, 0.2);
}

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
</style>
