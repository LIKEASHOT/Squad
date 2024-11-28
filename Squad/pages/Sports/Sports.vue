<template>
  <!-- 每日运动时长 -->
  <view class="top_bar_sport">
    <view class="sportbar">
      <l-circle
        v-model="modelVale"
        :percent="target"
        :size="50"
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
      <image src="../../static/icon/shot_sport.png" class="shot_icon" />
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
   <view v-if="isModalVisible" class="modal-overlay" @click="closeVideo">
     <view class="modal" @click.stop>
       <!-- 实时计时显示 -->
       <div class="timer-header">
         当前运动时长：{{ Math.floor(elapsedTime / 60) }}分{{ elapsedTime % 60 }}秒
       </div>
       <iframe
         v-if="currentVideoUrl"
         :src="currentVideoUrl"
         class="video-iframe"
         frameborder="0"
         allowfullscreen
       ></iframe>
       <button class="close-btn" @click="closeVideo">关闭</button>
     </view>
   </view>
</div> 
  <!-- 自由训练展示 -->
  <view v-if="tab === 'freeExercise'" class = "plan-section">
    
  </view>
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
const target = ref(50);
const tab = ref("myExercise"); // 当前选中的标签
const myPlans = ref([]); // 存储我的课程数据
const currentVideoUrl = ref(""); // 当前播放视频的 URL
const isModalVisible = ref(false); // 控制弹窗显示
const username = uni.getStorageSync("username"); // 获取已登录用户
const startTime = ref(0); // 视频播放开始的时间戳
const elapsedTime = ref(0); // 当前累计的运动时间
const timerInterval = ref(null); // 定时器的引用
const serverUrl =uni.getStorageSync("serverUrl");
// 页面加载时调用
onMounted(() => { 
  loadMyPlans();
  loadExerciseDurations(); // 加载每日运动时长
  fetchPlanExercise(); // 获取计划运动时长
  // 监听添加计划的通知 
  uni.$on("handleAdd", loadMyPlans);
  // 监听删除计划的通知
  uni.$on("handleRemove", loadMyPlans);
});

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

</style>
