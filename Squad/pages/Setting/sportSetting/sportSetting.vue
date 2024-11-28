<template>
  <view class="sport-container">
    <!-- 运动目标多选框 -->
    <view class="checkbox-group">
      <text class="label">运动目标：</text>
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
    </view>

    <!-- 运动类型多选框 -->
    <view class="checkbox-group">
      <text class="label">运动类型：</text>
      <fui-checkbox-group v-model="form.types">
        <fui-label v-for="(item, index) in typeOptions" :key="index">
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
    </view>

    <!-- 提交按钮 -->
    <button class="submit-btn" :disabled="!isFormValid" @click="submitData">提交</button>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';

const serverUrl = "http://192.168.56.1:3000"; // 后端接口地址

const goalOptions = ref([
  { value: "减脂", name: "减脂", checked: false },
  { value: "增肌", name: "增肌", checked: false },
  { value: "耐力", name: "耐力", checked: false },
  { value: "柔韧性", name: "柔韧性", checked: false },
  { value: "综合健身", name: "综合健身", checked: false },
]);

const typeOptions = ref([
  { value: "跑步", name: "跑步", checked: false },
  { value: "游泳", name: "游泳", checked: false },
  { value: "徒手", name: "徒手", checked: false },
  { value: "瑜伽", name: "瑜伽", checked: false },
  { value: "篮球", name: "篮球", checked: false },
]);

const form = ref({
  goals: [],
  types: [],
});

// 校验表单是否有选择项
const isFormValid = computed(() => {
  return form.value.goals.length > 0 && form.value.types.length > 0;
});

// 获取用户的运动数据
onMounted(() => {
  fetchUserSportData();
});

const fetchUserSportData = async () => {
  try {
    const res = await uni.request({
      url: `${serverUrl}/getSportData`, // 后端接口地址
      method: "POST",
      data: { username: uni.getStorageSync("username") },
    });

    if (res.data.success) {
      // 获取运动目标和类型
      const fitnessGoal = res.data.data.fitnessGoal.split(',');
      const exerciseType = res.data.data.exerciseType.split(',');

      // 更新goalOptions中的checked状态
      goalOptions.value.forEach(item => {
        if (fitnessGoal.includes(item.value)) {
          item.checked = true;
        }
      });

      // 更新typeOptions中的checked状态
      typeOptions.value.forEach(item => {
        if (exerciseType.includes(item.value)) {
          item.checked = true;
        }
      });

      // 更新表单默认值
      form.value.goals = fitnessGoal;
      form.value.types = exerciseType;
    } else {
      uni.showToast({ title: "获取数据失败", icon: "none" });
    }
  } catch (error) {
    console.error("获取运动数据失败:", error);
    uni.showToast({ title: "服务器错误", icon: "none" });
  }
};

// 提交用户选择的数据
const submitData = async () => {
  try {
    const res = await uni.request({
      url: `${serverUrl}/updateSportData`, // 后端接口地址
      method: "POST",
      data: {
        username: uni.getStorageSync("username"),
        fitnessGoal: form.value.goals.join(','),
        exerciseType: form.value.types.join(','),
      },
    });

    if (res.data.success) {
		// 返回上一级页面
	  uni.navigateBack();
      uni.showToast({ title: "数据提交成功", icon: "success" });
    } else {
      uni.showToast({ title: res.data.message || "提交失败", icon: "none" });
    }
  } catch (error) {
    console.error("提交数据失败:", error);
    uni.showToast({ title: "服务器错误", icon: "none" });
  }
};
</script>

<style scoped>
.sport-container {
  padding: 20rpx;
  background-color: #f7f7f7;
  min-height: 100vh;
}

.checkbox-group {
  margin-bottom: 20rpx;
}

.label {
  font-size: 32rpx;
  margin-bottom: 10rpx;
  display: block;
  color: #333;
}

.submit-btn {
  width: 100%;
  padding: 20rpx;
  font-size: 34rpx;
  background-color: #4caf50;
  color: #fff;
  border: none;
  border-radius: 10rpx;
  text-align: center;
  transition: all 0.3s ease;
}

.submit-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
