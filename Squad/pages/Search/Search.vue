<template>
  <div class="search-page">
    <!-- 搜索输入框 -->
    <div class="search-header">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="搜索"
        class="search-input"
        @input="onSearchInput"
      />
      <button class="cancel-button" @click="cancelSearch">取消</button>
    </div>
	<!-- 推荐内容 -->
		<div class="recommendations" v-if="!searchQuery">
		  <h3>推荐内容</h3>
		  <ul>
			<li
			  v-for="(item, index) in recommendations"
			  :key="index"
			  @click="selectRecommendation(item)"
			>
			  {{ item }}
			</li>
		  </ul>
		</div>
    <!-- 搜索结果 -->
		<div class="plan-list" v-if="filteredPlans.length > 0">
		<h3>搜索结果</h3>
		  <div
			v-for="(item, index) in filteredPlans"
			:key="index"
			class="plan-item"
		  >
			<image :src="item.imageUrl" class="plan-image" />
			<div class="plan-info">
			  <span class="plan-title">{{ item.title }}</span>
			  <span class="plan-times">运动次数：{{ item.times }}</span>
			  <span class="plan-duration">时间：{{ item.duration }}</span>
			  <span class="plan-difficulties"
				>难度：{{ item.difficulties }}</span
			  >
			  <span class="plan-calorie">卡路里：{{ item.calorie }}</span>
			</div>
			<div class="vertical-line"></div>
			<!-- 添加 & 删除按钮 -->
			<view class="op_bar">
			  <image
				:src="add_icon"
				class="add_icon"
				@click.stop="handleAdd(item)"
			  />
			  <image
				:src="delete_icon"
				class="delete_icon"
				@click.stop="handleRemove(item)"
			  />
			</view>
		  </div>
		</div>
        <!-- 无搜索结果 -->
        <div v-else-if="searchQuery" class="no-results">
          未找到匹配的计划
        </div>
      </div>
</template>

<script setup>
import {  inject,ref, computed, onMounted } from 'vue';

// 响应式数据定义
const searchQuery = ref('');
const recommendations = ref([]);
const plans = ref([]);
const myPlans = ref([]);
const add_icon = '/static/icon/add.png';
const delete_icon = '/static/icon/delete.png';
const username = uni.getStorageSync('username');
const serverUrl = "http://10.133.80.141:3000"; // 服务器地址
// 计算属性：根据搜索关键词筛选计划
const filteredPlans = computed(() => {
  if (!searchQuery.value) return [];
  return plans.value.filter(item =>
    item.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});
// 页面加载时调用
onMounted(() => {
  loadMyPlans();
  loadRecommendations();
  fetchPlansFromBackend();
});
// 加载当前用户的计划
const loadMyPlans = () => {
  const storedPlans = uni.getStorageSync(`myPlans_${username}`);
  if (storedPlans) {
    myPlans.value = JSON.parse(storedPlans);
  } else {
    myPlans.value = [];
  }
};
// 添加计划到“我的计划”
const handleAdd = (plan) => {
  // 先加载现有的计划
  let currentPlans = uni.getStorageSync(`myPlans_${username}`);
  currentPlans = currentPlans ? JSON.parse(currentPlans) : [];

  // 检查该计划是否已经存在
  const isPlanExists = currentPlans.some((item) => item.title === plan.title);

  if (isPlanExists) {
    console.log("该计划已经添加过:", plan.title);
    uni.showToast({
      title: "计划已存在",
      icon: "none",
    });
    return; // 如果已存在，直接返回
  }

  // 如果计划不存在，则添加新计划
  currentPlans.push(plan);

  // 存储回本地
  uni.setStorageSync(`myPlans_${username}`, JSON.stringify(currentPlans));
  console.log("计划已添加:", plan.title);
  // 重新加载计划
  loadMyPlans();
  // 通知 Home 页面计划已更新
    uni.$emit('plansUpdated');
  
};
// 从“我的计划”中删除
const handleRemove = (plan) => {
  // 先加载现有的计划
  let currentPlans = uni.getStorageSync(`myPlans_${username}`);
  currentPlans = currentPlans ? JSON.parse(currentPlans) : [];

  // 过滤掉要删除的计划
  const updatedPlans = currentPlans.filter((item) => item.title !== plan.title);

  // 存储回本地
  uni.setStorageSync(`myPlans_${username}`, JSON.stringify(updatedPlans));
  console.log("计划已删除:", plan.title);

  // 重新加载计划
  loadMyPlans();
  // 通知 Home 页面计划已更新
    uni.$emit('plansUpdated');
};

// 加载推荐内容
const loadRecommendations = () => {
  recommendations.value = ['燃脂', '增肌', '瑜伽', '训练'];
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
          goal: item.goal ? item.goal.split(",").map((g) => g.trim()) : [], // 将 goal 字符串按逗号拆分并去除空格
          type: item.type,
        }));
        
      } else {
        console.log("未找到相关计划数据");
      }
    },
    fail: (err) => {
      console.error("请求失败:", err);
    },
  });
};

// 用户输入搜索关键词
const onSearchInput = () => {
  console.log('当前搜索关键词:', searchQuery.value);
};

const selectRecommendation = (item) => {
  searchQuery.value = item;
};

const cancelSearch = () => {
  searchQuery.value = '';
  uni.switchTab({ url: '/pages/Home/Home' });
};

// 生命周期：组件挂载后加载数据

</script>

<style scoped>
.search-page {
  padding: 10px;
}

.search-header {
  display: flex;
  align-items: center;
}

.search-input {
  flex: 1;
  padding: 5px 10px;
  border: 1px solid #ccc;
  border-radius: 20px;
}

.cancel-button {
  margin-left: 10px;
  background: none;
  border: none;
  color: #007aff;
  cursor: pointer;
}

.recommendations {
  margin-top: 20px;
}

.recommendations ul {
  list-style: none;
  padding: 0;
}

.recommendations li {
  padding: 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.recommendations li:hover {
  background-color: #f5f5f5;
}



.plan-list {
  margin-top: 10px;
}

.plan-item {
  display: flex;
  flex-direction: row;
  margin-top: 20px;

  box-shadow: 0 4px 8px rgba(94, 87, 87, 0.603); /* 添加边界阴影 */
}

.plan-image {
  margin-top: 2.5px;
  margin-left: 2.5px;
  width: 700rpx;
  height: 215rpx;
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
.no-results {
  margin-top: 20px;
  color: #888;
}
.add_icon {
  width: 100rpx;
  height: 100rpx;
}
.delete_icon {
  width: 100rpx;
  height: 100rpx;
  margin-top: 10rpx;
}

.vertical-line {
  position: relative;
  width: 2px;
  background-color: #ccc;
}
</style>

