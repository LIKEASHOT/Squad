<template>
	<view class="l-circle" :class="[{clockwise: !clockwise && !useCanvas}, ['is-' + lineCap]]" :style="[styles]">
		<!-- #ifndef APP-NVUE -->
		<view class="check"></view>
		<view v-if="!useCanvas" class="l-circle__trail" :style="[trailStyles]">
			<text class="cap start"></text>
			<text class="cap end"></text>
		</view>
		<view v-if="!useCanvas" class="l-circle__stroke" :style="[strokeStyles]">
			<view class="l-circle__stroke-line"></view>
			<text class="cap start" v-if="current"></text>
			<text class="cap end" v-if="current"></text>
		</view>
		<canvas v-if="useCanvas" type="2d" :canvas-id="canvasId" :id="canvasId" class="l-circle__canvas"></canvas>
		<!-- #endif -->
		<!-- #ifdef APP-NVUE -->
		<web-view @pagefinish="finished = true" @error="onerror" @onPostMessage="onMessage" class="l-circle__view"
			ref="webview" src="/uni_modules/lime-circle/hybrid/html/index.html"></web-view>
		<!-- #endif -->
		<view class="l-circle__inner">
			<slot></slot>
		</view>
	</view>
</template>
<script lang="ts">
	// @ts-nocheck
	import { ref, computed, watch, defineComponent, onMounted, onUnmounted, getCurrentInstance } from '@/uni_modules/lime-shared/vue';
	import CircleProps from './props';
	import { getCanvas, isCanvas2d } from './getCanvas';
	import { Circle } from './circle.esm'
	import { useTransition, UseTransitionOptions } from '@/uni_modules/lime-shared/animation/useTransition'
	// import { useTransition, UseTransitionOptions } from '@/uni_modules/lime-use/useTransition'
	import { addUnit } from '@/uni_modules/lime-shared/addUnit';
	import { unitConvert } from '@/uni_modules/lime-shared/unitConvert';
	import { getRect } from '@/uni_modules/lime-shared/getRect';
	import { getCircleStyle } from './utils';

	export default defineComponent({
		name: 'l-circle',
		props: CircleProps,
		emits: ['update:current'],
		setup(props, { emit }) {
			const context = getCurrentInstance().proxy!
			const useCanvas = ref(props.canvas)
			const canvasId = `l-circle-${context.uid}`;
			let circleCanvas = null

			// const ratio = computed(() => 100 / props.max)
			const percent = ref<number>(0)
			const offsetTop = ref<number | string>(0)
			const current = useTransition<number>(percent, {
				duration: props.duration,
			})
			
			const styles = computed(() => ({
				width: addUnit(props.size),
				height: addUnit(props.size),
				// #ifdef APP-NVUE
				transform: !useCanvas.value && `translateY(${offsetTop.value})`,
				// #endif
				// #ifndef APP-NVUE
				'--l-circle-offset-top': !useCanvas.value && offsetTop.value,
				// '--l-circle-percent': `${Math.min(props.percent, props.max) * ratio.value}%`,
				// '--l-circle-percent2': `${Math.min(props.percent, props.max) * ratio.value / 100}`,
				// #endif
			}))
			const classes = computed(() => {
				const { clockwise, lineCap } = props
				return lineCap ? `is-${lineCap} ` : ' ' + !clockwise && !useCanvas.value && `clockwise`
			})
			const widths = computed(()=>{
				return [
					unitConvert(props.trailWidth),
					unitConvert(props.strokeWidth)
				]
			})
			// css render 
			const trailStyles = computed(() => {
				// trailWidth
				const { size, trailColor, dashboard, gapDegree, gapPosition } = props
				return getCircleStyle('trail', size, 1, dashboard ? gapDegree : 0, gapPosition, trailColor, widths.value[0])
			})
			const strokeStyles = computed(() => {
				// strokeWidth
				const { size, strokeColor, dashboard, max, gapDegree, gapPosition } = props
				return getCircleStyle('stroke', size, Math.min(current.value / props.max, 1), dashboard ? gapDegree : 0, gapPosition, strokeColor, widths.value[1])
			})

			
			const stopPercent = watch(() => props.percent, (v:number) => {
				percent.value = Math.min(v, props.max)
				circleCanvas && circleCanvas.play(v)
			})

			const stopCurrent = watch(current, (v:number) => {
				emit('update:current', v.toFixed(2))
			})
			const getProps = () => {
				// const { strokeWidth, trailWidth } = props
				return Object.assign({}, props, { trailWidth: widths.value[0], strokeWidth: widths.value[1] })
			}
			// #ifdef APP-NVUE
			const finished = ref(false)
			const init = ref(false)
			const webview = ref(null)
			const onerror = () => {

			}
			const onMessage = (e : any) => {
				const { detail: { data: [res] } } = e;
				if (res.event == 'init') {
					useCanvas.value = res.data.useCanvas || props.canvas
					init.value = true;
					webview.value.evalJs(`init(${useCanvas.value})`)
					circleCanvas = {
						setOption(props : any) {
							webview.value.evalJs(`setOption(${JSON.stringify(props)})`)
						},
						play(v : number) {
							webview.value.evalJs(`play(${v})`)
						}
					}
				}
				if (res.event == 'progress') {
					current.value = res.data
				}
			}
			let stopFinnished = watch(init, () => {
				stopFinnished()
				if (useCanvas.value) {
					circleCanvas.setOption(getProps())
					circleCanvas.play(props.percent)
					// stopTransition()
				} else {
					webview.value.evalJs(`setClass('.l-circle', 'is-round', ${props.lineCap == 'round'})`)
					webview.value.evalJs(`setClass('.l-circle', 'clockwise', ${props.clockwise})`)
					webview.value.evalJs(`setStyle(0,${JSON.stringify(trailStyles.value)})`)
					stopFinnished = watch(strokeStyles, ()=>{
						webview.value.evalJs(`setStyle(1,${JSON.stringify(Object.assign(strokeStyles.value, {opacity: current.value/100 > 0.03?1:current.value/100}))})`)
					})//,{immediate: true}
				}
				percent.value = props.percent
			})

			// #endif
			// #ifndef APP-NVUE
			onMounted(() => {
				getRect('.check', context).then(res => {
					useCanvas.value = !(res.height > 0 && !props.canvas)
					if (useCanvas.value) {
						// stopTransition()
						setTimeout(() => {
							getCanvas(canvasId, { context }).then(res => {
								circleCanvas = new Circle(res, {
									size: unitConvert(props.size),
									run: (v : number) => current.value = v,
									pixelRatio: isCanvas2d ? uni.getSystemInfoSync().pixelRatio : 1,
								})
								circleCanvas.setOption(getProps())
								circleCanvas.play(props.percent)
							})
						}, 50)
					}
					percent.value = props.percent
				})
			})
			// #endif
			onUnmounted(() => {
				stopPercent()
				stopCurrent()
				// stopTransition()
				// #ifdef APP-NVUE
				stopFinnished && stopFinnished()
				// #endif
			})
			return {
				useCanvas,
				canvasId,
				classes,
				styles,
				trailStyles,
				strokeStyles,
				current,
				// #ifdef APP-NVUE
				webview,
				onerror,
				onMessage,
				finished
				// #endif
			}
		}
	})
</script>
<style lang="scss">
	@import './index';
</style>