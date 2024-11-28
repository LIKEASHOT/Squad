<script setup>
import { useWebSocketStore } from '@/store/websocket';
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';

const store = useWebSocketStore();

onLaunch(() => {

});

onShow(() => {

});

onHide(() => {
  // 可选：应用进入后台时关闭连接
  // store.closeWebSocket();
});
</script>

<style lang="scss">

	/*每个页面公共css */
	@import '@/uni_modules/uni-scss/index.scss';
	/* #ifndef APP-NVUE */
	@import '@/static/customicons.css';
	
	// 设置整个项目的背景色
	page {
		background-color: #f5f5f5;
	}

	/* #endif */
	.example-info {
		font-size: 14px;
		color: #333;
		padding: 10px;
	}
</style>
