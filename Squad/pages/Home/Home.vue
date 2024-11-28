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
            v-model="modelVale"
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
              v-model="modelVale"
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
            <view class="eat_date">
              <button
                @click="toDietRecord"
                :class="{ swcbt: true, active: showDietrecord }"
              >
                <text>饮食记录</text>
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
            <view class="circle_process_eat">
              <l-circle
                v-model="modelVale"
                :percent="target_eat_percent"
                :size="120"
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
              <button
                class="take_picture"
                @click="takePicture"
                :disabled="isRecognizing"
              >
                <text v-if="!isRecognizing">拍照识别</text>
                <text v-else>识别中...</text>
              </button>

              <!-- 修改识别结果表格部分 -->
              <view
                v-if="foodList.length > 0 || manualFoodList.length > 0"
                class="food-table"
              >
                <view class="table-header">
                  <text class="th">食物名称</text>
                  <text class="th">食用量(g)</text>
                  <text class="th">热量(kcal)</text>
                  <text class="th">操作</text>
                </view>

                <!-- 识别的食物列表 -->
                <scroll-view>
                  <view
                    v-for="(food, index) in foodList"
                    :key="'auto-' + index"
                    class="table-row"
                  >
                    <text class="td food-name">{{ food.食物名称 }}</text>
                    <view class="td amount-input">
                      <input
                        type="number"
                        v-model="food.amount"
                        placeholder="请输入"
                        @input="calculateFoodCalories(food)"
                      />
                    </view>
                    <text class="td">{{ food.currentCalories || 0 }}</text>
                    <view class="td op-buttons">
                      <button
                        class="delete-btn"
                        @click="removeFood(index, 'auto')"
                      >
                        删除
                      </button>
                    </view>
                  </view>

                  <!-- 手动添加的食物列表 -->
                  <view
                    v-for="(food, index) in manualFoodList"
                    :key="'manual-' + index"
                    class="table-row"
                  >
                    <text class="td food-name">{{ food.食物名称 }}</text>
                    <view class="td amount-input">
                      <input
                        type="number"
                        v-model="food.amount"
                        @input="calculateManualFoodCalories(food)"
                      />
                    </view>
                    <text class="td">{{ food.currentCalories }}</text>
                    <view class="td op-buttons">
                      <button
                        class="delete-btn"
                        @click="removeFood(index, 'manual')"
                      >
                        删除
                      </button>
                    </view>
                  </view>
                </scroll-view>

                <!-- 底部操作栏 -->
                <view class="table-footer">
                  <button class="add-btn" @click="showAddFoodPopup">
                    <text class="add-icon">+</text>添加食物
                  </button>
                  <view class="total-info">
                    <text>总热量: {{ totalCalories }}kcal</text>

                    <button class="submit-btn" @click="submitFoodList">
                      提交
                    </button>
                  </view>
                </view>
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
            <!-- 添加计划表单 -->
            <div v-if="isAddingPlan">
              <scroll-view>
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
                    <button @click="chooseCoverImage" type="primary">
                      选择封面图片
                    </button>
                    <view v-if="planForm.imageUrl" class="cover-preview">
                      <image
                        :src="planForm.imageUrl"
                        mode="aspectFill"
                        style="width: 100px; height: 100px"
                      />
                    </view>
                  </uni-forms-item>

                  <uni-forms-item label="视频链接">
                    <uni-easyinput
                      v-model="planForm.videoUrl"
                      type="string"
                      placeholder="请输入演示视频url"
                    />
                  </uni-forms-item>
                </uni-forms>

                <!-- 保存和取消按钮 -->
                <view class="popup-buttons">
                  <button class="btn-cancel" @click="closePopup">取消</button>
                  <button class="btn-confirm" type="primary" @click="savePlan">
                    确定
                  </button>
                </view>
              </scroll-view>
            </div>
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
    <view v-if="tab === 'add_change_plan'" class="modboard">
      <view class="popup-content">
        <scroll-view scroll-y="true" class="scroll-area">
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
              <button @click="chooseCoverImage" type="primary">
                选择封面图片
              </button>
              <view v-if="planForm.imageUrl" class="cover-preview">
                <image
                  :src="planForm.imageUrl"
                  mode="aspectFill"
                  style="
                    box-shadow: 0 4px 8px rgba(94, 87, 87, 0.603);
                    margin-top: 10px;
                    margin-left: 33px;
                    width: 150px;
                    height: 80px;
                  "
                />
              </view>
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
    <!-- 添加食物弹窗 -->
    <view v-if="showAddFood" class="popup-mask">
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">添加食物</text>
          <text class="close-btn" @click="closeAddFoodPopup">×</text>
        </view>
        <view class="popup-body">
          <view class="form-item">
            <text class="label">食物名称</text>
            <input
              type="text"
              v-model="newFood.食物名称"
              placeholder="请输入食物名称"
            />
          </view>
          <view class="form-item">
            <text class="label">食用量(g)</text>
            <input
              type="number"
              v-model="newFood.amount"
              placeholder="请输入食用量"
            />
          </view>
          <view class="form-item">
            <text class="label">热量(kcal/100g)</text>
            <input
              type="number"
              v-model="newFood.baseCalories"
              placeholder="请输入每100g热量"
            />
          </view>
        </view>
        <view class="popup-footer">
          <button class="cancel-btn" @click="closeAddFoodPopup">取消</button>
          <button class="confirm-btn" @click="confirmAddFood">确定</button>
        </view>
      </view>
    </view>
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  onMounted,
  nextTick,
  watch,
  provide,
  reactive,
  onUnmounted,
} from "vue";
import MarkdownIt from "markdown-it";
import LCircle from "@/uni_modules/lime-circle/components/l-circle/l-circle.vue"; // 引入组件
import { type } from "../../uni_modules/uni-forms/components/uni-forms/utils";
import axios from "axios";
import { useWebSocketStore } from '@/store/websocket';

// 使用 store
const store = useWebSocketStore();
onMounted(() => {
  // 初始化WebSocket连接
  console.log(store.isConnected);
  if (!store.isConnected) {
    store.initWebSocket();
    console.log("连接初始化...");
  }
  // 设置一个定时器，每隔一段时间检查一次连接状态
  setInterval(() => {
    if (!store.isConnected) {
      store.initWebSocket();
      console.log("连接初始化...");
    }
  }, 5000);
});
// 初始化WebSocket连接
// store.initWebSocket();
// const serverUrl = "http://10.133.80.141:3000"; // 服务器地址
const serverUrl = uni.getStorageSync("serverUrl");
const target = ref(1);
const modelVale = ref(0);
const target_eat_percent = ref(100);
const tab = ref("plan"); // 当前选中的标签
const activeButton = ref("all"); // 当前选中的按钮
const selectedGoal = ref("全部"); // 选中的目标筛选项
const selectedType = ref("全部"); // 选中的类型筛选项
const selectedDifficulty = ref("全部"); // 选中的难度筛选项
const username = uni.getStorageSync("username"); // 获取已登录用户的用户名
const showMyplan = ref(true);
const showMyeat = ref(false);
// const today_left_eat =  = uni.getStorageSync(`today_left_eat_${username}`);
const today_left_eat = ref(2000);
const totalConsumedCalories = ref(0);
const IsManager = ref(false);
const add_icon = "/static/icon/add.png";
const delete_icon = "/static/icon/delete.png";
const column_bar = "/static/icon/columnbar.png";
const foodName = ref("");
const calories = ref("");
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
const plans = ref([]);
// 拍照并上传图片
const foodList = ref([]);
const manualFoodList = ref([]);
const errorMessage = ref("");
const totalCalories = computed(() => {
  const autoCalories = foodList.value.reduce((sum, food) => {
    const calories = Number(food.currentCalories);
    // 调试输出
    console.log(`自动食物 ${food.食物名称} 的热量: ${calories}`);
    return sum + (isNaN(calories) ? 0 : calories);
  }, 0);

  const manualCalories = manualFoodList.value.reduce((sum, food) => {
    const calories = Number(food.currentCalories);
    // 调试输出
    console.log(`手动食物 ${food.食物名称} 的热量: ${calories}`);
    return sum + (isNaN(calories) ? 0 : calories);
  }, 0);

  // 输出总热量调试信息
  const total = Math.round(autoCalories + manualCalories);
  console.log(`总热量 (自动 + 手动): ${total} 千卡`);
  return total;
});

// 计算单个食物的热量
const calculateFoodCalories = (food) => {
  if (food.amount && food.baseCalories) {
    food.currentCalories = Math.round((food.baseCalories * food.amount) / 100);
  }
};

// 计算手动添加食物的热量
const calculateManualFoodCalories = (food) => {
  if (food.amount && food.baseCalories) {
    food.currentCalories = Math.round((food.baseCalories * food.amount) / 100);
  }
};

// 添加手动食物
const addManualFood = async () => {
  manualFoodList.value.push({
    食物名称: "",
    baseCalories: 0,
    amount: 100,
    currentCalories: 0,
  });
};

// 删除食物
const removeFood = (index, type) => {
  if (type === "auto") {
    foodList.value.splice(index, 1);
  } else {
    manualFoodList.value.splice(index, 1);
  }
};

// 提交食物列表
const submitFoodList = async () => {
  let username = uni.getStorageSync("username"); // 获取当前登录用户
  if (foodList.value.length === 0) {
    uni.showToast({
      title: "请先添加食物",
      icon: "none",
    });
    return;
  }

  // 保存食物记录到本地存储
  const today = new Date().toISOString().split("T")[0];
  const storageKey = `dailyFoods_${username}_${today}`;

  // 获取已有的当日记录
  let dailyFoods = uni.getStorageSync(storageKey) || [];
  if (!Array.isArray(dailyFoods)) {
    dailyFoods = [];
  }

  // 准备新的食物记录
  const newFoods = [...foodList.value, ...manualFoodList.value].map((food) => ({
    食物名称: food.食物名称,
    amount: food.amount,
    baseCalories: food.baseCalories,
    currentCalories: food.currentCalories,
    imageUrl: food.imageUrl || "",
    time: new Date().toLocaleTimeString(),
  }));

  // 添加新记录
  dailyFoods = [...dailyFoods, ...newFoods];
  uni.setStorageSync(storageKey, dailyFoods);

  // 原有的卡路里计算逻辑
  const totalConsumedCalories = totalCalories.value;
  console.log(`提交时总消耗的热量: ${totalConsumedCalories} 千卡`);

  const dailyCalories = uni.getStorageSync(`dailyCalories_${username}`);
  let remainingCalories = uni.getStorageSync(`today_left_eat_${username}`);
  console.log(`1: ${remainingCalories} 千卡`);

  remainingCalories = isNaN(remainingCalories)
    ? dailyCalories || 2000
    : remainingCalories;
  console.log(`3: ${remainingCalories} 千卡`);
  // 计算并更新剩余热量
  remainingCalories = Math.max(0, remainingCalories - totalConsumedCalories);
  // remainingCalories = remainingCalories - totalConsumedCalories;
  console.log(`4: ${remainingCalories} 千卡`);
  today_left_eat.value = remainingCalories;
  // 计算剩余热量占每日总热量的百分比
  target_eat_percent.value = dailyCalories
    ? Math.round((remainingCalories / dailyCalories) * 100)
    : 0;

  // 保存更新后的剩余热量到本地
  uni.setStorageSync(`today_left_eat_${username}`, remainingCalories);

  // 清空食物列表
  foodList.value = [];
  manualFoodList.value = [];
  // 显示成功提示
  uni.showToast({
    title: "已更新每日摄入",
    icon: "success",
  });

  // 调试信息
  console.log(`总消耗: ${totalConsumedCalories} 千卡`);
  console.log(`剩余可摄入热量: ${remainingCalories} 千卡`);

  // 可以选择是否自动跳转到饮食记录页面
  // uni.navigateTo({
  //   url: '/pages/DietRecord/DietRecord'
  // });
  try {
    // 向后端发送数据
    const res = await uni.request({
      url: serverUrl + "/submitDailyFoods",
      method: "POST",
      data: {
        username: username,
        date: today,
        foods: newFoods,
      },
    });

    if (res.statusCode === 200 && res.data.success) {
      uni.showToast({
        title: "上传成功",
        icon: "success",
      });

      // 清空食物列表
      foodList.value = [];
      manualFoodList.value = [];
    } else {
      throw new Error(res.data.message || "上传失败，请稍后重试");
    }
  } catch (error) {
    console.error("上传失败:", error);
    uni.showToast({
      title: "上传失败，请稍后重试",
      icon: "none",
    });
  }
};
const takePicture = async () => {
  try {
    // 选择图片
    const res = await uni.chooseImage();
    if (res.errMsg === "chooseImage:fail User cancelled") {
      errorMessage.value = "用户取消了选择图片操作，请重新选择。";
      return;
    }

    const filePath = res.tempFilePaths[0];

    // 显示加载状态
    isRecognizing.value = true;
    uni.showLoading({
      title: "正在识别中...",
      mask: true,
    });

    // 1. 识别图片热量信息
    const recognizePromise = new Promise((resolve, reject) => {
      uni.uploadFile({
        url: serverUrl + "/foodCalorie",
        filePath: filePath,
        name: "file",
        success: (uploadRes) => {
          try {
            const response = JSON.parse(uploadRes.data);
            if (uploadRes.statusCode === 200) {
              let resultData = response.result;
              resultData = resultData
                .replace(/^```json\s*/, "")
                .replace(/\s*```$/, "");
              const foodItems = JSON.parse(resultData);
              resolve(foodItems); // 返回识别结果
            } else {
              reject("识别失败，请稍后重试。");
            }
          } catch (err) {
            reject("响应数据格式错误，请稍后重试。");
          }
        },
        fail: () => {
          reject("上传失败，请检查网络连接。");
        },
      });
    });

    // 2. 上传图片到后端
    const uploadPromise = new Promise((resolve, reject) => {
      uni.uploadFile({
        url: serverUrl + "/upload",
        filePath: filePath,
        name: "file",
        success: (uploadRes) => {
          try {
            const response = JSON.parse(uploadRes.data);
            if (response.success) {
              resolve(response.imageUrl); // 返回图片路径
            } else {
              reject("图片上传失败，请稍后重试。");
            }
          } catch (err) {
            reject("上传响应数据格式错误。");
          }
        },
        fail: () => {
          reject("图片上传失败，请检查网络连接。");
        },
      });
    });

    // 等待识别和上传完成
    const [foodItems, imageUrl] = await Promise.all([
      recognizePromise,
      uploadPromise,
    ]);

    // 处理识别结果并更新饮食记录
    processRecognitionResult(foodItems, imageUrl);

    // 识别成功提示
    uni.showToast({
      title: "识别成功",
      icon: "success",
      duration: 2000,
    });

    errorMessage.value = "";
  } catch (error) {
    console.error(error);
    errorMessage.value = error;

    // // 错误提示
    // uni.showToast({
    //   title: error,
    //   icon: "error",
    //   duration: 2000,
    // });
  } finally {
    // 关闭加载状态
    isRecognizing.value = false;
    uni.hideLoading();
  }
};

const processRecognitionResult = (resultData, imageUrl = null) => {
  try {
    let foodItems;
    if (Array.isArray(resultData)) {
      foodItems = resultData;
    } else if (typeof resultData === "object") {
      foodItems = [resultData];
    } else {
      throw new Error("Invalid data format");
    }

    // 将新识别的食物添加到现有列表中，而不是覆盖
    const newFoodItems = foodItems.map((item) => ({
      食物名称: item.食物名称,
      baseCalories: parseFloat(item.热量.match(/\d+/)[0]), // 提取数字
      amount: "", // 默认100g
      currentCalories: 0, // 初始化为0，稍后由用户设置
      imageUrl: imageUrl || null, // 设置上传的图片路径，默认为空
    }));

    // 将新食物追加到现有列表
    foodList.value = [...foodList.value, ...newFoodItems];

    // 显示添加成功提示
    uni.showToast({
      title: `成功添加${newFoodItems.length}个食物`,
      icon: "success",
    });
  } catch (err) {
    console.error("处理识别结果错误:", err);
    uni.showToast({
      title: "数据格式错误",
      icon: "none",
    });
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

// 获取每日热量
async function fetchDailyCalories(username) {
  username = uni.getStorageSync("username"); // 获取已登录用户的用户名
  try {
    // 检查是否需要重新获取每日热量（通过日期判断）
    const lastFetchDate = uni.getStorageSync(`lastFetchDate_${username}`);
    const today = new Date().toLocaleDateString();
    if (lastFetchDate === today) {
      console.log("今日已获取过热量数据");
      // 如果当天已经获取过数据，则直接从本地获取并显示
      // const cachedCalories = uni.getStorageSync(`dailyCalories_${username}`);
      // if (cachedCalories) {
      //   today_left_eat.value = cachedCalories;
      //   target_eat_percent.value = 100; // 假设每日目标2000千卡
      // }

      today_left_eat.value = uni.getStorageSync(`today_left_eat_${username}`);
      console.log(`剩余热量: ${today_left_eat.value} 千卡`);
      const dailyCalories = uni.getStorageSync(`dailyCalories_${username}`);
      let remainingCalories = uni.getStorageSync(`today_left_eat_${username}`);
      target_eat_percent.value = dailyCalories
        ? Math.round((remainingCalories / dailyCalories) * 100)
        : 0;

      return;
    }

    // 发送请求到后端获取每日热量数据
    const response = await uni.request({
      url: serverUrl + "/api/calculateCalories",
      method: "POST",
      header: {
        "Content-Type": "application/json",
      },
      data: {
        username: username, // 传递用户名到后端
      },
    });

    console.log("服务器响应:", response); // 打印返回的完整响应数据

    // 确保返回的数据格式正确
    if (response.statusCode === 200) {
      const { dailyCalories, error } = response.data;

      if (dailyCalories) {
        today_left_eat.value = dailyCalories; // 设置可摄入的热量
        target_eat_percent.value = 100; // 设置进度条的百分比
        // 将热量保存到本地
        uni.setStorageSync(`dailyCalories_${username}`, dailyCalories);
        uni.setStorageSync(`lastFetchDate_${username}`, today); // 记录获取日期
        uni.setStorageSync(`today_left_eat_${username}`, today_left_eat.value);
        let remainingCalories = uni.getStorageSync(
          `today_left_eat_${username}`
        );
        console.log(`更新剩余热量: ${remainingCalories} 千卡`);
        uni.showToast({
          title: "获取热量成功",
          icon: "success",
        });
      } else if (error) {
        uni.showToast({
          title: error || "获取热量失败",
          icon: "none",
        });
      }
    } else {
      uni.showToast({
        title: "获取热量失败，请稍后重试",
        icon: "none",
      });
    }
  } catch (error) {
    console.error("请求失败:", error);
    // uni.showToast({
    //   title: "网络请求失败，请稍后重试",
    //   icon: "none",
    // });
  }
}

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
<<<<<<< Updated upstream
    url: serverUrl + "/generateFitnessPlan", // 请根据实际情况调整 IP 地址和端口
=======
    url: serverUrl+"/generateFitnessPlan",
>>>>>>> Stashed changes
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
  fetchDailyCalories(username.value);
  // 监听来自 Search 页面更新计划的通知
  uni.$on("plansUpdated", loadMyPlans);
  // 监听删除食物的通知
  uni.$on("foodDeleted", initializeRemainingCalories);
  // 监听编辑食物的通知
  uni.$on("foodEdit", initializeRemainingCalories);
  // 每分钟检查一次是否到了0点
  const checkMidnight = setInterval(() => {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
      console.log("已到0点，重新获取每日热量");
      fetchDailyCalories(username.value);
      resetRemainingCalories();
    }
  }, 60000); // 每分钟检查一次
  username = uni.getStorageSync("username");
  // 页面加载时初始化数据
  initializeRemainingCalories();
  // 如果需要，可以检查连接状态


});
// 初始化剩余热量
const initializeRemainingCalories = () => {
  const username = uni.getStorageSync("username");
  today_left_eat.value = uni.getStorageSync(`today_left_eat_${username}`);
  const dailyCalories = uni.getStorageSync(`dailyCalories_${username}`); //获取每日热量
  let remainingCalories = uni.getStorageSync(`today_left_eat_${username}`) || 0; //获取剩余热量
  if (remainingCalories > dailyCalories) {
    remainingCalories = dailyCalories;
  }
  uni.setStorageSync(`today_left_eat_${username}`, remainingCalories);
  today_left_eat.value = uni.getStorageSync(`today_left_eat_${username}`);
  //更新圆环
  target_eat_percent.value = dailyCalories
    ? Math.round((remainingCalories / dailyCalories) * 100)
    : 0;
};

// 重置剩余热量为每日热量
const resetRemainingCalories = () => {
  const username = uni.getStorageSync("username");
  const dailyCalories = uni.getStorageSync(`dailyCalories_${username}`);
  today_left_eat.value = dailyCalories || 2000; // 重置为每日热量
  uni.setStorageSync(`today_left_eat_${username}`, today_left_eat.value); // 更新本地存储
  target_eat_percent.value = 100; // 重置进度条
  console.log("已重置剩余热量为每日热量");
};
// 添加计划到"我的计划"
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
  // 通知 添加计划
  uni.$emit("handleAdd");
  // 重新加载计划
  loadMyPlans();
};

// 从"我的计划"中删
const handleRemove = (plan) => {
  // 先加载现有的计划
  let currentPlans = uni.getStorageSync(`myPlans_${username}`);
  currentPlans = currentPlans ? JSON.parse(currentPlans) : [];

  // 过滤掉要删除的计划
  const updatedPlans = currentPlans.filter((item) => item.title !== plan.title);

  // 存储回本地
  uni.setStorageSync(`myPlans_${username}`, JSON.stringify(updatedPlans));
  console.log("计划已删除:", plan.title);
  // 通知 删除计划
  uni.$emit("handleRemove");
  
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
  planForm.value = {
    title: "",
    times: "",
    duration: "",
    difficulties: "",
    calorie: "",
    type: "",
    goal: "",
    imageUrl: "",
    videoUrl: "",
  };
  openPopup();
};
// 保存计划
const savePlan = () => {
  const isEditing = currentEditIndex.value !== -1;

  // 准备提交到后端的数据（只保留必要的字段）
  const planData = {
    名称: planForm.value.title || "",
    运动次数: planForm.value.times || "",
    时间: planForm.value.duration || "",
    卡路里: planForm.value.calorie || 0,
    运动类型: planForm.value.type || "",
    目标: planForm.value.goal.join(",") || "", // 如果 `goal` 是数组，转换为字符串
    难度: planForm.value.difficulties || "",
    image_url: planForm.value.imageUrl || "",
    video_url: planForm.value.videoUrl || "",
  };

  // 检查传入的数据
  console.log("前端提交的计划数据:", planData);

  // 如果是编辑模式
  if (isEditing) {
    // 调用后端API更新已有计划
    uni.request({
      url: `${serverUrl}/goals`, // 假设后端PUT API地址
      method: "PUT",
      data: planData,
      success: (res) => {
        if (res.data.message === "更新成功") {
          // 更新前端的 plans 数组
          plans.value.splice(currentEditIndex.value, 1, { ...planData });
          uni.showToast({ title: "修改成功", icon: "success" });
          closePopup();
        } else {
          uni.showToast({
            title: res.data.message || "修改失败",
            icon: "none",
          });
        }
      },
      fail: (err) => {
        console.error("请求失败:", err);
        uni.showToast({ title: "网络错误，请稍后重试", icon: "none" });
      },
    });
  } else {
    // 添加新的计划
    uni.request({
      url: `${serverUrl}/goals/add`, // 假设后端POST API地址
      method: "POST",
      data: planData,
      success: (res) => {
        if (res.data.message === "添加成功") {
          plans.value.push(planData);
          uni.showToast({ title: "添加成功", icon: "success" });
          closePopup();
        } else {
          uni.showToast({
            title: res.data.message || "添加失败",
            icon: "none",
          });
        }
      },
      fail: (err) => {
        console.error("请求失败:", err);
        uni.showToast({ title: "网络错误，请稍后重试", icon: "none" });
      },
    });
  }
};
// 选择封面图片
const chooseCoverImage = async () => {
  try {
    console.log("选择图片按钮被点击");
    const res = await uni.chooseImage({
      count: 1, // 选择一张图片
      sourceType: ["album", "camera"], // 可以选择相册或拍照
    });

    if (res.errMsg === "chooseImage:ok") {
      const filePath = res.tempFilePaths[0];
      console.log("选择的图片路径：", filePath);

      // 上传图片到服务器
      const uploadRes = await uploadImage(filePath);
      if (uploadRes && uploadRes.imageUrl) {
        planForm.value.imageUrl = uploadRes.imageUrl; // 将返回的图片 URL 存储在 planForm.imageUrl 中
        console.log("图片上传成功，图片 URL:", uploadRes.imageUrl);
      } else {
        console.error("图片上传失败");
      }
    }
  } catch (error) {
    console.error("选择图片失败:", error);
  }
};

// 上传图片函数
const uploadImage = (filePath) => {
  return new Promise((resolve, reject) => {
    console.log("开始上传图片，路径:", filePath); // 调试输出文件路径

    uni.uploadFile({
      url: serverUrl + "/upload", // 假设上传接口的URL
      filePath: filePath,
      name: "file",
      success: (uploadRes) => {
        try {
          // 解析响应的字符串数据
          const response = JSON.parse(uploadRes.data); // 上传成功返回的是一个JSON字符串
          if (uploadRes.statusCode === 200 && response.success) {
            const imageUrl = response.imageUrl;
            console.log("上传成功，返回的图片URL:", imageUrl);

            // 更新表单中的 imageUrl
            planForm.value.imageUrl = imageUrl;
            uni.showToast({
              title: "上传成功",
              icon: "success",
              duration: 2000,
            });
          } else {
            console.error("上传失败，返回错误:", response);
            uni.showToast({
              title: "上传失败，请重试",
              icon: "none",
            });
          }
        } catch (err) {
          console.error("解析响应数据失败:", err);
          uni.showToast({
            title: "响应数据解析失败",
            icon: "none",
          });
        }
      },
      fail: (err) => {
        console.error("上传失败", err);
        uni.showToast({
          title: "上传失败，请检查网络连接",
          icon: "none",
        });
      },
    });
  });
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
// 添加跳转方法
const toDietRecord = () => {
  uni.navigateTo({
    url: "/pages/DietRecord/DietRecord",
  });
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

// 添加新的响应式变量
const showAddFood = ref(false);
const newFood = ref({
  食物名称: "",
  amount: 100,
  baseCalories: 0,
  currentCalories: 0,
});

// 显示添加食物弹窗
const showAddFoodPopup = () => {
  showAddFood.value = true;
  // 重置表单
  newFood.value = {
    食物名称: "",
    amount: 100,
    baseCalories: 0,
    currentCalories: 0,
  };
};

// 关闭添加食物弹窗
const closeAddFoodPopup = () => {
  showAddFood.value = false;
};

// 确认添加食物
const confirmAddFood = () => {
  if (
    !newFood.value.食物名称 ||
    !newFood.value.amount ||
    !newFood.value.baseCalories
  ) {
    uni.showToast({
      title: "请填写完整信息",
      icon: "none",
    });
    return;
  }

  // 计算当前热量
  newFood.value.currentCalories = Math.round(
    (newFood.value.baseCalories * newFood.value.amount) / 100
  );

  // 添加到手动食物列表
  manualFoodList.value.push({ ...newFood.value });

  // 关闭弹窗
  closeAddFoodPopup();

  uni.showToast({
    title: "添加成功",
    icon: "success",
  });
};

// 添加加载状态变量
const isRecognizing = ref(false);
onUnmounted(() => {
  // WebSocket 的关闭现在由 store 管理
  // 如果需要，可以调用 store.closeWebSocket()
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
  margin-top: 2.5px;
  margin-left: 2.5px;
  width: 350rpx;
  height: 199rpx;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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
  margin-top: 50rpx;
  border-radius: 20rpx;
  border: 1px solid black;
  background-color: white;
  color: black;
  cursor: pointer;
  transition: all 0.3s;

  &:disabled {
    background-color: #f5f5f5;
    color: #999;
    border-color: #ddd;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    background-color: rgb(177, 181, 187);
    color: white;
  }
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
  display: flex; /* 使用flex布 */
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
.food-list {
  margin-top: 50px;
}

.food-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #ddd;
}

.food-name,
.food-calorie {
  flex: 1;
}

button {
  margin-left: 10px;
}

.food-table {
  margin: 20rpx;
  background: white;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  padding: 20rpx 10rpx;
  background: #f8f9fa;
  border-radius: 16rpx 16rpx 0 0;
}

.table-body {
  max-height: 600rpx;
  overflow-y: auto;
}

.table-row {
  display: flex;
  padding: 20rpx 10rpx;
  border-bottom: 1px solid #eee;
  align-items: center;
}

.th,
.td {
  flex: 1;
  text-align: center;
  font-size: 28rpx;

  &.food-name {
    flex: 1.5;
    text-align: left;
    padding-left: 20rpx;
  }
}

.amount-cell,
.op-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;

  input {
    width: 100rpx;
    padding: 6rpx 10rpx;
    border: 1px solid #ddd;
    border-radius: 6rpx;
    text-align: center;
  }

  .unit {
    color: #666;
    font-size: 24rpx;
  }
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  border-top: 1px solid #eee;
}

.add-btn {
  display: flex;
  align-items: center;
  padding: 12rpx 24rpx;
  border: none;
  background: #4caf50;
  color: white;
  border-radius: 30rpx;
  font-size: 28rpx;

  .add-icon {
    margin-right: 10rpx;
    font-size: 32rpx;
  }
}

.total-info {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-left: 25rpx;
  text {
    font-size: 28rpx;
    font-weight: bold;
  }
}

.submit-btn {
  padding: 12rpx 24rpx;
  border: none;
  background: #007aff;
  color: white;
  border-radius: 30rpx;
  font-size: 28rpx;
}

.delete-btn {
  padding: 6rpx 16rpx;
  border: none;
  background: #ff4d4d;
  color: white;
  border-radius: 30rpx;
  font-size: 24rpx;
}

// 弹窗样式
.popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.popup-content {
  width: 80%;
  background: white;
  border-radius: 16rpx;
  overflow: hidden;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  border-bottom: 1px solid #eee;

  .popup-title {
    font-size: 32rpx;
    font-weight: bold;
  }

  .close-btn {
    font-size: 40rpx;
    color: #999;
    padding: 10rpx;
  }
}

.popup-body {
  padding: 30rpx 20rpx;

  .form-item {
    margin-bottom: 20rpx;

    .label {
      display: block;
      margin-bottom: 10rpx;
      font-size: 28rpx;
      color: #333;
    }

    input {
      width: 100%;
      height: 80rpx;
      padding: 0 20rpx;
      border: 1px solid #ddd;
      border-radius: 8rpx;
      font-size: 28rpx;
    }
  }
}

.popup-footer {
  display: flex;
  padding: 20rpx;
  border-top: 1px solid #eee;
  gap: 20rpx;

  button {
    flex: 1;
    height: 80rpx;
    line-height: 80rpx;
    text-align: center;
    border-radius: 8rpx;
    font-size: 28rpx;
  }

  .cancel-btn {
    background: #f5f5f5;
    color: #666;
  }

  .confirm-btn {
    background: #007aff;
    color: white;
  }
}
</style>
