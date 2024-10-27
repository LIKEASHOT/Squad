<template>
    <view class="custom-input-container">
      <input
        :type="type"
        :placeholder="placeholder"
        :value="modelValue"
        class="custom-input"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
      />
    </view>
  </template>
  
  <script setup>
  import { defineProps, defineEmits } from 'vue';
  
  const props = defineProps({
    modelValue: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: 'text', // 可以传入 "text" 或 "password"
    },
    placeholder: {
      type: String,
      default: '请输入内容',
    },
  });
  
  const emit = defineEmits(['update:modelValue']);
  
  const onInput = (event) => {
    emit('update:modelValue', event.target.value); // 发出 update:modelValue 事件
  };
  
  const onFocus = (event) => {
    event.target.style.borderColor = '#007bff'; // 获取焦点时改变边框颜色
  };
  
  const onBlur = (event) => {
    event.target.style.borderColor = '#e0e0e0'; // 失去焦点时还原边框颜色
  };
  </script>
  
  <style scoped>
  .custom-input-container {
    width: 100%;
    padding: 12px;
    background-color: #f5f5f5;
    border-radius: 30px; /* 平滑圆角 */
    border: 1px solid #e0e0e0;
    transition: border-color 0.3s;
  }
  
  .custom-input {
    width: 100%;
    padding: 10px;
    border: none;
    outline: none;
    background-color: transparent; /* 透明背景，避免覆盖容器样式 */
    font-size: 16px;
    border-radius: 30px;
  }
  </style>