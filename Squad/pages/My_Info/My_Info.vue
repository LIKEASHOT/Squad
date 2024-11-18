<template>
  <view class="container">
    <!-- 头部信息卡片 -->
    <view class="info-card">
      <view class="avatar-section">
        <image :src="userInfo.avatar || defaultAvatar" class="avatar" @click="changeAvatar"></image>
        <text class="username">{{ userInfo.username || '未登录' }}</text>
      </view>
      <!-- 获取信息按钮 -->
      <button class="fetch-info-btn" @click="fetchUserInfo">
        <text class="btn-text">{{ hasUserInfo ? '更新信息' : '获取信息' }}</text>
      </button>
    </view>

    <!-- 信息展示区域 -->
    <view class="info-content">
      <!-- 基本信息部分 -->
      <view class="info-section">
        <view class="section-header">
          <text class="section-title">基本信息</text>
          <text class="edit-btn" @click="toggleEdit('basic')" v-if="hasUserInfo">
            {{ isEditing.basic ? '保存' : '编辑' }}
          </text>
        </view>
        <view class="info-list">
          <view class="info-item">
            <text class="label">身高</text>
            <input
              type="number"
              v-model="userInfo.height"
              :disabled="!isEditing.basic"
              class="input"
              placeholder="- -"
              @blur="updateInfo('height')"
            />
            <text class="unit">cm</text>
          </view>

          <view class="info-item">
            <text class="label">体重</text>
            <input
              type="number"
              v-model="userInfo.weight"
              :disabled="!isEditing.basic"
              class="input"
              placeholder="- -"
              @blur="updateInfo('weight')"
            />
            <text class="unit">kg</text>
          </view>

          <view class="info-item">
            <text class="label">性别</text>
            <picker
              :range="genderOptions"
              :disabled="!isEditing.basic"
              @change="handleGenderChange"
              class="picker"
            >
              <view class="picker-text">{{ userInfo.gender || '- -' }}</view>
            </picker>
          </view>

          <view class="info-item">
            <text class="label">年龄</text>
            <input
              type="number"
              v-model="userInfo.age"
              :disabled="!isEditing.basic"
              class="input"
              placeholder="- -"
              @blur="updateInfo('age')"
            />
            <text class="unit">岁</text>
          </view>
        </view>
      </view>

      <!-- BMI信息展示 -->
      <view class="bmi-section" v-if="hasUserInfo">
        <view class="bmi-card">
          <view class="bmi-title">BMI 指数</view>
          <view class="bmi-content">
            <text class="bmi-value">{{ calculateBMI() }}</text>
            <text class="bmi-status" :class="getBMIStatusClass()">{{ getBMIStatus() }}</text>
          </view>
        </view>
      </view>

      <!-- 运动目标部分 -->
      <view class="info-section">
        <view class="section-header">
          <text class="section-title">运动目标</text>
          <text class="edit-btn" @click="toggleEdit('goals')" v-if="hasUserInfo">
            {{ isEditing.goals ? '保存' : '编辑' }}
          </text>
        </view>
        <view class="goals-list" :class="{ 'editing': isEditing.goals }">
          <view v-if="!hasUserInfo" class="empty-text">暂无数据</view>
          <checkbox-group 
              :value="userInfo.goals" 
              @change="handleGoalsChange">
            <label v-for="goal in goalOptions" :key="goal.value" class="goal-item">
              <checkbox 
                :value="goal.value" 
                :checked="userInfo.goals.includes(goal.value)"
                :disabled="!isEditing.goals"
              />
              <text class="goal-text">{{ goal.name }}</text>
            </label>
          </checkbox-group>
        </view>
      </view>

      <!-- 运动类型部分 -->
      <view class="info-section">
        <view class="section-header">
          <text class="section-title">运动类型</text>
          <text class="edit-btn" @click="toggleEdit('sportTypes')" v-if="hasUserInfo">
            {{ isEditing.sportTypes ? '保存' : '编辑' }}
          </text>
        </view>
        <view class="sport-types-list" :class="{ 'editing': isEditing.sportTypes }">
          <view v-if="!hasUserInfo" class="empty-text">暂无数据</view>
			  <checkbox-group
			      :value="userInfo.sportTypes" 
			      @change="handleSportTypesChange">
            <label v-for="type in sportTypeOptions" :key="type.value" class="sport-type-item">
              <checkbox 
                :value="type.value" 
                :checked="userInfo.sportTypes.includes(type.value)"
                :disabled="!isEditing.sportTypes"
              />
              <text class="sport-type-text">{{ type.text }}</text>
            </label>
          </checkbox-group>
        </view>
      </view>
    </view>
  </view>
</template>

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
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
  text-align: center;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
}

.avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 80rpx;
  border: 4rpx solid #f0f0f0;
  background-color: #f5f5f5;
}

.username {
  font-size: 36rpx;
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
  border: none;
  box-shadow: 0 4rpx 12rpx rgba(92, 109, 243, 0.2);
}

.info-section {
  background-color: white;
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.edit-btn {
  font-size: 26rpx;
  color: #5c6df3;
  padding: 10rpx 20rpx;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 2rpx solid #f5f5f5;
}

.label {
  width: 140rpx;
  font-size: 28rpx;
  color: #666;
}

.input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  padding: 10rpx;
}

.unit {
  width: 60rpx;
  font-size: 24rpx;
  color: #999;
  text-align: right;
}

.empty-text {
  text-align: center;
  color: #999;
  font-size: 28rpx;
  padding: 40rpx 0;
}

.bmi-card {
  background: linear-gradient(135deg, #6e7ff3, #5c6df3);
  border-radius: 24rpx;
  padding: 30rpx;
  color: white;
}

.bmi-title {
  font-size: 28rpx;
  opacity: 0.9;
  margin-bottom: 20rpx;
}

.bmi-content {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.bmi-value {
  font-size: 48rpx;
  font-weight: bold;
}

.bmi-status {
  font-size: 28rpx;
  padding: 8rpx 24rpx;
  border-radius: 30rpx;
  background: rgba(255, 255, 255, 0.2);
}

.goals-list,
.sport-types-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  padding: 10rpx 0;
}

.goal-item,
.sport-type-item {
  display: flex;
  align-items: center;
  gap: 10rpx;
  background-color: #f8f9fa;
  padding: 16rpx 24rpx;
  border-radius: 30rpx;
  transition: all 0.3s;
}

.editing .goal-item,
.editing .sport-type-item {
  background-color: #f0f2ff;
}

.goal-text,
.sport-type-text {
  font-size: 26rpx;
  color: #666;
}

// BMI状态颜色
.status-thin {
  background-color: #ffd700;
}

.status-normal {
  background-color: #52c41a;
}

.status-overweight {
  background-color: #faad14;
}

.status-obese {
  background-color: #ff4d4f;
}
</style>

<script setup>
import { ref, computed } from "vue";

const serverUrl = "http://192.168.56.1:3000";
const defaultAvatar = "/static/default-avatar.png";

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

// 编辑状态
const isEditing = ref({
  basic: false,
  goals: false,
  sportTypes: false
});

// 是否已获取用户信息
const hasUserInfo = computed(() => {
  return userInfo.value.height || userInfo.value.weight || userInfo.value.gender || userInfo.value.age;
});

// 切换编辑状态
const toggleEdit = async (section) => {
  if (isEditing.value[section]) {
    // 如果当前是编辑状态，点击后保存
    await saveChanges(section);
  }
  isEditing.value[section] = !isEditing.value[section];
};

// 保存更改
const saveChanges = async (section) => {
  try {
    const response = await uni.request({
      url: `${serverUrl}/updateUserInfo`,
      method: "POST",
      data: {
        username: userInfo.value.username,
        ...userInfo.value
      }
    });
    
    if (response.statusCode === 200) {
      uni.showToast({
        title: '保存成功',
        icon: 'success'
      });
    } else {
      throw new Error('保存失败');
    }
  } catch (error) {
    uni.showToast({
      title: '保存失败',
      icon: 'none'
    });
  }
};

// 选项数据
const genderOptions = ["男", "女"];
const goalOptions = [
  { value: "减脂", name: "减脂" },
  { value: "增肌", name: "增肌" },
  { value: "耐力", name: "耐力" },
  { value: "柔韧性", name: "柔韧性" },
  { value: "综合健身", name: "综合健身" },
];
const sportTypeOptions = [
  { value: "跑步", text: "跑步" },
  { value: "徒手", text: "徒手" },
  { value: "撸铁", text: "撸铁" },
  { value: "瑜伽", text: "瑜伽" },
  { value: "篮球", text: "篮球" },
];

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    uni.showLoading({
      title: '获取信息中...',
      mask: true
    });
    
    // 先尝试从本地缓存获取
    const cachedInfo = uni.getStorageSync('userInfo');
    if (cachedInfo) {
      userInfo.value = JSON.parse(cachedInfo);
      hasUserInfo.value = true;
    }
    
    // 然后从服务器获取最新数据
    const [error, res] = await uni.request({
      url: `${serverUrl}/getUserInfo`,
      method: "POST",
      data: {
        username: userInfo.value.username,
      },
    });

    if (error) {
      throw error;
    }

    if (res.statusCode === 200 && res.data) {
      const data = res.data;
      userInfo.value = {
        ...userInfo.value,
        height: data.height || "",
        weight: data.weight || "",
        gender: data.gender || "",
        age: data.age || "",
        goals: data.fitnessGoal ? data.fitnessGoal.split(",") : [],
        sportTypes: data.exerciseType ? data.exerciseType.split(",") : [],
      };
      uni.setStorageSync("userInfo", JSON.stringify(userInfo.value));
      hasUserInfo.value = true;
      
      uni.showToast({
        title: '获取成功',
        icon: 'success'
      });
    } else {
      throw new Error('获取信息失败');
    }
  } catch (error) {
    console.error("获取用户信息失败:", error);
    uni.showToast({
      title: '获取信息失败',
      icon: 'none'
    });
  } finally {
    uni.hideLoading();
  }
};

// 更新信息到后端
const updateInfo = async (field) => {
  console.log(`正在更新 ${field}:`, userInfo.value[field]); // 调试信息
  const updateData = {
    username: userInfo.value.username,
    [field]: userInfo.value[field],
  };

  try {
    const [error, res] = await uni.request({
      url: `${serverUrl}/updateUserInfo`,
      method: "POST",
      data: updateData,
    });

    if (error) {
      throw error;
    }

    if (res.statusCode === 200) {
      uni.showToast({
        title: "更新成功",
        icon: "success",
      });
      // 更新本地缓存
      uni.setStorageSync("userInfo", JSON.stringify(userInfo.value));
      console.log("信息更新成功"); // 调试信息
    } else {
      uni.showToast({
        title: "更新失败",
        icon: "none",
      });
      console.log("更新失败:", res); // 调试信息
    }
  } catch (error) {
    console.error("更新信息失败:", error);
    uni.showToast({
      title: "网络错误",
      icon: "none",
    });
  }
};

// 处理性别变化
const handleGenderChange = (e) => {
  userInfo.value.gender = genderOptions[e.detail.value];
  updateInfo("gender");
};

// 处理运动目标变化
const handleGoalsChange = (e) => {
  userInfo.value.goals = e.detail.value;
  updateInfo("goals");
};

// 处理运动类型变化
const handleSportTypesChange = (e) => {
  userInfo.value.sportTypes = e.detail.value;
  updateInfo("sportTypes");
};

// 计算BMI
const calculateBMI = () => {
  if (!userInfo.value.height || !userInfo.value.weight) return "未知";
  const height = userInfo.value.height / 100; // 转换为米
  const bmi = (userInfo.value.weight / (height * height)).toFixed(1);
  return bmi;
};

// 获取BMI状态
const getBMIStatus = () => {
  const bmi = calculateBMI();
  if (bmi === "未知") return "";
  if (bmi < 18.5) return "偏瘦";
  if (bmi < 24) return "正常";
  if (bmi < 28) return "偏胖";
  return "肥胖";
};

// 更换头像
const changeAvatar = () => {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0];
      // 上传头像到服务器
      uni.uploadFile({
        url: `${serverUrl}/uploadAvatar`,
        filePath: tempFilePath,
        name: "avatar",
        formData: {
          username: userInfo.value.username,
        },
        success: (uploadRes) => {
          const data = JSON.parse(uploadRes.data);
          if (data.success) {
            userInfo.value.avatar = data.url;
            uni.setStorageSync("userInfo", JSON.stringify(userInfo.value));
            uni.showToast({
              title: "头像更新成功",
              icon: "success",
            });
          }
        },
      });
    },
  });
};

// 添加 BMI 状态样式类
const getBMIStatusClass = () => {
  const bmi = calculateBMI();
  if (bmi === '未知') return '';
  if (bmi < 18.5) return 'status-thin';
  if (bmi < 24) return 'status-normal';
  if (bmi < 28) return 'status-overweight';
  return 'status-obese';
};
</script>
