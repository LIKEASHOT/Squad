<!-- 计划管理页面 -->
<template>
  <div class="plan-manage">
    <div class="plan-manage-header">
        <div class="plan-manage-header-title">计划管理</div>
        <div class="plan-manage-header-search">
            <el-input placeholder="请输入内容" v-model="searchValue" clearable></el-input>
            <el-button type="primary" @click="search">搜索</el-button>
        </div>
    </div>
    <div class="plan-manage-content">
        <el-table :data="tableData" style="width: 100%">
            <el-table-column prop="date" label="日期" width="180"></el-table-column>
            <el-table-column prop="name" label="姓名" width="180"></el-table-column>
            <el-table-column prop="address" label="地址"></el-table-column>
        </el-table>
    </div>
    </div>
</template>
<script setup>
    


</script>