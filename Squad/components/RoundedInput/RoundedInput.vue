<template>
    <div class="input-container">
      <input
        type="text"
        v-model="inputValue"
        :placeholder="placeholder"
        class="rounded-input"
      />
      <!-- 使用静态图片作为删除按钮 -->
      <img
        v-if="inputValue"
        src="@/static/delete_icon/删除.png"
        alt="Clear"
        class="clear-icon"
        @click="clearInput"
      />
    </div>
  </template>
  
  <script setup>
  import { ref } from "vue";
  
  const props = defineProps({
    placeholder: {
      type: String,
      default: "请输入内容...",
    },
  });
  
  const inputValue = ref("");
  
  // 清除输入框内容
  const clearInput = () => {
    console.log("Delete button clicked");
    inputValue.value = "";
  };
  </script>
  
  <style scoped lang="scss">
  .input-container {
    position: relative;
    width: 100%;
    max-width: 600rpx;
  }
  
  .rounded-input {
    width: 100%;
    padding: 20rpx;
    border: none;
    background-color: #ffffff;
    font-size: 16px;
    border-radius: 30rpx;
    border: 2px solid #adb1b6;
    box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
    outline: none;
  }
  
  .clear-icon {
    position: absolute;
    right: 20rpx;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    width: 36rpx;
    height: 36rpx;
    transition: color 0.3s;
  }
  
  .clear-icon:hover {
    color: #333;
  }
  </style>
  