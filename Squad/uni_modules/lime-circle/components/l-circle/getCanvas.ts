
// @ts-nocheck
import type { ComponentInternalInstance } from '@/uni_modules/lime-shared/vue'
import { getRect } from '@/uni_modules/lime-shared/getRect'
import { canIUseCanvas2d } from '@/uni_modules/lime-shared/canIUseCanvas2d'
export let isCanvas2d = canIUseCanvas2d()

export async function getCanvas(canvasId: string, options: {context: ComponentInternalInstance}) {
	let { context } = options
	// #ifdef MP || VUE2
	if (context.proxy) context = context.proxy
	// #endif
	return getRect('#' + canvasId, context, isCanvas2d).then(({node}) => {
		if(node){
			return node
		} else {
			isCanvas2d = false
			const ctx = uni.createCanvasContext(canvasId, context)
			return {
				getContext(type: string) {
					if(type == '2d') {
						return ctx
					}
				},
			}
			// #ifdef H5
			// canvas.value = context.proxy.$el.querySelector('#'+ canvasId)
			// #endif
		}
	})
}
