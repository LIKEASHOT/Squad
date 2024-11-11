<template>
  <div class="container">
    <!-- 搜索栏 -->
    <div class="search-bar" @click="goToSearchPage">
      <span class="search-placeholder">请输入搜索内容</span>
    </div>
    <!-- 计划和日程切换 -->
    <div class="tab-container">
      <span :class="{ active: tab === 'plan' }" @click="switchTab('plan')"
        >计划</span
      >
      <span
        :class="{ active: tab === 'schedule' }"
        @click="switchTab('schedule')"
        >日程</span
      >
      <span
        :class="{ active: tab === 'plan-board' }"
        @click="switchTab('plan-board')"
        v-if="IsManager === true"
        >计划管理</span
      >
    </div>

    <!-- 计划内容 -->
    <div v-if="tab === 'plan'" class="plan-section">
      <!-- 使用Vue的导航栏进行全部和智能定制的切换 -->
      <div class="nav-bar">
        <button
          @click="selectButton('all')"
          :class="{ active: activeButton === 'all' }"
        >
          全部
        </button>
        <button
          @click="selectButton('custom')"
          :class="{ active: activeButton === 'custom' }"
        >
          智能定制
        </button>
      </div>

      <view v-if="activeButton === 'all'">
        <div class="filter-bar">
          <div class="filter">
            <uni-section
              title="目标"
              type="line"
              style="background-color: #f5f5f5"
            >
              <uni-data-select
                v-model="selectedGoal"
                :localdata="goals"
                @change="filterPlans"
                :clear="false"
                style="height: 10px; padding: 1px 1px; font-size: 1px"
              ></uni-data-select>
            </uni-section>
          </div>
          <div class="filter">
            <uni-section
              title="类型"
              type="line"
              style="background-color: #f5f5f5"
            >
              <uni-data-select
                v-model="selectedType"
                :localdata="types"
                @change="filterPlans"
                :clear="false"
                style="height: 10px; padding: 1px 1px; font-size: 1px"
              ></uni-data-select>
            </uni-section>
          </div>
          <div class="filter">
            <uni-section
              title="难度"
              type="line"
              style="background-color: #f5f5f5"
            >
              <uni-data-select
                v-model="selectedDifficulty"
                :localdata="difficulties"
                @change="filterPlans"
                :clear="false"
                style="height: 10px; padding: 1px 1px; font-size: 1px"
              ></uni-data-select>
            </uni-section>
          </div>
        </div>

        <!-- 滚动计划列表 -->
        <div class="plan-list">
          <div
            v-for="(item, index) in filteredPlans"
            :key="index"
            class="plan-item"
            @click="openPlanDetail(item)"
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
      </view>
      <view v-if="activeButton === 'custom'">
        <!-- 智能定制内容 -->
        <div class="ai-customization">
          <textarea
            v-model="aiInput"
            placeholder="请输入您的需求..."
            class="ai-input"
          ></textarea>
          <button @click="getCustomPlan" class="ai-button">获取定制计划</button>
          <div v-if="customPlan" class="custom-plan">
            <h3>定制计划</h3>
            <div v-html="customPlan"></div>
            <!-- 渲染 HTML 内容 -->
          </div>
        </div>
      </view>
    </div>

    <!-- 日程内容 -->
    <view class="schedule-section" v-if="tab === 'schedule'">
      <view class="top_bar_sport">
        <view class="sportbar">
          <l-circle
            v-model:current="modelVale"
            :percent="target"
            :size="50"
            class="circle_process"
            strokeColor="#69c27d"
            trailWidth="12"
            strokeWidth="12"
            lineCap="butt"
          >
            <!-- <text>{{ modelVale }}%</text> -->
          </l-circle>
          <div class="exercise-duration">
            <span>今日运动时长</span>
            <span>{{ currentExercise }} / {{ planExercise }} 分钟</span>
          </div>
        </view>
        <view>
          <image src="../../static/icon/shot_sport.png" class="shot_icon">
          </image>
        </view>
      </view>
      <view v-if="showCalendar_bar === false">
        <view class="week_sport_bar">
          <view
            v-for="(day, index) in weekDays"
            :key="index"
            @click="openDaySchedule(day)"
          >
            <text>{{ day.date }}</text>
            <l-circle
              v-model:current="modelVale"
              :percent="day.progress"
              :size="30"
              class="circle_process"
              strokeColor="#69c27d"
              trailWidth="8"
              strokeWidth="8"
              lineCap="butt"
            >
              <!-- <text>{{ modelVale }}%</text> -->
            </l-circle>
          </view>
        </view>
        <view>
          <!-- 日历下拉条 -->
          <view class="calendar_dropbar">
            <text>查看月历</text>
            <image
              class="dropbar"
              src="../../static/icon/dropdown.png"
              @click="toggleCalendar"
            ></image>
          </view>
        </view>
        <view class="plat_bar">
          <view class="func_set">
            <view class="my_plan">
              <button
                @click="To_myplan"
                :class="{ swcbt: true, active: showMyplan }"
              >
                <text>我的计划</text>
              </button>
            </view>
            <view class="my_eat">
              <button
                @click="To_myeat"
                :class="{ swcbt: true, active: showMyeat }"
              >
                <text>我的饮食</text>
              </button>
            </view>
          </view>
          <!-- 我的计划展示 -->
          <view v-if="showMyplan === true">
            <div class="plan-list">
              <div
                v-for="(item, index) in myPlans"
                :key="index"
                class="plan-item"
                @click="openPlanDetail(item)"
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
          </view>
          <view v-if="showMyeat === true" class="eat_page">
            <view>
              <l-circle
                v-model:current="modelVale"
                :percent="target_eat_percent"
                :size="120"
                class="circle_process_eat"
                trailWidth="20"
                strokeWidth="20"
                lineCap="butt"
                strokeColor="#7F83F7"
              >
                <view class="eat_left">
                  <text class="b1_highlight">还可摄入</text>
                  <text class="b_highlight">{{ today_left_eat }}</text>
                  <text class="gray_color">千卡</text>
                </view>

                <!-- <text>{{ modelVale }}%</text> -->
              </l-circle>
              <button class="take_picture">
                <text>拍照识别</text>
              </button>
              <view class="picture_return">
                <text>识别结果</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      <view v-if="showCalendar_bar === true">
        <!-- 日历下拉条 -->
        <view class="calendar_dropbar">
          <view class="calendar-content" v-if="showCalendar">
            <uni-section title="日历" type="line"></uni-section>
            <view>
              <!-- 插入模式 -->
              <uni-calendar
                class="uni-calendar--hook"
                :selected="info.selected"
                :showMonth="false"
                @change="change"
                @monthSwitch="monthSwitch"
              />
            </view>
          </view>
          <!-- 打卡和签到按钮 -->
          <div class="action-buttons">
            <button @click="addCheckIn">打卡</button>
            <button @click="addSignIn">签到</button>
          </div>
          <!-- 显示 selected 的内容 -->
          <div class="selected-list">
            <h3>已选日期</h3>
            <ul>
              <li v-for="(item, index) in info.selected" :key="index">
                {{ item.date }} - {{ item.info }}
                <button @click="removeSelected(index)">删除</button>
              </li>
            </ul>
          </div>
          <image
            class="dropbar"
            src="../../static/icon/dropdown.png"
            @click="toggleCalendar"
          ></image>
        </view>
      </view>
    </view>
    <view class="plan-manage-board" v-if="tab === 'plan-board'">
      <div class="plan-manage-header">
        <div class="filter-section">
          <!-- 筛选器部分 -->
          <div class="filter-bar-planboard">
            <div class="filter">
              <uni-section
                title="目标"
                type="line"
                style="background-color: #f5f5f5"
              >
                <uni-data-select
                  v-model="selectedGoal"
                  :localdata="goals"
                  @change="filterPlans"
                  :clear="false"
                >
                </uni-data-select>
              </uni-section>
            </div>
            <div class="filter">
              <uni-section
                title="类型"
                type="line"
                style="background-color: #f5f5f5"
              >
                <uni-data-select
                  v-model="selectedType"
                  :localdata="types"
                  @change="filterPlans"
                  :clear="false"
                >
                </uni-data-select>
              </uni-section>
            </div>
            <div class="filter">
              <uni-section
                title="难度"
                type="line"
                style="background-color: #f5f5f5"
              >
                <uni-data-select
                  v-model="selectedDifficulty"
                  :localdata="difficulties"
                  @change="filterPlans"
                  :clear="false"
                >
                </uni-data-select>
              </uni-section>
            </div>
            <!-- 添加计划按钮 -->
            <button
              type="primary"
              @click="handleAddPlan_board"
              class="add-plan-btn"
            >
              添加计划
            </button>
          </div>
        </div>
      </div>
      <!-- 计划列表 -->
      <div class="plan-list">
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
            <span class="plan-difficulties">难度：{{ item.difficulties }}</span>
            <span class="plan-calorie">卡路里：{{ item.calorie }}</span>
          </div>
          <div class="vertical-line"></div>
          <!-- 修改按钮 -->
          <div class="op_bar">
            <button
              class="modify-button"
              type="primary"
              @click="handleEdit(item, index)"
            >
              修改
            </button>
          </div>
        </div>
      </div>
      <!-- 添加/编辑计划的弹窗 -->
    </view>
    <view v-if="tab==='add_change_plan'" class="modboard">
      <view class="popup-content">
          <scroll-view 
      scroll-y="true"
      class="scroll-area"
    >
          <view class="popup-title">{{ dialogTitle }}</view>
          <!-- 表单内容使用scroll-view -->

            <uni-forms :model="planForm" labelWidth="80px">
              <uni-forms-item label="名称">
                <uni-easyinput
                  v-model="planForm.title"
                  placeholder="请输入名称"
                />
              </uni-forms-item>

              <uni-forms-item label="运动次数">
                <uni-easyinput
                  v-model="planForm.times"
                  type="string"
                  placeholder="请输入运动次数"
                />
              </uni-forms-item>

              <uni-forms-item label="时间">
                <uni-easyinput
                  v-model="planForm.duration"
                  placeholder="请输入时间"
                />
              </uni-forms-item>
              <uni-forms-item label="卡路里">
                <uni-easyinput
                  v-model="planForm.calorie"
                  type="number"
                  placeholder="请输入卡路里"
                />
              </uni-forms-item>
              <uni-forms-item label="运动类型">
                <uni-data-select
                  v-model="planForm.type"
                  :localdata="types"
                  placeholder="请选择运动类型"
                />
              </uni-forms-item>
              <uni-forms-item label="运动目标">
                <uni-data-checkbox
                  placeholder="请选择运动目标"
                  v-model="planForm.goal"
                  :localdata="goals"
                  multiple
                  :map="{ text: 'text', value: 'value' }"
                />
              </uni-forms-item>
              <uni-forms-item label="难度">
                <uni-data-select
                  v-model="planForm.difficulties"
                  :localdata="difficulties"
                  placeholder="请选择难度"
                />
              </uni-forms-item>
              <uni-forms-item label="封面">
                <uni-easyinput
                  v-model="planForm.imageUrl"
                  type="string"
                  placeholder="请输入封面url"
                />
              </uni-forms-item>
              <uni-forms-item label="视频链接">
                <uni-easyinput
                  v-model="planForm.videoUrl"
                  type="string"
                  placeholder="请输入演示视频url"
                />
              </uni-forms-item>
            </uni-forms>

          <view class="popup-buttons">
            <button class="btn-cancel" @click="closePopup">取消</button>
            <button class="btn-confirm" type="primary" @click="savePlan()">
              确定
            </button>
          </view>
        </scroll-view>
        </view>
    </view>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch, provide } from "vue";
import MarkdownIt from "markdown-it";
import LCircle from "@/uni_modules/lime-circle/components/l-circle/l-circle.vue"; // 引入组件
import { type } from "../../uni_modules/uni-forms/components/uni-forms/utils";
const serverUrl = "http://10.133.80.141:3000"; // 服务器地址
const target = ref(50);
const modelVale = ref(0);
const target_eat_percent = ref(50);
const tab = ref("plan"); // 当前选中的标签
const activeButton = ref("all"); // 当前选中的按钮
const selectedGoal = ref("全部"); // 选中的目标筛选项
const selectedType = ref("全部"); // 选中的类型筛选项
const selectedDifficulty = ref("全部"); // 选中的难度筛选项
const username = uni.getStorageSync("username"); // 获取已登录用户的用户名
const showMyplan = ref(true);
const showMyeat = ref(false);
const today_left_eat = ref(2000);
const IsManager = ref(false);
const add_icon = "/static/icon/add.png";
const delete_icon = "/static/icon/delete.png";
const column_bar = "/static/icon/columnbar.png";
const popup = ref(null);
const dialogTitle = ref("添加计划");
const goals = ref([
  { value: "全部", text: "全部" },
  { value: "减脂", text: "减脂" },
  { value: "增肌", text: "增肌" },
  { value: "耐力", text: "耐力" },
  { value: "柔韧性", text: "柔韧性" },
  { value: "综合健身", text: "综合健身" },
]);
const types = ref([
  { value: "全部", text: "全部" },
  { value: "跑步", text: "跑步" },
  { value: "徒手", text: "徒手" },
  { value: "撸铁", text: "撸铁" },
  { value: "瑜伽", text: "瑜伽" },
  { value: "篮球", text: "篮球" },
]);
const difficulties = ref([
  { value: "全部", text: "全部" },
  { value: "困难", text: "困难" },
  { value: "简单", text: "简单" },
  { value: "适中", text: "适中" },
]);
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
// const plans = ref([
//   {
//     title: "有氧拳击HIIT",
//     duration: "15min",
//     imageUrl: "/static/face1.png",
//     times: "两天一次",
//     difficulties: "适中",
//     calorie: "145",
//     goal: ["减脂", "耐力", "综合健身"],
//     type: "徒手",
//     videoUrl: "",
//   },
//   {
//     title: "强化核心力量",
//     duration: "8.5min",
//     imageUrl: "/static/face1.png",
//     times: "两天一次",
//     difficulties: "困难",
//     calorie: "87",
//     goal: ["减脂", "增肌", "耐力", "柔韧性"],
//     type: "徒手",
//   },
//   {
//     title: "训练计划3",
//     duration: "15min",
//     imageUrl: "/static/face1.png",
//     times: "3次",
//     difficulties: "适中",
//     calorie: "100",
//     goal: ["耐力"],
//     type: "篮球",
//   },
//   {
//     title: "训练计划4",
//     duration: "15min",
//     imageUrl: "/static/face1.png",
//     times: "3次",
//     difficulties: "简单",
//     calorie: "100",
//     goal: ["柔韧性"],
//     type: "瑜伽",
//   },
//   // 其他计划数据...
// ]);
const plans = ref([]);
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
const aiInput = ref(""); // AI 输入内容
const customPlan = ref(""); // 定制计划
const exerciseProgress = ref(50); // 运动进度百分比
const currentExercise = ref(30); // 当前运动时长
const planExercise = ref(60); // 计划运动时长

const weekDays = ref([
  { date: "周一", progress: 70 },
  { date: "周二", progress: 50 },
  { date: "周三", progress: 80 },
  { date: "周四", progress: 60 },
  { date: "周五", progress: 90 },
  { date: "周六", progress: 40 },
  { date: "周日", progress: 100 },
]);
const showCalendar_bar = ref(false); // 是否显示月历

const switchTab = (selectedTab) => {
  tab.value = selectedTab;
};

const selectButton = (buttonType) => {
  activeButton.value = buttonType;
};

const selectGoal = (value) => {
  selectedGoal.value = selectedGoal.value === value ? "" : value;
};

const selectType = (value) => {
  selectedType.value = selectedType.value === value ? "" : value;
};
const filteredPlans = ref([...plans.value]);
// 过滤计划的逻辑
const filterPlans = () => {
  logSelectedFilters();
  filteredPlans.value = plans.value.filter((plan) => {
    // 修改目标的匹配方式，支持多目标匹配
    const matchesGoal =
      selectedGoal.value === "全部" || plan.goal.includes(selectedGoal.value);

    const matchesType =
      selectedType.value === "全部" || plan.type === selectedType.value;

    const matchesDifficulty =
      selectedDifficulty.value === "全部" ||
      plan.difficulties === selectedDifficulty.value;

    return matchesGoal && matchesType && matchesDifficulty;
  });
};

// 调试筛选条件变化
const logSelectedFilters = () => {
  console.log("当前选中的筛选条件:", {
    goal: selectedGoal.value,
    type: selectedType.value,
    difficulty: selectedDifficulty.value,
  });
};

const openPlanDetail = (plan) => {
  // 打开具体计划详情页面逻辑
};

const goToSearchPage = () => {
  // 跳转到搜索页面逻辑
  uni.navigateTo({
    url: "/pages/Search/Search",
  });
};

const getCustomPlan = () => {
  // 模拟与 AI 交互获取定制计划
  // 这里可以替换为实际的 AI 接口调用
  // 检查用户是否输入了需求
  if (!aiInput.value.trim()) {
    uni.showToast({
      title: "请输入您的需求",
      icon: "none",
    });
    return;
  }

  const username = uni.getStorageSync("username"); // 获取已登录用户的用户名
  // 发送请求到后端获取定制的运动计划
  uni.request({
    url: "http://192.168.56.1:3000/generateFitnessPlan", // 请根据实际情况调整 IP 地址和端口
    method: "POST",
    data: {
      aiInput: aiInput.value.trim(), // 将用户输入的数据发送到后端
      username: username, // 传递用户名
    },
    header: {
      "Content-Type": "application/json",
    },
    success: (res) => {
      console.log("服务器响应:", res);
      if (res.statusCode === 200 && res.data.fitnessPlan) {
        // 计划生成成功，将其显示在页面上
        const md = new MarkdownIt();
        customPlan.value = md.render(res.data.fitnessPlan);
        uni.showToast({
          title: "计划生成成功",
          icon: "success",
        });
      } else {
        uni.showToast({
          title: res.data.error || "生成计划失败",
          icon: "none",
        });
      }
    },
    fail: (err) => {
      console.error("请求失败:", err);
      uni.showToast({
        title: "网络请求失败，请稍后重试",
        icon: "none",
      });
    },
  });
  // customPlan.value = `根据您的需求 "${aiInput.value}"，我们为您定制了以下运动计划：...`;
};

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
const judgeManager = () => {
  // 判断是否为管理员
  // const Level = uni.getStorageSync("Level");
  const Level = "1";
  if (Level === "1") {
    IsManager.value = true;
  }
};
// 页面加载时调用
onMounted(() => {
  fetchPlansFromBackend();
  judgeManager();
  loadMyPlans();
});
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
};
// 打开弹窗
const openPopup = () => {
  // popup.value.open();
  tab.value = "add_change_plan";
};

// 关闭弹窗
const closePopup = () => {
  // popup.value.close();
  tab.value = "plan-board";

};
const handleAddPlan_board = () => {
  // 添加计划逻辑
  openPopup();
};
// 保存计划
const savePlan = () => {
  if (currentEditIndex.value !== -1) {
    // 创建新对象以确保响应式更新
    const updatedPlan = {
      ...plans.value[currentEditIndex.value],
      title: planForm.value.title,
      duration: planForm.value.duration,
      times: planForm.value.times,
      difficulties: planForm.value.difficulties,
      calorie: planForm.value.calorie,
      goal: planForm.value.goal,
      type: planForm.value.type,
      imageUrl: planForm.value.imageUrl,
      videoUrl: planForm.value.videoUrl,
    };

    // 使用数组方法触发响应式更新
    plans.value.splice(currentEditIndex.value, 1, updatedPlan);
    // 显示更新后的计划plan
    console.log("更新后的计划:", plans.value[currentEditIndex.value]);
    // 重置编辑索引
    currentEditIndex.value = -1;
    filterPlans();
    // 可选：显示成功提示
    uni.showToast({
      title: "保存成功",
      icon: "success",
    });
  } else {
    // 创建新对象以确保响应式更新
    const newPlan = {
      title: planForm.value.title,
      duration: planForm.value.duration,
      times: planForm.value.times,
      difficulties: planForm.value.difficulties,
      calorie: planForm.value.calorie,
      goal: planForm.value.goal,
      type: planForm.value.type,
      imageUrl: planForm.value.imageUrl,
      videoUrl: planForm.value.videoUrl,
    };
    // 使用数组方法触发响应式更新
    plans.value.push(newPlan);
    filterPlans();
    // 可选：显示成功提示
    uni.showToast({
      title: "添加成功",
      icon: "success",
    });
  }
  closePopup();
};
const handleEdit = (item, index) => {
  // 编辑计划逻辑
  currentEditIndex.value = index;
  console.log("编辑计划:", item.title);
  console.log("编辑索引:", index);
  dialogTitle.value = "编辑计划";
  // 将字符串数组转换为多选所需的格式
  const selectedGoals = item.goal.map((goalText) => {
    // 在goals数组中找到对应的value
    const goalItem = goals.value.find((g) => g.text === goalText);
    return goalItem ? goalItem.value : goalText;
  });
  planForm.value = {
    title: item.title,
    times: item.times,
    duration: item.duration,
    difficulties: item.difficulties,
    calorie: item.calorie,
    type: item.type,
    goal: selectedGoals, // 使用转换后的数组
    imageUrl: item.imageUrl,
    videoUrl: item.videoUrl,
  };
  openPopup();
};
const openDaySchedule = (day) => {
  // 打开当天的日程页面逻辑
  // 例如，设置为当前选中的日期并显示相关内容
  console.log(`打开${day.date}的日程`);
};

const toggleCalendar = () => {
  showCalendar_bar.value = !showCalendar_bar.value;
};
const To_myplan = () => {
  showMyplan.value = true;
  showMyeat.value = false;
};
const To_myeat = () => {
  showMyplan.value = false;
  showMyeat.value = true;
};
/**
 * 获取任意时间
 */
function getDate(date, AddDayCount = 0) {
  if (!date) {
    date = new Date();
  }
  if (typeof date !== "object") {
    date = date.replace(/-/g, "/");
  }
  const dd = new Date(date);
  dd.setDate(dd.getDate() + AddDayCount);

  const y = dd.getFullYear();
  const m =
    dd.getMonth() + 1 < 10 ? "0" + (dd.getMonth() + 1) : dd.getMonth() + 1;
  const d = dd.getDate() < 10 ? "0" + dd.getDate() : dd.getDate();
  return {
    fullDate: `${y}-${m}-${d}`,
    year: y,
    month: m,
    date: d,
    day: dd.getDay(),
  };
}

// 日历显示状态
const showCalendar = ref(false);
const currentday = ref(getDate(new Date()).fullDate);
// 日历信息
const info = ref({
  lunar: true,
  range: true,
  insert: false,
  selected: [],
});
const change = (info) => {
  console.log("change 返回:", info);
  // 日期改变时的逻辑处理
  currentday.value = info.fulldate;
  console.log(currentday.value);
};
// 添加打卡记录
const addCheckIn = () => {
  const newDate = currentday.value;
  info.value.selected.push({
    date: newDate,
    info: "打卡",
  });
  refreshCalendar();
};

// 添加签到记录
const addSignIn = () => {
  const newDate = currentday.value;
  info.value.selected.push({
    date: newDate,
    info: "签到",
  });
  refreshCalendar();
};

// 删除选中的记录
const removeSelected = (index) => {
  info.value.selected.splice(index, 1);
  refreshCalendar();
};
// 刷新日历
const refreshCalendar = () => {
  showCalendar.value = false;
  nextTick(() => {
    showCalendar.value = true;
  });
};
// 异步请求模拟数据
onMounted(() => {
  filterPlans();
  showCalendar.value = true;
  setTimeout(() => {
    info.value.date = getDate(new Date(), -30).fullDate;
    info.value.startDate = getDate(new Date(), -60).fullDate;
    info.value.endDate = getDate(new Date(), 30).fullDate;
    info.value.selected = [
      {
        date: getDate(new Date(), -3).fullDate,
        info: "打卡",
      },
      {
        date: getDate(new Date(), -2).fullDate,
        info: "签到",
        data: {
          custom: "自定义信息",
          name: "自定义消息头",
        },
      },
      {
        date: getDate(new Date(), -1).fullDate,
        info: "已打卡",
      },
    ];
  }, 2000);
});
</script>

<style scoped lang="scss">
.container {
  padding: 10px;
}

.search-bar {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #fdfdfd;
  border-radius: 20px;
  border: 1px solid #333;
  cursor: pointer; /* 添加鼠标指针样式 */
}

.search-placeholder {
  color: #999;
}

.tab-container {
  display: flex;
  justify-content: space-around;
  margin-top: 10px;
  border-bottom: 1px solid #ccc;
}
.plan-manage-board {
  display: flex;
  flex-direction: column;
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

.nav-bar {
  margin-top: 10px;
  display: flex;
  /* justify-content: space-between; */

  gap: 10px;
}

uni-button {
  border: 1px solid #333;
  border-radius: 20px;
  background-color: #fff;
  margin-left: 0;
  margin-right: 0;
  color: #333;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
}

.nav-bar .active {
  background-color: #333;
  color: #fff;
}

.filter-bar {
  display: flex;
  justify-content: flex-start;
  margin-top: 1px;
}

.filter-bar-planboard {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  margin-top: 1px;
}
.add-plan-btn {
  margin-left: 12rpx;
  margin-top: 80rpx;
  border-radius: 5px;
  height: 60rpx;
  color: white;
  background-color: black;
  // 阴影效果
  box-shadow: 0 4px 8px rgba(94, 87, 87, 0.603); /* 添加边界阴影 */
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.3s;
}
.filter {
  display: flex;
  flex-direction: column;
  width: 25%;
}
.filter .uni-section {
  background-color: #ffffff;
  border: 0px solid #000000;
  border-radius: 5px;
}

.plan-list {
  margin-top: 10px;
}

.plan-item {
  display: flex;
  flex-direction: row;
  margin-top: 20px;
  // border: 1px solid #726969;
  box-shadow: 0 4px 8px rgba(94, 87, 87, 0.603); /* 添加边界阴影 */
}

.plan-image {
  margin-top: 4px;

  width: 350rpx;
  height: 200rpx;
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
.ai-customization {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}

.ai-input {
  width: 90%;
  height: 100px;
  padding: 5%;
  border: 1px solid #ccc;
  border-radius: 10px;
  resize: none;
}

.ai-button {
  padding: 10px;
  border: none;
  border-radius: 20px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
}

.ai-button:hover {
  background-color: #0056b3;
}

.custom-plan {
  margin-top: 20px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 10px;
  background-color: #f9f9f9;
}
.schedule-section {
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
.top_bar_sport {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 10px;
}
.shot_icon {
  left: 30rpx;
  width: 100rpx;
  height: 100rpx;
}
.week_sport_bar {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  margin-top: 10px;
}
.calendar_dropbar {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
}
.dropbar {
  width: 20%;
  height: 10rpx;
}
.example-body {
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  flex-direction: row;
}
.calendar-button {
  flex: 1;
  font-weight: bold;
  font-size: 32rpx;
}
.selected-list {
  margin-top: 20px;
}

.selected-list ul {
  list-style: none;
  padding: 0;
}

.selected-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #ccc;
}

.selected-list li button {
  padding: 5px 10px;
  border: none;
  border-radius: 10px;
  background-color: #ff4d4d;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
}

.selected-list li button:hover {
  background-color: #cc0000;
}
.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.action-buttons button {
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  background-color: #839cb6;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
}

.action-buttons button:hover {
  background-color: #626c77;
}
.func_set {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  gap: 10px;
  width: 100%;
}
.plat_bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
}
.swcbt {
  font-size: 14px;
  margin-left: 5px;
  border-radius: 20px;
  border: 1px solid black; /* 添加黑色边框 */
  background-color: white; /* 初始背景色为白色 */
  color: black; /* 初始字体颜色为黑色 */
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s; /* 添加颜色过渡效果 */
}

.swcbt.active {
  background-color: black; /* 点击后背景色变为黑色 */
  color: white; /* 点击后字体颜色变为白色 */
}
.circle_process_eat {
  margin-top: 50rpx;
}
.eat_left {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 20rpx;
}
.b1_highlight {
  font-size: 25rpx;
  color: black;
}
.b_highlight {
  font-size: 30rpx;
  color: black;
  margin-bottom: 10%;
}
.gray_color {
  font-size: 20rpx;
  color: gray;
}
.take_picture {
  font-size: 30rpx;
  margin-top: 20rpx;
  border-radius: 20rpx;
  border: 1px solid black;
  background-color: white;
  color: black;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
}
.take_picture:hover {
  background-color: rgb(177, 181, 187);
  color: white;
  align-items: center;
}
.picture_return {
  font-size: 30rpx;
  margin-top: 20rpx;
  color: black;
  align-items: center;
}
.eat_page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.op_bar {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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
  // margin-left: 80px;
  width: 2px;
  background-color: #ccc;
}
.modify-button {
  /* 保持原有属性 */
  border: none;
  border-radius: 5px;
  background-color: #641013;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-left: 5px;
  margin-right: 5px;
  /* 新增垂直排列相关样式 */
  writing-mode: vertical-lr; /* 使文字垂直排列，从左到右 */
  text-orientation: upright; /* 保持文字正向 */
  padding: 15px 8px; /* 调整内边距：上下15px，左右8px */
  height: 80px; /* 设置按钮高度 */
  width: 30px; /* 设置按钮宽度 */
  display: flex; /* 使用flex布局 */
  align-items: center; /* 水平居中 */
  justify-content: center; /* 垂直居中 */
  letter-spacing: 2px; /* 文字间距 */
}
.popup-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  width: 80%;
  height: 760rpx;
  overflow-x: hidden;
}

.popup-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}
.scroll-area {

  height: 100%;
}
.popup-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.btn-cancel {
  width: 45%;
}

.btn-confirm {
  width: 45%;
}
.modboard {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
