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
    <div class="search-results" v-else>
      <h3>搜索结果</h3>
      <!-- 在这里显示搜索结果 -->
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      searchQuery: "",
      recommendations: [],
    };
  },
  created() {
    this.loadRecommendations();
  },
  methods: {
    loadRecommendations() {
      // 模拟获取推荐内容，可以通过脚本动态增加或修改
      this.recommendations = [
        "推荐内容1",
        "推荐内容2",
        "推荐内容3",
        // 可以通过脚本增加更多内容
      ];
    },
    onSearchInput() {
      // 处理搜索输入
      // 可以在这里添加搜索逻辑
    },
    selectRecommendation(item) {
      this.searchQuery = item;
      // 触发搜索
    },
    cancelSearch() {
      this.$router.back();
    },
  },
};
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
</style>
