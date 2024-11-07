// @ts-nocheck

export interface CircleProps {
	/**
	* 进度环尺寸
	* @default 120pxs
	*/
	size : string
	/**
	 * 百分比
	 * @default 0
	 */
	percent : number
	/**
	 *  顶端形态
	 * @default 'round' 
	 */
	lineCap : string
	/**
	 * 进度环线宽
	 * @default 6
	 */
	strokeWidth : number | string
	/**
	 * 进度环颜色
	 * @default #2db7f5
	 */
	strokeColor : string | string[]
	/**
	 * 轨道环线宽
	 * @default 6
	 */
	trailWidth : number | string
	/**
	 * 轨道环颜色
	 * @default #eaeef2
	 */
	trailColor : string
	/**
	 * 是否显示为仪表盘
	 * @default false
	 */
	dashboard : boolean
	/**
	 * 是否为顺时针
	 * @default true
	 */
	clockwise : boolean
	/**
	 * 持续时间
	 * @default 300
	 */
	duration : number
	/**
	 *  总长度
	 * @default 100
	 */
	max : number
	/**
	 * 缺口角度 
	 * @default 90
	*/
	gapDegree: Number
	/**
	 * 缺口位置
	 * @default bottom
	*/
	gapPosition: String
}