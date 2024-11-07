// @ts-nocheck
import { unitConvert } from '@/uni_modules/lime-shared/unitConvert';
import { isString } from '@/uni_modules/lime-shared/isString';

/**
 * 获取圆的信息
 * @param {number | string} size 
 * @param {number | string} lineWidth 
 * @return 
 */
export function getCircle(size : number | string, lineWidth : number | string) {
	const s = unitConvert(size)
	const w = unitConvert(lineWidth)
	const c = (s - w) / 2
	const r = s / 2 - w
	return {
		s, w, c, r
	}
}

/**
 * 获取中心被掏空的样式
 * @param {number} radius 
 * @return 
 */
export function getMaskStyle(radius : number = 0) {
	return `radial-gradient(transparent ${radius - 0.5}px, #000 ${radius}px)`
}

// 圆周长
// perimeter: number,
// 不包含间距的圆周长
// perimeterWithoutGap: number,

export function getCircleStyle(
	name: string,
	// 圆的尺寸
	size : number,
	// 进度条偏移量
	// offset : number,
	// 当前进度百分比
	percent : number,
	// 旋转角度
	// rotateDeg : number,
	// 间距角度
	gapDegree : number,
	// 间距位置
	gapPosition : string, //ProgressProps['gapPosition'] | undefined,
	// 描边颜色
	strokeColor : string|string[],  //StrokeColorType,
	// 描边宽度
	strokeWidth: number,
	// 步长空间，默认为 0
	// stepSpace = 0,

) {
	const positionDeg = gapDegree === 0 ? 0 : {
		bottom: 0,
		top: 180,
		left: 90,
		right: -90,
	}[gapPosition];
	
	const rotateDeg = gapDegree > 0 ? 90 + gapDegree / 2 : -90;
	const offsetDeg = 90
	const circle = getCircle(size, strokeWidth)
	const perimeter = (360 - gapDegree) / 360 * percent * 100
	const startDeg = positionDeg + rotateDeg + offsetDeg
	// const endDeg = startDeg + perimeter * 360
	const mask = getMaskStyle(circle.r)
	let background = ''
	let startColor = ''
	let endColor = ''
	if(isString(strokeColor)){
		startColor = strokeColor
		endColor = strokeColor
		// background = `conic-gradient(from ${startDeg}deg, ${startColor} 0%, ${startColor} calc(var(--l-circle-percent) * ${perimeter}), transparent calc(var(--l-circle-percent) * ${perimeter}), transparent 100%)`
		background = `conic-gradient(from ${startDeg}deg, ${startColor} 0%, ${startColor} ${perimeter}%, transparent ${perimeter}%, transparent 100%)`
	} else if(Array.isArray(strokeColor)){
		background = `conic-gradient(from ${startDeg}deg, transparent 0%,`
		const len = strokeColor.length
		for (let i = 0; i < len; i++) {
			const color = strokeColor[i] as string
			if (i === 0) {
				background += `${color} 0%,`
				startColor = color
			} else {
				// background += `${color} calc(var(--l-circle-percent) * ${perimeter} * ${(i + 1) / len}),`
				background += `${color} ${perimeter * (i + 1) / len}%,`
			}
			if (i == len - 1) {
				endColor = color
			}
		}
		// background += `transparent calc(var(--l-circle-percent) * ${perimeter}), transparent 100%)`
		background += `transparent ${perimeter}%, transparent 100%)`
	}
	
	return {
		color: startColor,
		[`--l-circle-${name}-cap-start`]: `${startDeg}deg`,
		[`--l-circle-${name}-cap-color-end`]: endColor,
		// [`--l-circle-${name}-cap-end`]: `calc(var(--l-circle-percent2) * ${perimeter} * 360deg + ${startDeg}deg)`,
		[`--l-circle-${name}-cap-end`]: `${perimeter / 100 * 360 + startDeg}deg`,
		[`--l-circle-${name}-cap-size`]: `${strokeWidth / 2}px`,
		mask,
		'-webkit-mask': mask,
		'--l-background':background
	}
}