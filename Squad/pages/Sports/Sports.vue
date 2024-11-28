<template>
  <div class="sports-container">
    <!-- 每日运动时长 -->
    <view class="top_bar_sport">
      <view class="sportbar">
        <l-circle
          v-model="modelVale"
          :percent="target"
          :size="String(50)"
          class="circle_process"
          strokeColor="#69c27d"
          trailWidth="12"
          strokeWidth="12"
          lineCap="butt"
        >
        </l-circle>
        <div class="exercise-duration">
          <span>今日运动时长</span>
          <span>{{ currentExercise }} / {{ planExercise }} 分钟</span>
        </div>
      </view>
      <view>
         <!-- 点击按钮打开弹窗 -->
          <image 
            src="../../static/icon/shot_sport.png"  
            class="shot_icon" 
            @tap="openEditModal" 
          />
        
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
    <div class="container">
    <!-- 我的课程与自由训练切换 -->
    <div class="tab-container">
      <span :class="{ active: tab === 'myExercise' }" 
	@click="switchTab('myExercise')"
      >我的课程</span
      >
      <span
        :class="{ active: tab === 'freeExercise' }"
        @click="switchTab('freeExercise')"
        >自由训练</span
      >
    </div>
    <!-- 我的课程展示 -->
    <view v-if="tab === 'myExercise'" class = "plan-section">
      <div class="plan-list">
        <div
          v-for="(item, index) in myPlans"
          :key="index"
          class="plan-item"
        >
          <image :src="item.imageUrl" class="plan-image" />
          <div class="plan-info">
            <span class="plan-title">{{ item.title }}</span>
            <span class="plan-times">运动次数：{{ item.times }}</span>
            <span class="plan-duration">时间：{{ item.duration }}</span>
            <span class="plan-difficulties">难度：{{ item.difficulties }}</span>
            <span class="plan-calorie">卡路里：{{ item.calorie }}</span>
          </div>
          <div class="vertical-line"></div>
           <!-- 播放按钮 -->
           <div class="play-button" @click="playPlan(item)"></div>
        </div>
      </div>
    </view>
     <!-- 视频弹窗 -->
      <view v-if="isModalVisible" class="video-modal-overlay" @click="closeVideo">
        <view class="video-modal" @click.stop>
          <!-- 实时计时显示 -->
          <view class="video-timer-header">
            当前运动时长：{{ Math.floor(elapsedTime / 60) }}分{{ elapsedTime % 60 }}秒
          </view>
          <!-- 视频播放器 -->
          <iframe
            v-if="currentVideoUrl"
            :src="currentVideoUrl"
            class="video-iframe"
            frameborder="0"
            allowfullscreen
          ></iframe>
          <!-- 关闭按钮 -->
          <view class="video-modal-footer">
            <button class="video-close-btn" @click="closeVideo">关闭</button>
          </view>
        </view>
      </view>
  </div> 
    <!-- 自由训练展示 -->
    <view v-if="tab === 'freeExercise'" class = "plan-section">
      
    </view>
  </div>
</template>	 

<script setup>
import {ref,onMounted} from "vue";
import LCircle from "@/uni_modules/lime-circle/components/l-circle/l-circle.vue"; // 引入组件
import uniPopup from "@/uni_modules/uni-popup/components/uni-popup/uni-popup.vue";
import dayjs from "dayjs"; // 引入 dayjs 日期库
// 当前日期
const today = dayjs().format("YYYY-MM-DD");
const exerciseDurations = ref({}); // 存储所有日期的运动时长
const currentExercise = ref(0); // 当前显示的运动时长
const planExercise = ref(20); // 计划运动时长
const modelVale = ref(0);
const target = ref(0);
const tab = ref("myExercise"); // 当前选中的标签
const myPlans = ref([]); // 存储我的课程数据
const currentVideoUrl = ref(""); // 当前播放视频的 URL
const isModalVisible = ref(false); // 控制弹窗显示
const username = uni.getStorageSync("username"); // 获取已登录用户
const startTime = ref(0); // 视频播放开始的时间戳
const elapsedTime = ref(0); // 当前累计的运动时间
const timerInterval = ref(null); // 定时器的引用
const serverUrl =uni.getStorageSync("serverUrl");
const isEditing = ref(false); // 控制弹窗显示
const editDuration = ref(0); // 编辑中的目标时长
const editCalories = ref(0); // 编辑中的目标热量
const targetDuration = ref(20); // 目标运动时间，初始值为 20min
const targetCalories = ref(100); // 目标热量，初始值为 100
// 页面加载时调用
onMounted(() => { 
  loadMyPlans();
  loadExerciseDurations(); // 加载每日运动时长
  fetchPlanExercise(); // 获取计划运动时长
  fetchUserTargets();
  // 计算当前显示运动时长占计划运动时长的百分比
  target.value =  Math.round((currentExercise.value / planExercise.value) * 100);
  // 监听添加计划的通知 
  uni.$on("handleAdd", loadMyPlans);
  // 监听删除计划的通知
  uni.$on("handleRemove", loadMyPlans);
  //监听更新目标的通知
  uni.$on("updateUserTargets",fetchPlanExercise);
  uni.$on("updateUserTargets",fetchUserTargets);
}); 

// 打开编辑弹窗
const openEditModal = () => {
  editDuration.value = targetDuration.value;
  editCalories.value = targetCalories.value;
  isEditing.value = true;
};
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
	  // 计算当前显示运动时长占计划运动时长的百分比
	  target.value =  Math.round((currentExercise.value / planExercise.value) * 100);
    } else {
      uni.showToast({ title: "加载用户数据失败", icon: "none" });
    }
  } catch (error) {
    console.error("获取用户目标失败:", error); 
    uni.showToast({ title: "服务器错误", icon: "none" }); 
  }
};

// 保存编辑
const saveEdit = async () => {
  const username = uni.getStorageSync("username"); // 获取用户名
  try {
    const res = await uni.request({
      url: `${serverUrl}/updateTargets`,
      method: "POST",
      data: {
        username,
        calories_goal: editCalories.value,
        sport_time_goal: editDuration.value,
      },
    });

    if (res.data.success) {
      // 更新页面目标
      targetCalories.value = editCalories.value;
      targetDuration.value = editDuration.value;
      // 计算当前显示运动时长占计划运动时长的百分比
      target.value =  Math.round((currentExercise.value / planExercise.value) * 100);
      uni.$emit("updateUserTargets"); // 通知其他组件更新
      uni.showToast({ title: "更新成功", icon: "success" });
    } else {
      uni.showToast({ title: "更新失败", icon: "none" });
    }
  } catch (error) {
    console.error("更新用户目标失败:", error);
    uni.showToast({ title: "服务器错误", icon: "none" });
  }
  isEditing.value = false;
};

// 取消编辑
const cancelEdit = () => {
  isEditing.value = false;
};
// 从后端加载计划运动时长
const fetchPlanExercise = () => {
  const username = uni.getStorageSync("username"); // 获取已登录用户
  if (!username) {
    console.error("用户未登录");
    return;
  }

  uni.request({
    url: `${serverUrl}/sport-time-goal?username=${encodeURIComponent(username)}`, // 拼接 username 参数
    method: "GET",
    header: {
      "Content-Type": "application/json", 
    },
    success: (res) => {
      if (res.statusCode === 200 && res.data.success) {
        planExercise.value = res.data.data.sport_time_goal || 60; // 更新计划运动时长
		// 计算当前显示运动时长占计划运动时长的百分比
		target.value =  Math.round((currentExercise.value / planExercise.value) * 100);
      } else {
        console.error("获取计划运动时长失败：", res.data.message || "未知错误");
      }
    },
    fail: (err) => {
      console.error("请求失败：", err);
    },
  });
};

// 加载运动时长
const loadExerciseDurations = () => {
  const username = uni.getStorageSync("username"); // 获取已登录用户
  if (!username) {
    console.error("用户未登录");
    return;
  }

  uni.request({
    url: `${serverUrl}/exercise-duration?username=${encodeURIComponent(username)}`, // 传递 username
    method: "GET",
    header: {
      "Content-Type": "application/json",
    },
    success: (res) => {
      if (res.statusCode === 200 && res.data.success) {
        currentExercise.value = res.data.data.exercise_duration || 0; // 更新当前运动时长
		// 计算当前显示运动时长占计划运动时长的百分比
		target.value =  Math.round((currentExercise.value / planExercise.value) * 100);
      } else {
        console.error("获取今日运动时长失败：", res.data.message || "未知错误");
      }
    },
    fail: (err) => {
      console.error("请求失败：", err);
    },
  });
};
// 保存运动时长
const saveExerciseDuration = () => {
  const username = uni.getStorageSync("username"); // 获取已登录用户
  if (!username) {
    console.error("用户未登录");
    return;
  }

  const today = dayjs().format("YYYY-MM-DD"); // 获取今天的日期
  const exerciseDuration = currentExercise.value; // 获取当前运动时长

  uni.request({
    url: `${serverUrl}/save-exercise-duration`,
    method: "POST", 
    data: {
      username: username,
      date: today,
      exercise_duration: exerciseDuration,
    },
    header: {
      "Content-Type": "application/json",
    },
    success: (res) => {
      if (res.statusCode === 200 && res.data.success) {
        console.log("今日运动时长已保存");
		//通知保存运动时长
		uni.$emit("saveExerciseDuration");
		// 计算当前显示运动时长占计划运动时长的百分比
		target.value =  Math.round((currentExercise.value / planExercise.value) * 100);
      } else {
        console.error("保存今日运动时长失败：", res.data.message || "未知错误");
      }
    },
    fail: (err) => {
      console.error("请求失败：", err);
    },
  });
};
//状态切换
const switchTab = (selectedTab) => {
  tab.value = selectedTab;
};
const planForm = ref({
  title: "",
  duration: "",
  imageUrl: "",
  times: "",
  difficulties: "",
  calorie: "",
  goal: "",
  type: "",
  videoUrl: "",
});

// 添加一个变量存储当前编辑的索引
const currentEditIndex = ref(-1);
// 加载当前用户的计划
const loadMyPlans = () => {
  const storedPlans = uni.getStorageSync(`myPlans_${username}`);
  if (storedPlans) {
    myPlans.value = JSON.parse(storedPlans);
  } else {
    myPlans.value = [];
  }
};
// 记录开始时间
let videoStartTime = null;
// 播放课程
const playPlan = (plan) => {
  console.log("BV数据:", plan.videoUrl);
  if (plan.videoUrl) {
    currentVideoUrl.value = `https://player.bilibili.com/player.html?bvid=${plan.videoUrl}&quality=120`;
    isModalVisible.value = true; // 显示弹窗

    // 记录播放开始时间
    startTime.value = Date.now();

    // 启动定时器
    timerInterval.value = setInterval(() => {
      elapsedTime.value = Math.floor((Date.now() - startTime.value) / 1000); // 秒数
    }, 1000);
  } else {
    uni.showToast({
      title: "该课程没有视频",
      icon: "none",
    });
  }
};

// 关闭视频时计算观看时长
const closeVideo = () => {
  isModalVisible.value = false; // 隐藏弹窗
  currentVideoUrl.value = ""; // 清空视频 URL

  // 停止定时器
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
    timerInterval.value = null;

    // 更新当前运动时间
    const addedMinutes = Math.floor(elapsedTime.value / 60); // 计算分钟数
    currentExercise.value += addedMinutes;

    // 更新到本地存储
    exerciseDurations.value[today] = currentExercise.value;
    saveExerciseDuration();
  }

  elapsedTime.value = 0; // 重置计时器
};
//跳转设置
const goToMy_Info = () =>{
	 console.log("跳转到我的信息页面");
	uni.navigateTo({
	   url: "/pages/My_Info/My_Info",
	 });
	 
const goToSearchPage = () => {
  // 跳转到搜索页面逻辑
  uni.navigateTo({
    url: "/pages/Search/Search",
  });
};
}
</script>

<style scoped lang="scss">
	.add_icon {
	  width: 100rpx;
	  height: 100rpx;
	}
	.delete_icon {
	  width: 100rpx;
	  height: 100rpx;
	  margin-top: 10rpx;
	}
.top_bar_sport {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 10px;
  margin-left: 10px;
}
.sportbar {
  display: flex;
  align-items: center;
  width: 75%;
  padding: 10px;
  background-color: white;
  border-radius: 20px;
  border: 1px solid #ccc;
}
.exercise-duration {
  display: flex;
  flex-direction: column;
  margin-left: 20px;
  font-size: 16px;
  color: #333;
}
.circle_process_eat {
  margin-top: 50rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.shot_icon {
  left: 30rpx;
  width: 100rpx;
  height: 100rpx;
}
.tab-container {
  display: flex;
  justify-content: space-around;
  margin-top: 10px;
  border-bottom: 1px solid #ccc;
}
.tab-container span {
  padding: 10px;
}

.tab-container .active {
  color: #333;
  border-bottom: 2px solid #333;
}
.plan-section {
  margin-top: 10px;
}

.plan-list {
  margin-top: 10px;
  width:94%;
  margin-left:10px ;
}

.plan-item {
  display: flex;
  flex-direction: row;
  margin-top: 20px;
  // border: 1px solid #726969;
  box-shadow: 0 4px 8px rgba(94, 87, 87, 0.603); /* 添加边界阴影 */
}

.plan-image {
  
  margin-top: 2.5px;
  margin-left: 2.5px;
  width: 350rpx;
  height: 190rpx;
  box-shadow: 0 4px 8px rgba(94, 87, 87, 0.4); /* 添加边界阴影 */
}

.plan-info {
  margin-left: 10px;
  margin-right: auto;
  display: flex;
  flex-direction: column;
}

.plan-title {
  font-size: 16px;
}

.plan-duration {
  color: black;
  font-size: 12px;
}
.plan-times {
  color: black;
  font-size: 12px;
  white-space: nowrap; /* 防止换行 */
}
.plan-difficulties {
  color: black;
  font-size: 12px;
}
.plan-calorie {
  color: black;
  font-size: 12px;
}
.vertical-line {
  position: relative;
  // margin-left: 80px;
  width: 2px;
  background-color: #ccc;
}
.play-button {
  margin-top: 37px;
  margin-left: 8px;
  width: 0;
  height: 0;
  border-left: 40rpx solid #ff0000; /* 设置三角形的颜色 */
  border-top: 25rpx solid transparent;
  border-bottom: 25rpx solid transparent;
  cursor: pointer;
  margin-right: 10rpx;
  
}
.plan-section {
  margin-top: 10px;
}
.popup-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: #fff;
  border-radius: 10px;
}

.video-iframe {
  width: 100%;
  max-width: 800px;
  height: 450px; /* 16:9 比例 */
  border-radius: 8px;
  border: none;
}

.close-btn {
  margin-top: 10px;
  padding: 10px 20px;
  background: #ff0000;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  max-width: 90%;
  width: 600px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.video-iframe {
  width: 100%;
  height: 300px;
  border: none;
  border-radius: 8px;
}

.close-btn {
  margin-top: 10px;
  padding: 10px 20px;
  background: #ff0000;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.timer-header {
  font-size: 16px;
  color: #333;
  margin-bottom: 10px;
  text-align: center;
  background-color: #f4f4f4;
  padding: 10px;
  border-radius: 8px;
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
  text-align: left;
}

.input {
  width: 100%;
  padding: 10rpx;
  font-size: 28rpx;
  color: #333;
  border: 2rpx solid #e5e5e5;
  border-radius: 12rpx;
  text-align: left; /* 文本左对齐 */
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
/* 背景遮罩 */
.video-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* 弹窗容器 */
.video-modal {
  width: 90%;
  max-width: 700px;
  background-color: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.3s ease-out;
}

/* 计时头部 */
.video-timer-header {
  background-color: #f8f9fa;
  color: #333;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
}

/* 视频播放器 */
.video-iframe {
  width: 90%;
  height: 200px;
  max-height: 360px;
  background-color: #000;
  border: none;
  margin-left: 15px;
}

/* 弹窗底部 */
.video-modal-footer {
  background-color: #f8f9fa;
  padding: 12px 16px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #e0e0e0;
}

/* 关闭按钮 */
.video-close-btn {
  background-color: #dc3545;
  color: #ffffff;
  border: none;
  padding: 8px 100px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
}

.video-close-btn:hover {
  background-color: #c82333;
}
</style>
