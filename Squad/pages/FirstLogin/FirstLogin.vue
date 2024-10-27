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
        placeholder="请输入身高"
        class="input-field"
        clearable
      ></uni-easyinput>
      <view class="spacing"></view>
      <uni-easyinput
        v-model="form.weight"
        placeholder="请输入体重"
        class="input-field"
        clearable
      ></uni-easyinput>
      <view class="spacing"></view>
      <view class="button-group">
        <button class="button secret" @click="nextStep">保密</button>
        <button class="button confirm" @click="nextStep">确定</button>
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
        placeholder="请输入性别"
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
        <button class="button confirm" @click="nextStep">确定</button>
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
        <button class="button confirm" @click="nextStep">确定</button>
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
        <button class="button confirm" @click="submitForm">确定</button>
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
  { value: "weight_loss", name: "减肥", checked: false },
  { value: "muscle_gain", name: "增肌", checked: false },
  { value: "endurance", name: "耐力", checked: false },
  { value: "flexibility", name: "柔韧性", checked: false },
  { value: "general_fitness", name: "综合健身", checked: false },
];

const sportTypeOptions = [
  { value: "running", text: "跑步", checked: false },
  { value: "swimming", text: "游泳", checked: false },
  { value: "weightlifting", text: "举重", checked: false },
  { value: "yoga", text: "瑜伽", checked: false },
  { value: "basketball", text: "篮球", checked: false },
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
const submitForm = () => {
  console.log("表单提交", form.value);
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
