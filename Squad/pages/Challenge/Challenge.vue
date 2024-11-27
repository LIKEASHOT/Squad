<template>
  <view class="challenge-container">
    <view class="challenge-header">
      <text class="title">打卡挑战</text>
      <text class="sub-title">与 {{ challenger }} 的7天运动挑战</text>
    </view>
    
    <view class="progress-section">
      <view class="progress-card">
        <text class="day-count">Day {{ currentDay }}/{{ totalDays }}</text>
        <progress :percent="progressPercent" stroke-width="4" color="#4cd964"/>
      </view>
    </view>
    
    <view class="daily-goals">
      <view class="goal-item">
        <text class="goal-title">今日目标</text>
        <text class="goal-value">{{ challengeData.goal.minutes }}分钟</text>
        <text class="goal-desc">或消耗{{ challengeData.goal.calories }}千卡</text>
      </view>
    </view>
    
    <view class="check-in-btn" @click="handleCheckIn">
      <text>打卡</text>
    </view>
    
    <view class="progress-comparison">
      <view class="progress-item">
        <text class="player-name">我的进度</text>
        <text class="progress-value">{{ selfProgress }}%</text>
        <progress :percent="selfProgress" stroke-width="4" color="#4cd964"/>
      </view>
      <view class="progress-item">
        <text class="player-name">{{ challenger }}的进度</text>
        <text class="progress-value">{{ friendProgress }}%</text>
        <progress :percent="friendProgress" stroke-width="4" color="#12b7f5"/>
      </view>
    </view>
    
    <view class="checkin-history">
      <view 
        v-for="(record, index) in checkinRecords" 
        :key="index"
        class="record-item"
      >
        <text class="day-label">Day {{ record.day }}</text>
        <text class="status" :class="record.status">
          {{ record.status === 'completed' ? '已完成' : '未完成' }}
        </text>
      </view>
    </view>
    
    <view class="checkin-details">
      <view class="details-header">
        <text class="header-title">打卡记录</text>
        <text class="completion-rate">完成率: {{ completionRate }}%</text>
      </view>
      
      <scroll-view scroll-y class="records-list">
        <view 
          v-for="(record, index) in checkinRecords" 
          :key="index"
          class="record-item"
        >
          <view class="record-date">
            <text class="day">Day {{ record.day }}</text>
            <text class="date">{{ formatDate(record.date) }}</text>
          </view>
          
          <view class="record-content">
            <view class="record-data">
              <view class="data-item">
                <text class="label">运动时长</text>
                <text class="value">{{ record.minutes }}分钟</text>
              </view>
              <view class="data-item">
                <text class="label">消耗热量</text>
                <text class="value">{{ record.calories }}千卡</text>
              </view>
            </view>
            
            <view class="record-note" v-if="record.note">
              <text class="note-text">{{ record.note }}</text>
            </view>
          </view>
          
          <text class="status-tag" :class="record.status">
            {{ record.status === 'completed' ? '已完成' : '未完成' }}
          </text> 
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue';

const challenger = ref('');
const challengeData = ref(null);
const invitationId = ref('');
const currentDay = ref(1);
const totalDays = ref(7);
const selfProgress = ref(0);
const friendProgress = ref(0);
const checkinRecords = ref([]);
const websocket = ref(null);
const goalMinutes = ref(10);
const goalCalories = ref(80);
const challengeDuration = ref(7);

// 计算进度百分比
const progressPercent = computed(() => {
  return (currentDay.value / totalDays.value) * 100;
});

// 初始化WebSocket连接
const initWebSocket = () => {
  websocket.value = uni.connectSocket({
    url: `ws://your-server-url:3000/challenge`,
    success: () => {
      console.log('Challenge WebSocket连接成功');
    }
  });

  websocket.value.onMessage((res) => {
    const data = JSON.parse(res.data);
    if (data.type === 'progress_update') {
      updateProgress(data);
    }
  });
};

// 更新进度
const updateProgress = (data) => {
  if (data.userId === userInfo.value.username) {
    selfProgress.value = data.progress;
  } else {
    friendProgress.value = data.progress;
  }
};

onMounted(() => {
  // 监听从聊天页面传递的数据
  uni.$on('challenge-data', (data) => {
    challenger.value = data.challenger;
    challengeData.value = data.challengeData;
    invitationId.value = data.invitationId;
  });
  initWebSocket();
  // 初始化打卡记录
  for (let i = 1; i <= totalDays.value; i++) {
    checkinRecords.value.push({
      day: i,
      status: 'pending'
    });
  }
});

onUnmounted(() => {
  if (websocket.value) {
    websocket.value.close();
  }
});

// 处理打卡
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
          day: currentDay.value,
          time: new Date().getTime(),
          minutes: goalMinutes.value,
          calories: goalCalories.value,
          note: res.content
        };
        
        websocket.value.send({
          data: JSON.stringify(checkInData),
          success: () => {
            currentDay.value++;
            selfProgress.value = (currentDay.value / totalDays.value) * 100;
            updateCheckinRecord({
              day: currentDay.value,
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
          }
        });
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

// 添加完成率计算
const completionRate = computed(() => {
  const completed = checkinRecords.value.filter(r => r.status === 'completed').length;
  return Math.round((completed / totalDays.value) * 100);
});

// 格式化日期
const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
};
</script>

<style lang="scss" scoped>
.challenge-container {
  padding: 40rpx;
}

.challenge-header {
  text-align: center;
  margin-bottom: 40rpx;
  
  .title {
    font-size: 40rpx;
    font-weight: bold;
    color: #333;
  }
  
  .sub-title {
    font-size: 28rpx;
    color: #666;
    margin-top: 10rpx;
  }
}

.progress-section {
  margin-bottom: 40rpx;
}

.progress-card {
  background: #fff;
  padding: 30rpx;
  border-radius: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
  
  .day-count {
    font-size: 32rpx;
    color: #333;
    margin-bottom: 20rpx;
    display: block;
  }
}

.daily-goals {
  margin-bottom: 60rpx;
}

.goal-item {
  background: #fff;
  padding: 30rpx;
  border-radius: 20rpx;
  text-align: center;
  
  .goal-title {
    font-size: 28rpx;
    color: #666;
  }
  
  .goal-value {
    font-size: 48rpx;
    color: #333;
    font-weight: bold;
    margin: 20rpx 0;
    display: block;
  }
  
  .goal-desc {
    font-size: 24rpx;
    color: #999;
  }
}

.check-in-btn {
  background: #4cd964;
  padding: 30rpx;
  border-radius: 100rpx;
  text-align: center;
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  box-shadow: 0 4rpx 20rpx rgba(76,217,100,0.3);
  
  &:active {
    transform: scale(0.98);
  }
}

.progress-comparison {
  margin: 30rpx 0;
  
  .progress-item {
    background: #fff;
    padding: 20rpx;
    border-radius: 12rpx;
    margin-bottom: 20rpx;
    
    .player-name {
      font-size: 28rpx;
      color: #666;
      margin-bottom: 10rpx;
      display: block;
    }
    
    .progress-value {
      font-size: 32rpx;
      color: #333;
      font-weight: bold;
      margin-bottom: 10rpx;
      display: block;
    }
  }
}

.checkin-history {
  margin-top: 30rpx;
  
  .record-item {
    display: flex;
    justify-content: space-between;
    padding: 20rpx;
    background: #fff;
    border-radius: 12rpx;
    margin-bottom: 10rpx;
    
    .day-label {
      font-size: 28rpx;
      color: #333;
    }
    
    .status {
      font-size: 28rpx;
      
      &.completed {
        color: #4cd964;
      }
      
      &.pending {
        color: #999;
      }
    }
  }
}

.checkin-details {
  margin-top: 40rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  
  .details-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30rpx;
    
    .header-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
    
    .completion-rate {
      font-size: 28rpx;
      color: #4cd964;
    }
  }
  
  .records-list {
    height: 600rpx;
  }
  
  .record-item {
    padding: 20rpx;
    border-bottom: 1rpx solid #eee;
    
    .record-date {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20rpx;
      
      .day {
        font-size: 28rpx;
        font-weight: bold;
        color: #333;
      }
      
      .date {
        font-size: 24rpx;
        color: #999;
      }
    }
    
    .record-content {
      margin-bottom: 20rpx;
      
      .record-data {
        display: flex;
        gap: 40rpx;
        
        .data-item {
          .label {
            font-size: 24rpx;
            color: #666;
          }
          
          .value {
            font-size: 28rpx;
            color: #333;
            margin-left: 10rpx;
          }
        }
      }
      
      .record-note {
        margin-top: 10rpx;
        font-size: 24rpx;
        color: #999;
      }
    }
    
    .status-tag {
      display: inline-block;
      padding: 4rpx 16rpx;
      border-radius: 100rpx;
      font-size: 24rpx;
      
      &.completed {
        background: #e8f7eb;
        color: #4cd964;
      }
      
      &.pending {
        background: #f5f5f5;
        color: #999;
      }
    }
  }
}
</style> 