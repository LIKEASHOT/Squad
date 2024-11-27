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
      <uni-popup ref="videoPopup" type="center">
        <view class="popup-content">
          <iframe
            v-if="currentVideoUrl"
            :src="currentVideoUrl"
            class="video-iframe"
            frameborder="0"
            allowfullscreen
          ></iframe>
          <button class="close-btn" @click="closeVideo">关闭</button>
        </view>
      </uni-popup>
</div> 
  <!-- 自由训练展示 -->
  <view v-if="tab === 'freeExercise'" class = "plan-section">
    
  </view>
</template>	

<script setup>
import {ref,onMounted} from "vue";
import LCircle from "@/uni_modules/lime-circle/components/l-circle/l-circle.vue"; // 引入组件
import uniPopup from "@/uni_modules/uni-popup/components/uni-popup/uni-popup.vue";
const currentExercise = ref(30); // 当前运动时长
const planExercise = ref(60); // 计划运动时长	
const modelVale = ref(0);
const target = ref(50);
const tab = ref("myExercise"); // 当前选中的标签
const myExercise = ref(true);
const freeExercise = ref(false);
const username = uni.getStorageSync("username"); // 获取已登录用户的用户
const currentVideoUrl = ref(""); // 当前视频的 URL
const videoPopup = ref(null); // 弹窗引用
// 页面加载时调用
onMounted(() => {
  loadMyPlans();
  // 监听添加计划的通知
  uni.$on("handleAdd", loadMyPlans);
  // 监听删除计划的通知
  uni.$on("handleRemove", loadMyPlans);
});
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

// 存储我的计划
const myPlans = ref([]);
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
// 从后端获取计划数据
const fetchPlansFromBackend = () => {
  uni.request({
    url: serverUrl + "/goals", // 替换为你的实际后端地址
    method: "GET",
    success: (res) => {
      console.log("返回的所有计划数据:", res.data);
      if (Array.isArray(res.data) && res.data.length > 0) {
        // 处理返回的数据
        plans.value = res.data.map((item) => ({
          title: item.title,
          duration: `${item.duration}min`, // 注意单位格式
          imageUrl: item.image_url,
          times: item.times,
          difficulties: item.difficulties,
          calorie: item.calorie,
          goal: item.goal ? item.goal.split(",").map((g) => g.trim()) : [], // 将 goal 字符串按号拆分并去除空格
          type: item.type,
		  videoUrl:item.videoUrl,
        }));
        // 在获取数据后，根据筛选条件过滤数据
        filterPlans();
      } else {
        console.log("未找到相关计划数据");
      }
    },
    fail: (err) => {
      console.error("请求失败:", err);
    },
  }); 
};
// 播放课程
const playPlan = (plan) => {
	console.log("返回的所有计划数据:", plan.videoUrl);
  if (plan.videoUrl) {
    currentVideoUrl.value = `https://player.bilibili.com/player.html?bvid=${plan.videoUrl}`;
    const videoPopup = uni.$refs.videoPopup;
    videoPopup.open();
  } else {
    uni.showToast({
      title: "该课程没有视频",
      icon: "none",
    });
  }
};
// 关闭视频弹窗
const closeVideo = () => {
  const videoPopup = uni.$refs.videoPopup;
  videoPopup.close();
  currentVideoUrl.value = ""; // 清空视频 URL
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
  width:97%;
  margin-left:3px ;
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
</style>
