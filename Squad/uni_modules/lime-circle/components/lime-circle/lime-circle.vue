<template>
	<demo-block title="进度环" type="ultra">
		<demo-block title="基础">
			<!-- #ifdef VUE3 -->
			<l-circle dashboard gapPosition="bottom" :gapDegree="90"  v-model:current="modelValue1" :percent="target1" >
				<text>{{modelValue1}}%</text>
			</l-circle>
			
			<l-circle v-model:current="modelValue1" :percent="target1" :stroke-color="['#0000ff', '#ff0000', '#ffa500']" size="200rpx" >
				<text>{{modelValue1}}%</text>
			</l-circle>
			<l-circle v-model:current="modelValue1" strokeWidth="20" trailWidth="20" :percent="target1" :dashboard="true"  :stroke-color="['#0000ff', '#ff0000']" size="200rpx">
				<text>{{modelValue1}}%</text>
			</l-circle>
			<!-- #endif -->
			
			<!-- #ifndef VUE3 -->
			<l-circle :current.sync="modelValue1" :percent="target1" size="200rpx">
				<text>{{modelValue1}}%</text>
			</l-circle>
			
			<l-circle :current.sync="modelValue1" :percent="target1" :dashboard="false"  :clockwise="false" :stroke-color="['#0000ff', '#ff0000', '#ffa500']" size="200rpx">
				<text>{{modelValue1}}%</text>
			</l-circle>
			<l-circle :current.sync="modelValue1"  strokeWidth="20" trailWidth="20" :percent="target1" :dashboard="true"  :stroke-color="['#0000ff', '#ff0000']" size="200rpx">
				<text>{{modelValue1}}%</text>
			</l-circle>
			<!-- #endif -->
			
			<button @tap="onClick(20)">+</button>
			<button @tap="onClick(-20)">-</button>
		</demo-block>
		<demo-block title="倒计时">
			<!-- #ifdef VUE3 -->
			<l-circle v-model:current="modelValue2" :percent="target4" :max="60" :dashboard="false" :clockwise="true" >
				<text>{{modelValue2}}</text>
			</l-circle>
			<!-- #endif -->
			
			<!-- #ifndef VUE3 -->
			<l-circle :current.sync="modelValue2" :percent="target4" :max="60" :dashboard="false" :clockwise="true" >
				<text>{{modelValue2}}</text>
			</l-circle>
			<!-- #endif -->
			<button @tap="onPlay">播放</button>
			<button @tap="onStop">暂停</button>
		</demo-block>
	</demo-block>
</template>
<script>
	import {ref, defineComponent} from '@/uni_modules/lime-shared/vue';
	
	export default defineComponent({
		setup() {
			const target1 = ref(50)
			const modelValue1 = ref(0)
			
			const target4 = ref(60)
			const modelValue2 = ref(0)
			
			const onClick = number => {
				target1.value = Math.max(Math.min(100, target1.value + number), 0)
			}
			
			let timer = null
			let isPlay = false
			const countDown  = () => {
				target4.value -= 1
				if(target4.value) {
					timer = setTimeout(countDown,1000)
				}
			}
			const onStop = () => {
				isPlay = false
				clearTimeout(timer)
			}
			const onPlay = () => {
				if(isPlay) return
				isPlay = true
				timer = setTimeout(countDown,1000)
			}
			
			
			
			return {
				target1,
				target4,
				modelValue1,
				modelValue2,
				
				onClick,
				onStop,
				onPlay
			}
		}
	})
	
</script>
<style>
	
</style>
