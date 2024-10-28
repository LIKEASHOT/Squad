<template>
  <view class="container">
    <!-- 返回按钮 -->
    <img
      v-if="step > 1"
      src="/static/back/返回 (2).png"
      alt="返回"
      class="back-icon"
      @click="prevStep"
    />
    <!-- 上半部分: 浅灰背景 -->
    <view class="upper-section">
      <image :src="logo" class="logo"></image>
      <text class="welcome-title">欢迎来到</text>
      <text class="app-name">Squad</text>
    </view>

    <!-- Step 1: 输入身高与体重 -->
    <view class="lower-section" v-if="step === 1">
      <text class="instructions">输入身高与体重，获取更准确的热量消耗</text>
      <p><br /></p>
      <text class="subtext">个人的身高体重不同，热量消耗也会有所不同。</text>
      <view class="spacing"></view>
      <uni-easyinput
        v-model="form.height"
        placeholder="请输入身高/cm"
        class="input-field"
        clearable
      ></uni-easyinput>
      <view class="spacing"></view>
      <uni-easyinput
        v-model="form.weight"
        placeholder="请输入体重/kg"
        class="input-field"
        clearable
      ></uni-easyinput>
      <view class="spacing"></view>
      <view class="button-group">
        <button class="button secret" @click="nextStep">保密</button>
        <button class="button confirm" @click="submitHealthInfo">确定</button>
        <view class="spacing"></view>
        <view class="skip-container">
          <button plain="true" class="skip-button" @click="submitForm">
            我有十分丰富的运动经验，可以直接使用→
          </button>
        </view>
      </view>
    </view>

    <!-- Step 2: 输入性别与年龄 -->
    <view class="lower-section" v-if="step === 2">
      <text class="instructions">输入性别与年龄</text>
      <p><br /></p>
      <text class="subtext">完善个人信息，更科学地获取运动指导。</text>
      <view class="spacing"></view>
      <uni-easyinput
        v-model="form.gender"
        placeholder="请输入性别(男/女)"
        class="input-field"
        clearable
      ></uni-easyinput>
      <view class="spacing"></view>
      <uni-easyinput
        v-model="form.age"
        placeholder="请输入年龄"
        class="input-field"
        clearable
      ></uni-easyinput>
      <view class="spacing"></view>
      <view class="button-group">
        <button class="button secret" @click="nextStep">保密</button>
        <button class="button confirm" @click="submitGenderAge">确定</button>
        <view class="spacing"></view>
        <view class="skip-container">
          <button plain="true" class="skip-button" @click="submitForm">
            我有十分丰富的运动经验，可以直接使用→
          </button>
        </view>
      </view>
    </view>

    <!-- Step 3: 选择运动目标 -->
    <view class="lower-section" v-if="step === 3">
      <text class="instructions">您的运动目标是？</text>
      <p><br /></p>
      <text class="subtext">了解运动目标，我们能更好地为您推送运动计划。</text>
      <view class="spacing"></view>
      <!-- 使用fui-checkbox-group替换运动目标的多选框 -->
      <fui-checkbox-group v-model="form.goals">
        <fui-label v-for="(item, index) in goalOptions" :key="index">
          <fui-list-cell>
            <view class="fui-align__center">
              <fui-checkbox
                :checked="item.checked"
                :value="item.value"
                color="#777CFF"
                borderColor="#B2B2B2"
                borderRadius="8rpx"
              />
              <text class="fui-text">{{ item.name }}</text>
            </view>
          </fui-list-cell>
        </fui-label>
      </fui-checkbox-group>
      <view class="spacing"></view>
      <view class="button-group">
        <button class="button secret" @click="nextStep">保密</button>
        <button class="button confirm" @click="submitFitnessGoal">确定</button>
      </view>
      <view class="spacing"></view>
      <view class="skip-container">
        <button plain="true" class="skip-button" @click="submitForm">
          我有十分丰富的运动经验，可以直接使用→
        </button>
      </view>
    </view>

    <!-- Step 4: 选择运动类型 -->
    <view class="lower-section" v-if="step === 4">
      <text class="instructions">您喜欢的运动类型是？</text>
      <p><br /></p>
      <text class="subtext">了解运动类型，我们能更好地为您推送运动计划。</text>
      <view class="spacing"></view>
      <!-- 使用fui-checkbox-group替换运动类型的多选框 -->
      <fui-checkbox-group v-model="form.sportTypes">
        <fui-label v-for="(item, index) in sportTypeOptions" :key="index">
          <fui-list-cell>
            <view class="fui-align__center">
              <fui-checkbox
                :checked="item.checked"
                :value="item.value"
                color="#777CFF"
                borderColor="#B2B2B2"
                borderRadius="8rpx"
              />
              <text class="fui-text">{{ item.text }}</text>
            </view>
          </fui-list-cell>
        </fui-label>
      </fui-checkbox-group>
      <view class="spacing"></view>
      <view class="button-group">
        <button class="button secret" @click="submitForm">保密</button>
        <button class="button confirm" @click="submitExerciseType">确定</button>
      </view>
      <view class="spacing"></view>
      <view class="skip-container">
        <button plain="true" class="skip-button" @click="submitForm">
          我有十分丰富的运动经验，可以直接使用→
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";

const logo = "/static/Squad1.png";
const step = ref(1);

const form = ref({
  height: "",
  weight: "",
  gender: "",
  age: "",
  goals: [],
  sportTypes: [],
});

const goalOptions = [
  { value: "减脂", name: "减脂", checked: false },
  { value: "增肌", name: "增肌", checked: false },
  { value: "耐力", name: "耐力", checked: false },
  { value: "柔韧性", name: "柔韧性", checked: false },
  { value: "综合健身", name: "综合健身", checked: false },
];

const sportTypeOptions = [
  { value: "跑步", text: "跑步", checked: false },
  { value: "游泳", text: "游泳", checked: false },
  { value: "撸铁", text: "撸铁", checked: false },
  { value: "瑜伽", text: "瑜伽", checked: false },
  { value: "篮球", text: "篮球", checked: false },
];

const nextStep = () => {
  if (step.value < 4) {
    step.value++;
  }
};
const prevStep = () => {
  if (step.value > 1) {
    step.value--;
  }
};
//更新身高体重
const submitHealthInfo = () => {
  if (!form.value.height || !form.value.weight) {
    uni.showToast({
      title: "请输入身高和体重",
      icon: "none",
    });
    return;
  }

  console.log("提交身高和体重", form.value);

  uni.request({
    url: 'http://192.168.56.1:3000/updateHealthInfo', // 后端 API 地址
    method: 'POST',
	
    data: {
      height: form.value.height,
      weight: form.value.weight,
    },
    success: (res) => {
      console.log('身高体重更新成功', res);
      if (res.statusCode === 200) {
        uni.showToast({
          title: `更新成功，BMI: ${res.data.bmi}`,
          icon: "success",
        });
      } else {
        uni.showToast({
          title: res.data.error || '更新失败',
          icon: 'none',
        });
      }
    },
    fail: (err) => {
      console.error('请求失败：', err);
      uni.showToast({
        title: '网络请求失败',
        icon: 'none',
      });
    }
  });
  if (step.value < 4) {
    step.value++;
  }
};
// 更新性别年龄
const submitGenderAge = () => {
  if (!form.value.gender || !form.value.age) {
    uni.showToast({
      title: "请输入性别和年龄",
      icon: "none",
    });
    return;
  }

  console.log("提交性别和年龄", form.value);

  uni.request({
    url: 'http://192.168.56.1:3000/updateGenderAge', // 后端 API 地址
    method: 'POST',
    data: {
      gender: form.value.gender,
      age: form.value.age,
    },
    header: {
      'Content-Type': 'application/json', // 设置请求头
      // 这里可以添加认证信息，例如 JWT
      // 'Authorization': `Bearer ${yourToken}`
    },
    success: (res) => {
      console.log('性别和年龄更新成功', res);
      if (res.statusCode === 200) { // 修改为 200
        uni.showToast({
          title: "更新成功",
          icon: "success",
        });
      } else {
        uni.showToast({
          title: res.data.error || '更新失败',
          icon: 'none',
        });
      }
    },
    fail: (err) => {
      console.error('请求失败：', err);
      uni.showToast({
        title: '网络请求失败',
        icon: 'none',
      });
    }
  });
  if (step.value < 4) {
    step.value++;
  }
};
// 更新运动目标
const submitFitnessGoal = () => {
  const selectedGoals = goalOptions.filter(option => option.checked).map(option => option.value);

  if (selectedGoals.length === 0) {
    uni.showToast({
      title: "请选择至少一个运动目标",
      icon: "none",
    });
    return;
  }

  console.log("提交运动目标", selectedGoals.join(','));

  uni.request({
    url: 'http://192.168.56.1:3000/updateFitnessGoal', 
    method: 'POST',
    data: {
      fitnessGoal: selectedGoals.join(','),// 将数组转换为字符串，使用逗号分隔
    },
    header: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${yourToken}` // 需要设置实际 token
    },
    success: (res) => {
      console.log('运动目标更新成功', res);
      if (res.statusCode === 200) {
        uni.showToast({
          title: "更新成功",
          icon: "success",
        });
      } else {
        uni.showToast({
          title: res.data.error || '更新失败',
          icon: 'none',
        });
      }
    },
    fail: (err) => {
      console.error('请求失败：', err);
      uni.showToast({
        title: '网络请求失败',
        icon: 'none',
      });
    }
  });
  if (step.value < 4) {
    step.value++;
  }
};
// 更新运动方式
const submitExerciseType = () => {
  const selectedTypes = sportTypeOptions.filter(option => option.checked).map(option => option.value);

  if (selectedTypes.length === 0) {
    uni.showToast({
      title: "请选择至少一种运动方式",
      icon: "none",
    });
    return;
  }

  console.log("提交运动方式", selectedTypes.join(','));

  uni.request({
    url: 'http://192.168.56.1:3000/updateExerciseType',
    method: 'POST',
    data: {
      exerciseType: selectedTypes.join(','),
    },
	header: {
	  'Content-Type': 'application/json',
	  // 'Authorization': `Bearer ${yourToken}` // 需要设置实际 token
	},
    success: (res) => {
      console.log('运动方式更新成功', res);
      if (res.statusCode === 200) {
        uni.showToast({
          title: "更新成功",
          icon: "success",
        });
      } else {
        uni.showToast({
          title: res.data.error || '更新失败',
          icon: 'none',
        });
      }
    },
    fail: (err) => {
      console.error('请求失败：', err);
      uni.showToast({
        title: '网络请求失败',
        icon: 'none',
      });
    }
  });
  if (step.value < 4) {
    step.value++;
  }
};

</script>

<style lang="scss" scoped>
.container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 上半部分: 浅灰背景 */
.upper-section {
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  justify-content: flex-start; /* 内容靠上对齐 */
}

.logo {
  width: 120px;
  height: 120px;
  border-radius: 50%;
}

.welcome-title {
  font-size: 18px;
  margin-top: 10px;
}

.app-name {
  font-size: 24px;
  font-weight: bold;
  margin-top: 5px;
}

/* 下半部分: 白色背景 */
.lower-section {
  background-color: white;
  flex: 1;
  padding: 20px;
}

.instructions {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
}

.subtext {
  font-size: 12px;
  color: #999;
  margin-bottom: 20px;
}

/* 输入框样式 */
.input-field {
  border-radius: 30px;
}

/* 按钮样式 */
.button-group {
  display: flex;
  justify-content: space-between;
}

.button {
  flex: 1;
  margin: 5px;
  background-color: #333;
  color: white;
  border-radius: 25px;
  font-size: 14px;
  text-align: center;
}

.confirm {
  background-color: black;
}

.secret {
  background-color: gray;
}

.spacing {
  height: 20px;
}
.spacing {
  height: 20px;
}
.uni-list {
  margin: 20px 0;
}

.uni-list-cell {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #e0e0e0;
}

.uni-list-cell-pd {
  padding-left: 15px;
}

.checkbox-container {
  display: flex;
  align-items: center;
}
.checkbox-label {
  margin-left: 10px; /* 调整文本与复选框之间的间距 */
}
.skip-container {
  background-color: white; /* 下半部分背景颜色 */
  position: fixed;
  bottom: 0;
  height: 50px;
}

.skip-button {
  background-color: transparent;
  color: #999;
  border: none;
  text-align: center;
  font-size: 14px;
}
.fui-section__title {
  margin-left: 32rpx;
}

.fui-list__item {
  width: 100%;
  display: flex;
  align-items: center;
  background-color: #ffffff;
  padding: 28rpx 32rpx;
  box-sizing: border-box;
}

.fui-text {
  font-size: 30rpx;
  padding-left: 16rpx;
}

.fui-list__cell {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.back-icon {
  width: 24px; /* 根据需要调整大小 */
  height: 24px;
  margin-left: 20px; /* 调整位置 */
  margin-top: 10px;
  transition: opacity 0.3s;
}

.back-button:hover .back-icon {
  opacity: 0.7;
}
</style>
