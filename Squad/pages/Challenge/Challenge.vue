<template>
  <view class="challenge-container">
    <!-- 顶部卡片 -->
    <view class="challenge-card">
      <view class="card-header">
        <view class="title-section">
          <text class="title">运动挑战</text>
          <text class="sub-title">与 {{ challenger }} 的{{ totalDays }}天运动计划</text>
        </view>
        <view class="day-badge">
          Day {{ currentDay }}/{{ totalDays }}
        </view>
      </view>
      
      <view class="progress-ring">
        <l-circle
          v-model="progressPercent"
          :percent="progressPercent"
          size="100"
          strokeWidth="16"
          trailWidth="16"
          lineCap="butt"
          strokeColor="#fff"
          trailColor="rgba(255, 255, 255, 0.3)"
        >
          <view class="ring-content">
            <text class="progress-text">{{ progressPercent }}%</text>
            <text class="progress-label">已完成</text>
          </view>
        </l-circle>
      </view>
    </view>

    <!-- 今日目标卡片 -->
    <view class="goal-card">
      <view class="card-title">
        <uni-icons type="flag-filled" size="20" color="#4CD964" />
        <text>今日目标</text>
      </view>
      <view class="goal-metrics">
        <view class="metric-item">
          <view class="metric-value">{{ challengeData.goal.minutes }}</view>
          <view class="metric-label">运动时长(分钟)</view>
        </view>
        <view class="metric-divider"></view>
        <view class="metric-item">
          <view class="metric-value">{{ challengeData.goal.calories }}</view>
          <view class="metric-label">消耗热量(千卡)</view>
        </view>
      </view>
    </view>

    <!-- 打卡按钮 -->
    <view class="action-section">
      <button class="check-in-btn" @click="handleCheckIn">
        <uni-icons type="checkbox-filled" size="24" color="#fff" />
        <text>打卡</text>
      </button>
    </view>

    <!-- 进度对比 -->
    <view class="comparison-card">
      <view class="card-title">
        <uni-icons type="medal-filled" size="20" color="#4CD964" />
        <text>挑战进度</text>
      </view>
      <view class="progress-comparison">
        <view class="player-progress">
          <view class="player-info">
            <image class="player-avatar" :src="userAvatar" mode="aspectFill" />
            <text class="player-name">我的进度</text>
            <text class="progress-value">{{ selfProgress }}%</text>
          </view>
          <progress 
            :percent="selfProgress" 
            stroke-width="6" 
            activeColor="#4CD964"
            backgroundColor="#E8F5E9"
          />
        </view>
        <view class="player-progress">
          <view class="player-info">
            <image class="player-avatar" :src="challengerAvatar" mode="aspectFill" />
            <text class="player-name">{{ challenger }}的进度</text>
            <text class="progress-value">{{ friendProgress }}%</text>
          </view>
          <progress 
            :percent="friendProgress" 
            stroke-width="6" 
            activeColor="#12B7F5"
            backgroundColor="#E1F5FE"
          />
        </view>
      </view>
    </view>

    <!-- 打卡记录 -->
    <view class="records-card">
      <view class="card-header">
        <view class="card-title">
          <uni-icons type="calendar-filled" size="20" color="#4CD964" />
          <text>打卡记录</text>
        </view>
        <text class="completion-rate">完成率 {{ completionRate }}%</text>
      </view>
      
      <scroll-view scroll-y class="records-list">
        <view 
          v-for="(record, index) in checkinRecords" 
          :key="index"
          class="record-item"
          :class="{ completed: record.status === 'completed' }"
        >
          <view class="record-left">
            <text class="day">Day {{ record.day }}</text>
            <text class="date">{{ formatDate(record.date) }}</text>
          </view>
          
          <view class="record-center">
            <view class="record-metrics">
              <text class="metric">{{ record.minutes }}分钟</text>
              <text class="metric">{{ record.calories }}千卡</text>
            </view>
            <text v-if="record.note" class="record-note">{{ record.note }}</text>
          </view>
          
          <view class="record-status">
            <uni-icons 
              :type="record.status === 'completed' ? 'checkbox-filled' : 'circle'"
              :color="record.status === 'completed' ? '#4CD964' : '#999'"
              size="20"
            />
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { useWebSocketStore } from '@/store/websocket';

const store = useWebSocketStore();
const userInfo = ref({
  username: uni.getStorageSync("username")
});

const challenger = ref('');
const challengeData = ref({
  duration: 7,
  goal: {
    minutes: 10,
    calories: 80
  },
  startTime: Date.now()
});
const invitationId = ref('');
const currentDay = ref(1);
const totalDays = ref(7);
const selfProgress = ref(0);
const friendProgress = ref(0);
const checkinRecords = ref([]);
const goalMinutes = ref(10);
const goalCalories = ref(80);

onMounted(() => {
  // 获取页面参数
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = currentPage.$page?.options;
  
  if (options && options.challenge) {
    try {
      const challengeInfo = JSON.parse(decodeURIComponent(options.challenge));
      challenger.value = challengeInfo.challenger;
      challengeData.value = challengeInfo.challengeData;
      invitationId.value = challengeInfo.invitationId;
      
      // 更新其他相关值
      totalDays.value = challengeData.value.duration;
      goalMinutes.value = challengeData.value.goal.minutes;
      goalCalories.value = challengeData.value.goal.calories;
      
      // 初始化打卡记录
      for (let i = 1; i <= totalDays.value; i++) {
        checkinRecords.value.push({
          day: i,
          status: 'pending',
          date: new Date(challengeData.value.startTime + (i-1) * 24 * 60 * 60 * 1000),
          minutes: 0,
          calories: 0,
          note: ''
        });
      }
      
      // 初始化WebSocket连接
      initWebSocket();
      
    } catch (error) {
      console.error('解析挑战数据失败:', error);
      uni.showToast({
        title: '加载挑战数据失败',
        icon: 'none'
      });
    }
  }
});

// 修改进度百分比计算
const progressPercent = computed(() => {
  return Math.floor((currentDay.value / totalDays.value) * 100);
});

// 修改处理打卡函数
const handleCheckIn = () => {
  uni.showModal({
    title: '打卡确认',
    content: '请输入今日运动数据',
    editable: true,
    placeholderText: '运动备注（选填）',
    success: (res) => {
      if (res.confirm) {
        const checkInData = {
          type: 'checkin',
          userId: userInfo.value.username,
          challengeId: invitationId.value,
          challenger: challenger.value,
          day: currentDay.value,
          time: new Date().getTime(),
          minutes: goalMinutes.value,
          calories: goalCalories.value,
          note: res.content
        };
        
        // 用 WebSocket store 发送打卡数据
        if (store.isConnected) {
          store.websocket.send({
            data: JSON.stringify(checkInData)
          });
          
          // 更新本地记录
          currentDay.value++;
          selfProgress.value = (currentDay.value / totalDays.value) * 100;
          updateCheckinRecord({
            day: currentDay.value - 1,
            status: 'completed',
            date: new Date().getTime(),
            minutes: goalMinutes.value,
            calories: goalCalories.value,
            note: res.content
          });
          
          uni.showToast({
            title: '打卡成功',
            icon: 'success'
          });
        } else {
          uni.showToast({
            title: '网络连接失败',
            icon: 'none'
          });
          store.initWebSocket();
        }
      }
    }
  });
};

// 更新打卡记录
const updateCheckinRecord = (day, status) => {
  const index = checkinRecords.value.findIndex(r => r.day === day);
  if (index !== -1) {
    checkinRecords.value[index].status = status;
  } else {
    checkinRecords.value.push({ day, status });
  }
};

// 同样修改完成率计算
const completionRate = computed(() => {
  const completed = checkinRecords.value.filter(r => r.status === 'completed').length;
  return Math.floor((completed / totalDays.value) * 100);
});

// 格式化日期
const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
};
</script>

<style lang="scss" scoped>
.challenge-container {
  min-height: 100vh;
  background: #F8F9FA;
  padding: 30rpx;
}

.challenge-card {
  background: linear-gradient(135deg, #4CD964, #3CB371);
  border-radius: 24rpx;
  padding: 40rpx;
  color: #fff;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 20rpx rgba(76, 217, 100, 0.2);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 40rpx;

    .title-section {
      .title {
        font-size: 44rpx;
        font-weight: 600;
        margin-bottom: 8rpx;
        display: block;
      }

      .sub-title {
        font-size: 28rpx;
        opacity: 0.9;
      }
    }

    .day-badge {
      background: rgba(255, 255, 255, 0.2);
      padding: 8rpx 20rpx;
      border-radius: 100rpx;
      font-size: 26rpx;
    }
  }

  .progress-ring {
    width: 200rpx;
    height: 200rpx;
    margin: 40rpx auto;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;

    .ring-content {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      width: 80%;
      z-index: 2;

      .progress-text {
        font-size: 40rpx;
        font-weight: 600;
        color: #fff;
        display: block;
        white-space: nowrap;
      }

      .progress-label {
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.9);
        margin-top: 8rpx;
        display: block;
        white-space: nowrap;
      }
    }
  }
}

.goal-card, .comparison-card, .records-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 24rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.goal-metrics {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 20rpx 0;

  .metric-item {
    text-align: center;

    .metric-value {
      font-size: 48rpx;
      font-weight: 600;
      color: #4CD964;
      margin-bottom: 8rpx;
    }

    .metric-label {
      font-size: 24rpx;
      color: #666;
    }
  }

  .metric-divider {
    width: 2rpx;
    height: 80rpx;
    background: #eee;
  }
}

.action-section {
  margin: 40rpx 0;

  .check-in-btn {
    width: 100%;
    height: 96rpx;
    background: linear-gradient(135deg, #4CD964, #3CB371);
    border-radius: 48rpx;
    color: #fff;
    font-size: 32rpx;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    border: none;
    box-shadow: 0 8rpx 20rpx rgba(76, 217, 100, 0.2);

    &:active {
      transform: scale(0.98);
      opacity: 0.9;
    }
  }
}

.player-progress {
  margin-bottom: 24rpx;

  .player-info {
    display: flex;
    align-items: center;
    margin-bottom: 12rpx;

    .player-avatar {
      width: 48rpx;
      height: 48rpx;
      border-radius: 24rpx;
      margin-right: 12rpx;
    }

    .player-name {
      flex: 1;
      font-size: 28rpx;
      color: #333;
    }

    .progress-value {
      font-size: 28rpx;
      font-weight: 600;
      color: #4CD964;
    }
  }
}

.records-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;

    .completion-rate {
      font-size: 28rpx;
      color: #4CD964;
      font-weight: 500;
    }
  }

  .records-list {
    max-height: 600rpx;
  }

  .record-item {
    display: flex;
    align-items: center;
    padding: 24rpx;
    border-radius: 16rpx;
    background: #F8F9FA;
    margin-bottom: 16rpx;
    transition: all 0.3s;

    &.completed {
      background: #E8F5E9;
    }

    .record-left {
      .day {
        font-size: 28rpx;
        font-weight: 600;
        color: #333;
        display: block;
      }

      .date {
        font-size: 24rpx;
        color: #999;
      }
    }

    .record-center {
      flex: 1;
      margin: 0 24rpx;

      .record-metrics {
        display: flex;
        gap: 16rpx;

        .metric {
          font-size: 26rpx;
          color: #666;
        }
      }

      .record-note {
        font-size: 24rpx;
        color: #999;
        margin-top: 8rpx;
      }
    }
  }
}
</style> 