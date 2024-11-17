<template>
	<view class="container">
	  <!-- 顶部搜索 -->
	  <view class="search-box">
		<uni-icons type="search" size="18" color="#999"/>
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
		  @click="inviteFriend(friend)"
		>
		  <view class="friend-info">
			<image :src="friend.avatar || defaultAvatar" class="avatar"/>
			<text class="name">{{ friend.username }}</text>
		  </view>
		  <button 
			class="invite-btn"
			:class="{ 'invited': friend.invited }"
			@click.stop="inviteFriend(friend)"
		  >
			{{ friend.invited ? '已邀请' : '邀请' }}
		  </button>
		</view>
	  </scroll-view>
	</view>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  
  const searchQuery = ref('');
  const defaultAvatar = '/static/avatar/default.png';
  
  // 好友列表数据
  const friendsList = ref([
	{ id: 1, username: 'Alice', avatar: '', invited: false },
	{ id: 2, username: 'Bob', avatar: '', invited: false },
	// ... 更多好友数据
  ]);
  
  // 搜索过滤
  const filteredFriends = computed(() => {
	return friendsList.value.filter(friend => 
	  friend.username.toLowerCase().includes(searchQuery.value.toLowerCase())
	);
  });
  
  // 邀请好友
  const inviteFriend = (friend) => {
	if (friend.invited) return;
	
	friend.invited = true;
	uni.showToast({
	  title: `已邀请 ${friend.username}`,
	  icon: 'success'
	});
	
	// TODO: 发送邀请的API调用
  };
  </script>
  
  <style>
  .container {
	padding: 30rpx;
	background: #f8f8f8;
	min-height: 100vh;
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
	height: calc(100vh - 180rpx);
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
	background: #4CD964;
	color: #fff;
	padding: 12rpx 40rpx;
	border-radius: 100rpx;
	font-size: 28rpx;
	border: none;
	margin: 0;
	min-width: 140rpx;
  }
  
  .invite-btn.invited {
	background: #ccc;
  }
  
  .friend-item-hover {
	background: #f5f5f5;
  }
  </style>