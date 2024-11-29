<template>
  <view class="container">
    <!-- 顶部背景 -->
    <view class="top-bg">
      <view class="bg-pattern"></view>
    </view>
    
    <!-- 个人信息卡片 -->
    <view class="profile-card">
      <view class="avatar-section">
        <view class="avatar-wrapper" @click="changeAvatar">
          <image :src="userInfo.avatar || defaultAvatar" class="avatar" mode="aspectFill"/>
          <view class="edit-overlay">
            <uni-icons type="camera-filled" size="24" color="#fff"/>
          </view>
        </view>
        <text class="username">{{ username || '未登录' }}</text>
        <text class="user-id">ID: {{ userInfo.id || '-' }}</text>
      </view>

    </view>

    <!-- 数据卡片 -->
    <view class="data-section">
      <view class="section-header">
        <text class="section-title">运动数据</text>
        <button class="edit-btn" @click="openEditModal">
          <uni-icons type="compose" size="16" color="#fff"/>
          <text>编辑</text>
        </button>
      </view>

      <view class="data-grid">
        <view class="data-item">
          <view class="data-icon">🎯</view>
          <text class="data-label">目标时长</text>
          <text class="data-value">{{ targetDuration }}分钟</text>
          <view class="progress-bar">
            <view class="progress" :style="{ width: `${(targetDuration/120) * 100}%` }"></view>
          </view>
        </view>

        <view class="data-item">
          <view class="data-icon">🔥</view>
          <text class="data-label">目标热量</text>
          <text class="data-value">{{ targetCalories }}kcal</text>
          <view class="progress-bar">
            <view class="progress" :style="{ width: `${(targetCalories/1000) * 100}%` }"></view>
          </view>
        </view>
      </view>
    </view>

    <!-- 功能按钮区 -->
    <view class="action-section">
      <view class="action-btn" @click="goToSettings">
        <uni-icons type="gear-filled" size="24" color="#5B8FF9"/>
        <text>设置</text>
      </view>
      <view class="action-btn">
        <uni-icons type="help-filled" size="24" color="#5B8FF9"/>
        <text>帮助</text>
      </view>
      <view class="action-btn">
        <uni-icons type="info-filled" size="24" color="#5B8FF9"/>
        <text>关于</text>
      </view>
    </view>
    <view class="space"></view> 
    <!-- 编辑弹窗 -->
    <uni-popup ref="popup" type="center">
      <view class="modal">
        <view class="modal-content">
          <view class="modal-header">
            <text class="modal-title">编辑目标</text>
          </view>
          
          <view class="modal-body">
            <view class="input-group">
              <text class="label">目标时长 (分钟)</text>
              <input 
                type="number" 
                v-model="editDuration"
                class="input"
                placeholder="请输入目标时长"
              />
            </view>
            
            <view class="input-group">
              <text class="label">目标热量 (kcal)</text>
              <input 
                type="number" 
                v-model="editCalories"
                class="input"
                placeholder="请输入目标热量"
              />
            </view>
          </view>
          
          <view class="modal-footer">
            <button class="cancel-btn" @click="cancelEdit">取消</button>
            <button class="save-btn" @click="saveEdit">保存</button>
          </view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>


<script setup>
import { ref, computed,onMounted } from "vue";

const serverUrl = uni.getStorageSync("serverUrl"); // 服务器地址
const defaultAvatar = "/static/default-avatar.jpg";
const isEditing = ref(false);
const editDuration = ref(null);
const editCalories = ref(null);
const targetDuration = ref(20); // 目标运动时间，初始值为 20min
const targetCalories = ref(100); // 目标热量，初始值为 100卡
const username = uni.getStorageSync("username"); // 获取已登录用户的用户名
import{onPullDownRefresh} from '@dcloudio/uni-app';
onPullDownRefresh(async () => {
  console.log("refresh");
  await fetchUserTargets();
  uni.stopPullDownRefresh();
});
onMounted(() => {
	const username = uni.getStorageSync("username"); // 获取已登录用户的用户名
    fetchUserTargets();
	// 监听保存编辑的通知
	uni.$on("saveEdit",fetchUserTargets);
	uni.$on("updateUserTargets",fetchUserTargets);
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
       userInfo.value.avatar = `${serverUrl}/${res.data.data.avatar}`;// 拼接完整 URL 
       uni.setStorageSync("userInfo_" + username, userInfo.value);
	 }
	else{
		userInfo.value.avatar = defaultAvatar;
	}
	  // console.log(`1: ${userInfo.value.avatar}`);
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
	  //通知更新目标
	  uni.$emit("updateUserTargets");
      uni.showToast({ title: "更新成功", icon: "success" });
    } else {
      uni.showToast({ title: "更新失败", icon: "none" });
    }
  } catch (error) {
    console.error("更新用户目标失败:", error);
    uni.showToast({ title: "服务器错误", icon: "none" });
  }
};
// 添加 popup 引用
const popup = ref(null);

// 修改打开编辑弹窗的方法
const openEditModal = () => {
  editDuration.value = targetDuration.value;
  editCalories.value = targetCalories.value;
  // 使用 popup 的 open 方法打开弹窗
  popup.value.open();
};

// 修改取消编辑的方法
const cancelEdit = () => {
  popup.value.close();
};

// 修改保存编辑的方法
const saveEdit = async () => {
  try {
    const res = await uni.request({
      url: `${serverUrl}/updateTargets`,
      method: "POST",
      data: {
        username: uni.getStorageSync("username"),
        calories_goal: editCalories.value,
        sport_time_goal: editDuration.value,
      },
    });

    if (res.data.success) {
      targetCalories.value = editCalories.value;
      targetDuration.value = editDuration.value;
      uni.showToast({ title: "更新成功", icon: "success" });
      // 关闭弹窗
      popup.value.close();
    } else {
      uni.showToast({ title: "更新失败", icon: "none" });
    }
  } catch (error) {
    console.error("更新用户目标失败:", error);
    uni.showToast({ title: "服务器错误", icon: "none" });
  }
};
//跳转设置
const goToSettings = () =>{
	uni.navigateTo({
	  url: '/pages/Setting/Setting'
	});
}

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
@import "./My_Info.css";

.space{
  height: 100rpx;
}
</style>
