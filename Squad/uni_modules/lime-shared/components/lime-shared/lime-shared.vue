<template>
	<view id="shared" style="height: 500px; width: 300px; background-color: aqua;">
		
	</view>
</template>

<script lang="ts">
	import { getRect, getAllRect } from '@/uni_modules/lime-shared/getRect'
	
	import { camelCase } from '@/uni_modules/lime-shared/camelCase'
	import { canIUseCanvas2d } from '@/uni_modules/lime-shared/canIUseCanvas2d'
	import { clamp } from '@/uni_modules/lime-shared/clamp'
	import { cloneDeep } from '@/uni_modules/lime-shared/cloneDeep'
	import { closest } from '@/uni_modules/lime-shared/closest'
	import { debounce } from '@/uni_modules/lime-shared/debounce'
	import { fillZero } from '@/uni_modules/lime-shared/fillZero'
	import { floatAdd } from '@/uni_modules/lime-shared/floatAdd'
	import { floatMul } from '@/uni_modules/lime-shared/floatMul'
	import { floatDiv } from '@/uni_modules/lime-shared/floatDiv'
	import { floatSub } from '@/uni_modules/lime-shared/floatSub'
	import { getClassStr } from '@/uni_modules/lime-shared/getClassStr'
	import { getCurrentPage } from '@/uni_modules/lime-shared/getCurrentPage'
	import { getStyleStr } from '@/uni_modules/lime-shared/getStyleStr'
	import { hasOwn } from '@/uni_modules/lime-shared/hasOwn'
	import { isBase64 } from '@/uni_modules/lime-shared/isBase64'
	import { isBrowser } from '@/uni_modules/lime-shared/isBrowser'
	import { isDef } from '@/uni_modules/lime-shared/isDef'
	import { isEmpty } from '@/uni_modules/lime-shared/isEmpty'
	import { isFunction } from '@/uni_modules/lime-shared/isFunction'
	import { isNumber } from '@/uni_modules/lime-shared/isNumber'
	import { isNumeric } from '@/uni_modules/lime-shared/isNumeric'
	import { isObject } from '@/uni_modules/lime-shared/isObject'
	import { isPromise } from '@/uni_modules/lime-shared/isPromise'
	import { isString } from '@/uni_modules/lime-shared/isString'
	import { kebabCase } from '@/uni_modules/lime-shared/kebabCase'
	import { raf, doubleRaf } from '@/uni_modules/lime-shared/raf'
	import { random } from '@/uni_modules/lime-shared/random'
	import { range } from '@/uni_modules/lime-shared/range'
	import { sleep } from '@/uni_modules/lime-shared/sleep'
	import { throttle } from '@/uni_modules/lime-shared/throttle'
	import { toArray } from '@/uni_modules/lime-shared/toArray'
	import { toBoolean } from '@/uni_modules/lime-shared/toBoolean'
	import { toNumber } from '@/uni_modules/lime-shared/toNumber'
	import { unitConvert } from '@/uni_modules/lime-shared/unitConvert'
	import { getCurrentInstance } from '@/uni_modules/lime-shared/vue'
	import { capitalizedAmount } from '@/uni_modules/lime-shared/capitalizedAmount'
	
	// #ifdef VUE2
	type UTSJSONObject = any
	// #endif
	
	const context = getCurrentInstance()
	// getRect('#shared', context!).then(res =>{
	// 	console.log('res', res.bottom)
	// })
	// getAllRect('#shared', context).then(res =>{
	// 	console.log('res', res)
	// })
	
	
	// console.log('camelCase::', camelCase("hello world"));
	// console.log('camelCase::', camelCase("my_name_is_john", true));
	// console.log('canIUseCanvas2d::', canIUseCanvas2d());
	// console.log('clamp::', clamp(5 ,0, 10));
	// console.log('cloneDeep::', cloneDeep<UTSJSONObject>({a:5}));
	// console.log('closest::', closest([1, 3, 5, 7, 9], 6));
	
	
	
	
	// const saveData = (data: any) => {
	// 	// 模拟保存数据的操作
	// 	console.log(`Saving data: ${data}`);
	// }
	
	// const debouncedSaveData = debounce(saveData, 500);
	// debouncedSaveData('Data 1'); 
	// debouncedSaveData('Data 2'); 
	
	// console.log('fillZero', fillZero(1))
	// console.log('floatAdd', floatAdd(0.1, 0.2), floatAdd(1.05, 0.05), floatAdd(0.1, 0.7), floatAdd(0.0001, 0.0002), floatAdd(123.456 , 789.012))
	// console.log('floatMul', floatMul(0.1, 0.02), floatMul(1.0255, 100))
	// console.log('floatDiv', floatDiv(10.44, 100), floatDiv(1.0255, 100), floatDiv(5.419909340994699, 0.2))
	// console.log('floatSub', floatSub(0.4, 0.1), floatSub(1.0255, 100))
	const now = () : number => System.nanoTime() / 1_000_000.0
	console.log('capitalizedAmount', capitalizedAmount(0.4))
	console.log('capitalizedAmount', capitalizedAmount(100))
	console.log('capitalizedAmount', capitalizedAmount(100000000))
	console.log('capitalizedAmount', capitalizedAmount('2023.04'))
	console.log('capitalizedAmount', capitalizedAmount(-1024))
	console.log('now', now(), Date.now())
	// console.log('getClassStr', getClassStr({hover: true}))
	// console.log('getStyleStr', getStyleStr({ color: 'red', fontSize: '16px', backgroundColor: '', border: null }))
	// console.log('hasOwn', hasOwn({a: true}, 'key'))
	// console.log('isBase64::', isBase64("SGVsbG8sIFdvcmxkIQ=="));
	// console.log('isBrowser::', isBrowser);
	// console.log('isDef::', isDef('6'));
	// console.log('isEmpty::', isEmpty({a: true}));
	
	// const b = () =>{}
	// console.log('isFunction::', isFunction(b));
	// console.log('isNumber::', isNumber('6'));
	// console.log('isNumeric::', isNumeric('6'));
	// console.log('isObject::', isObject({}));
	
	// const promise = ():Promise<boolean> => {
	// 	return new Promise((resolve) => {
	// 		resolve(true)
	// 	})
	// }
	// const a = promise()
	// console.log('isPromise::', isPromise(a));
	// console.log('isString::', isString('null'));
	// console.log('kebabCase::', kebabCase('my love'));
	// console.log('raf::', raf(()=>{
	// 	console.log('raf:::1')
	// }));
	// console.log('doubleRaf::', doubleRaf(()=>{
	// 	console.log('doubleRaf:::1')
	// }));
	// console.log('random', random(0, 10))
	// console.log('random', random(0, 1, 2))
	// console.log('range', range(0, 10, 2))
	// console.log('sleep', sleep(300).then(res => {
	// 	console.log('log')
	// }))
	
	// const handleScroll = (a: string) => {
	//   console.log("Scroll event handled!", a);
	// }
	
	// // // 使用节流函数对 handleScroll 进行节流，间隔时间为 500 毫秒
	// const throttledScroll = throttle(handleScroll, 500);
	// throttledScroll('5');
	// const page = getCurrentPage()
	// console.log('getCurrentPage::', page)
	
	// console.log('toArray', toArray<number>(5))
	// console.log('toBoolean', toBoolean(5))
	// console.log('toNumber', toNumber('5'))
	// console.log('unitConvert', unitConvert('5'))
	
	// uni.getImageInfo({
	// 	src: '/static/logo.png',
	// 	success(res) {
	// 		console.log('res', res)
	// 	}
	// })
	export default {
		
	}
</script>

<style>

</style>