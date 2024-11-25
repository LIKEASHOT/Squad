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
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';

const challenger = ref('');
const challengeData = ref(null);
const invitationId = ref('');
const currentDay = ref(1);
const totalDays = ref(7);

// 计算进度百分比
const progressPercent = computed(() => {
  return (currentDay.value / totalDays.value) * 100;
});

onMounted(() => {
  // 监听从聊天页面传递的数据
  uni.$on('challenge-data', (data) => {
    challenger.value = data.challenger;
    challengeData.value = data.challengeData;
    invitationId.value = data.invitationId;
  });
});

// 处理打卡
const handleCheckIn = () => {
  uni.showModal({
    title: '打卡确认',
    content: '确认完成今日运动目标？',
    success: (res) => {
      if (res.confirm) {
        // 这里添加打卡逻辑
        uni.showToast({
          title: '打卡成功',
          icon: 'success'
        });
        currentDay.value++;
      }
    }
  });
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
</style> 