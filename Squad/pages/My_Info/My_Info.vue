<template>
  <view class="container">
    <!-- 头部信息卡片 -->
    <view class="info-card">
		<!-- 添加设置按钮 -->
		<view class="header">
		  <text class="header-title">个人信息</text>
		  <button class="settings-btn" @click="goToSettings">
		    ⚙️
		  </button>
		</view>
      <view class="avatar-section">
        <image :src="userInfo.avatar || defaultAvatar" class="avatar" @click="changeAvatar"></image>
        <text class="username">{{ userInfo.username || '未登录' }}</text>
      </view>
    </view>
	
     <view class="info-section"> 
        <view class="section-header">
          <text class="section-title">我的数据</text>
          <button class="edit-btn" @click="openEditModal">编辑</button>
        </view>
        <view class="info-list">
          <view class="info-item">
            <text class="label">目标时长</text>
            <text class="value">{{ targetDuration || '- -' }} 分钟</text>
          </view>
          <view class="info-item">
            <text class="label">目标热量</text>
            <text class="value">{{ targetCalories || '- -' }} kcal</text>
          </view>
        </view>
    
       <!-- 编辑弹窗 -->
       <view v-if="isEditing" class="modal">
         <view class="modal-content">
           <!-- 弹窗头部 -->
           <view class="modal-header">
             <text class="modal-title">编辑目标</text>
           </view>
       
           <!-- 弹窗内容 -->
           <view class="modal-body">
             <view class="input-group">
               <text class="label">目标时长 (分钟)</text>
               <input v-model="editDuration" type="number" class="input" placeholder="请输入目标时长" />
             </view>
             <view class="input-group">
               <text class="label">目标热量 (kcal)</text>
               <input v-model="editCalories" type="number" class="input" placeholder="请输入目标热量" />
             </view>
           </view>
       
           <!-- 弹窗底部 -->
           <view class="modal-footer">
             <button class="cancel-btn" @click="cancelEdit">取消</button>
             <button class="save-btn" @click="saveEdit">保存</button>
           </view>
			
         </view>
       </view>
      </view>
	</view>
</template>


<script setup>
import { ref, computed,onMounted } from "vue";

const serverUrl = "http://192.168.56.1:3000";
const defaultAvatar = "/static/default-avatar.jpg";
const isEditing = ref(false);
const editDuration = ref(null);
const editCalories = ref(null);
const targetDuration = ref(20); // 目标运动时间，初始值为 20min
const targetCalories = ref(100); // 目标热量，初始值为 100卡
const username = uni.getStorageSync("username"); // 获取已登录用户的用户名
onMounted(() => {
	const username = uni.getStorageSync("username"); // 获取已登录用户的用户名
    fetchUserTargets();
	// 监听保存编辑的通知
	uni.$on("saveEdit",fetchUserTargets);
});
// 获取用户目标数据和头像
const fetchUserTargets = async () => {
  try {  
	  const username = uni.getStorageSync("username"); // 获取已登录用户的用户名
	  uni.setStorageSync(`username`, username);
	  console.log(`username: ${username}`);
    const res = await uni.request({
      url: `${serverUrl}/getTargets`,  
      method: "POST", 
      data: { username }, // 向后端发送用户名 
    });

    if (res.data.success) {
      // 更新目标数据
      targetDuration.value = res.data.data.sport_time_goal;
      targetCalories.value = res.data.data.calories_goal; 
     if(res.data.data.avatar!=null){
		   userInfo.value.avatar = `${serverUrl}/${res.data.data.avatar}` ;// 拼接完整 URL 
	 }
	else{
		userInfo.value.avatar = defaultAvatar;
	}
	  console.log(`1: ${userInfo.value.avatar}`);
    } else {
      uni.showToast({ title: "加载用户数据失败", icon: "none" });
    }
  } catch (error) {
    console.error("获取用户目标失败:", error); 
    uni.showToast({ title: "服务器错误", icon: "none" });
  }
};

// 更新用户目标
const updateUserTargets = async (calories, duration) => {
	const username = uni.getStorageSync("username"); // 获取已登录用户的用户名
  try {
    const res = await uni.request({
      url: `${serverUrl}/updateTargets`,
      method: "POST",
      data: { username, calories_goal: calories, sport_time_goal: duration }, // 向后端发送修改数据
    });

    if (res.data.success) {
      targetCalories.value = calories;
      targetDuration.value = duration;
      uni.showToast({ title: "更新成功", icon: "success" });
    } else {
      uni.showToast({ title: "更新失败", icon: "none" });
    }
  } catch (error) {
    console.error("更新用户目标失败:", error);
    uni.showToast({ title: "服务器错误", icon: "none" });
  }
};
// 打开编辑弹窗
const openEditModal = () => {
  editDuration.value = targetDuration.value;
  editCalories.value = targetCalories.value;
  isEditing.value = true; 
};

// 保存编辑
const saveEdit = () => {
  updateUserTargets(editCalories.value, editDuration.value);
  isEditing.value = false;
};
//跳转设置
const goToSettings = () =>{
	uni.navigateTo({
	  url: '/pages/Setting/Setting'
	});
}
// 取消编辑
const cancelEdit = () => {
  isEditing.value = false;
};
// 用户信息
const userInfo = ref({
  username: uni.getStorageSync("username") || "",
  avatar: "",
  height: "",
  weight: "",
  gender: "",
  age: "",
  goals: [],
  sportTypes: [],
}); 

// 更换头像
const changeAvatar = async () => {
  // 选择图片文件
  uni.chooseImage({
    count: 1,
    success: async (chooseResult) => {
      const filePath = chooseResult.tempFilePaths[0];
	  const username = uni.getStorageSync("username"); // 获取已登录用户的用户名
		console.log(`username: ${username}`);
      try {
        // 上传文件到后端
        const uploadRes = await uni.uploadFile({
          url: `${serverUrl}/upload`, // 上传 API
          filePath,
          name: "file",
        });

        const uploadData = JSON.parse(uploadRes.data);
        if (uploadData.success) {
          const newAvatarUrl = uploadData.imageUrl;

          // 更新头像 URL 到数据库
          const updateRes = await uni.request({
            url: `${serverUrl}/updateAvatar`,
            method: "POST", 
            data: {
              username,
              avatar: newAvatarUrl,
            },
          });

          if (updateRes.data.success) {
            userInfo.value.avatar = newAvatarUrl; // 更新本地显示的头像
            uni.showToast({ title: "头像更换成功", icon: "success" }); 
			fetchUserTargets();
          } else {
            uni.showToast({ title: "更新头像失败", icon: "none" });
          }
        } else {
          uni.showToast({ title: "上传失败", icon: "none" });
        }
      } catch (error) {
        console.error("更换头像失败:", error);
        uni.showToast({ title: "服务器错误", icon: "none" });
      }
    },
    fail: () => {
      // uni.showToast({ title: "取消选择图片", icon: "none" });
    },
  });
};


</script>

<style lang="scss" scoped>
.container {
  padding: 30rpx;
  background-color: #f7f8fa;
  min-height: 100vh;
}

.info-card {
  background-color: white;
  border-radius: 24rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;	
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
  text-align: center;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
}

.avatar {
  margin-top: 15px;
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  border: 6rpx solid transparent;
  background-image: linear-gradient(#fff, #fff),
    linear-gradient(135deg, #5b67d1, #94dfd4);
  background-origin: border-box;
  background-clip: content-box, border-box;
  transition: transform 0.3s ease;
}


.username {
  font-size: 36rpx;
  font-weight: 700;
  color: #333;
}

.info-section {
  background-color: white;
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}
.edit-btn {
  padding: 5rpx 50rpx;
  font-size: 26rpx;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #5c6df3, #6e7ff3);
  border: none;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 8rpx rgba(92, 109, 243, 0.3);
  transition: all 0.3s ease;
  margin-right:0px ;
}

.edit-btn:active {
  box-shadow: 0 2rpx 6rpx rgba(92, 109, 243, 0.4);
  transform: scale(0.95);
}

.section-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #333;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #ececec;
}

.label {
  font-size: 28rpx;
  color: #666;
}

.value {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.fetch-info-btn {
  margin-top: 30rpx;
  background: linear-gradient(135deg, #6e7ff3, #5c6df3);
  color: white;
  border-radius: 40rpx;
  padding: 20rpx 60rpx;
  font-size: 28rpx;
  font-weight: 500;
  border: none;
  box-shadow: 0 4rpx 12rpx rgba(92, 109, 243, 0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.fetch-info-btn:hover {
  transform: translateY(-4rpx);
  box-shadow: 0 6rpx 18rpx rgba(92, 109, 243, 0.3);
}
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* 半透明背景 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  width: 80%;
  max-width: 600rpx;
  background-color: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 10rpx 20rpx rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.3s ease-out;
}

.modal-header {
  background: linear-gradient(135deg, #6e7ff3, #5c6df3);
  padding: 20rpx;
  text-align: center;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
}

.modal-body {
  padding: 30rpx;
}

.input-group {
  margin-bottom: 50rpx;
}

.label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.input {
  width: 100%;
  padding: 10rpx;
  font-size: 28rpx;
  color: #333;
  border: 2rpx solid #e5e5e5;
  border-radius: 12rpx;
  // box-sizing: border-box;
}

.input:focus {
  border-color: #5c6df3;
  outline: none;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  padding: 20rpx;
  background-color: #f8f8f8;
  border-top: 1rpx solid #e5e5e5;
}
.cancel-btn,
.save-btn {
  flex: 1;
  margin: 0 10rpx;
  padding: 12rpx 20rpx;
  font-size: 28rpx;
  font-weight: 600;
  border: 2rpx ;
  text-align: center;
  transition: all 0.3s ease;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #666;
}

.cancel-btn:active {
  background-color: #e0e0e0;
}

.save-btn {
  background: linear-gradient(135deg, #5c6df3, #6e7ff3);
  color: #fff;
  box-shadow: 0 4rpx 8rpx rgba(92, 109, 243, 0.3);
}

.save-btn:active {
  box-shadow: 0 2rpx 6rpx rgba(92, 109, 243, 0.4);
  transform: scale(0.98);
}

/* 弹窗动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.header {
  margin-top:0px ;
  position: relative; /* 相对定位，方便调整子元素 */
  display: flex;
  align-items: center; /* 垂直居中对齐 */
  justify-content: center; /* 标题完全居中 */
  padding: 20rpx;
  border-bottom: 1rpx solid #e0e0e0; /* 下划线分隔 */
}

.header-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #333;
}

.settings-btn {
  position: absolute; /* 绝对定位 */
  right: 20rpx; /* 靠右边距 */
  top: 50%; /* 垂直居中 */
  transform: translateY(-50%); /* 修正垂直居中偏移 */
  // background-color: #f5f5f5; /* 按钮背景 */
  border: none;
  margin-right: 1px;
  width: 60rpx;
  height: 60rpx; /* 方形按钮 */
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: auto;
  font-size: 36rpx; /* 设置符号大小 */
  color: #ffffff; /* 设置符号颜色 */
  border-radius: 10rpx; /* 圆角边框 */
  box-shadow: 0 4rpx 6rpx rgba(0, 0, 0, 0.1); /* 添加阴影 */
  transition: all 0.3s ease; /* 动画效果 */
}
.settings-btn:active {
  transform: translateY(-50%) scale(0.95); /* 点击时缩小效果 */
}


</style>
