# lime-circle 进度环
- 基于uniapp vue3 提供css3和canvas两种渲染方式的的环形进度条

## 使用
- 导入插件后直接使用

### 基础使用
- 非uvue默认使用css实现的方式，在不支持css方案的手机会自动切为canvas

```html
<l-circle v-model:current="modelVale" :percent="target">
	<text>{{modelVale}}%</text>
</l-circle>
```
```js
const target = ref(50)
const modelVale = ref(0)
```

### canvas渲染
- 也可以主动设置 `canvas` 使用canvas方式渲染，uvue无效

```html
<l-circle v-model:current="modelVale" :percent="target" canvas>
	<text>{{modelVale}}%</text>
</l-circle>
```
```js
const target = ref(50)
const modelVale = ref(0)
```

### 查看示例
导入后直接使用这个标签查看演示效果

```html
// 代码位于 uni_modules/lime-circle/compoents/lime-circle
<lime-circle />
```


### 插件标签
- 默认 l-circle 为 component
- 默认 lime-circle 为 demo

### 关于vue2的使用方式
- 插件使用了`composition-api`, 如果你希望在vue2中使用请按官方的教程[vue-composition-api](https://uniapp.dcloud.net.cn/tutorial/vue-composition-api.html)配置
- 关键代码是: 在main.js中 在vue2部分加上这一段即可

```js
// main.js vue2
import Vue from 'vue'
import VueCompositionAPI from '@vue/composition-api'
Vue.use(VueCompositionAPI)
```


#### 使用

```html
<l-circle :current.sync="modelVale" :percent="target">
	<text>{{modelVale}}%</text>
</l-circle>
<button @tap="onClick(20)">+</button>
<button @tap="onClick(-20)">-</button>
```
```js
export default {
	data() {
		return {
			modelVale: 0,
			target: 50
		}
	},
	methods: {
		onClick(number) {
			this.target = Math.max(Math.min(100, this.target + number), 0)
		}
	}
}
```


## API

### Props

| 参数                       | 说明                                                         | 类型             | 默认值       |
| --------------------------| ------------------------------------------------------------ | ---------------- | ------------ |
| percent                   | 进度环目标值                                                    | <em>number</em>  | `0`        |
| v-model:current           | 进度环当前值(从上一个percent到当前percent的过渡值)              | <em>number</em>  | `-`        |
| size                      | 进度环尺寸                                                     | <em>string</em>  | `120px`     |
| lineCap           		| 进度条顶端形态 , 可选值 `butt` `round`                           | <em>string</em>  | `round`      |
| strokeWidth           	| 进度条宽度                   									 | <em>number，string</em>  | `6`      |
| strokeColor           	| 进度条颜色, 若为数组即为渐变色（渐变色值仅支持hex）uvue不支持渐变    	| <em>string、string[]</em>  | `#2db7f5`  |
| trailWidth             	| 轨道环线宽度          					                     	| <em>number，string</em>  | `6`  |
| trailColor             	| 轨道环线颜色         					                     	| <em>string</em>  | `#eaeef2`  |
| dashboard             	| 是否为仪表盘样式        					                     | <em>boolean</em>  | `false`  |
| clockwise             	| 是否为顺时针      					                    		 | <em>boolean</em>  | `true`  |
| duration             		| 变化过渡时间, ms      					                    	| <em>number</em>  | `300`  |
| max             		    | 总长度（例如：max 100,percent 50 时，进度为50%）   				| <em>number</em>  | `100`  |
| canvas             		| 是否使用canvas渲染  					                    	| <em>boolean</em>  | `false`  |


## 打赏

如果你觉得本插件，解决了你的问题，赠人玫瑰，手留余香。  
![](https://testingcf.jsdelivr.net/gh/liangei/image@1.9/alipay.png)
![](https://testingcf.jsdelivr.net/gh/liangei/image@1.9/wpay.png)