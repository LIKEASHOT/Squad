# cc-dropDownMenu



##uniapp专属精品组件页面模板（由前端组件开发出品）精品组件页面模板

###●组件模板规划：
由前端组件开发出品的精品组件页面模板，将陆续发布，预计高达约几百种供您使用，是快速快发项目、创业的必备精品。

合集地址： uni-app模板合集地址：(https://ext.dcloud.net.cn/publisher?id=274945) 如查看全部页面模板，请前往上述uniapp插件市场合集地址；

###●组件模板效果图：
可下载项目后预览，效果图见右侧图片；

###●组件模板费用：
学习：免费下载，进行学习，无费用；

使用/商用：本页面地址赞赏10元后，可终身商用；

###●组件模板使用版权/商用：
本组件模板免费下载可供学习，如需使用及商用，请在本组件页面模板进行赞赏10元

（仅需10元获取精品页面模板代码-物有所值，1个组件页面市场价100元 ）

赞赏10后（当前项目产生赞赏订单可追溯）即可终身商用当前本地址下载的页面模版代码，不同下载地址需进行不同的赞赏。（不赞赏就进行商用使用者，面临侵权！保留追究知识产权法律责任！后果自负！）


### 我的技术公众号(私信可加前端技术交流群)

群内气氛颇为不错，应该可能算为数不多专门进行技术交流的前端群，同时也涵盖后端技术产品交流，偶尔成员们会聊天摸鱼。

![图片](https://i.postimg.cc/RZ0sjnYP/front-End-Component.jpg)


#### 使用方法 
```使用方法
<!-- titleArr: 选择项数组 dropArr: 下拉项数组 二维数组 @finishDropClick: 下拉筛选完成事件-->
<cc-dropDownMenu :titleArr="titleArr" :dropArr="dropArr" @finishDropClick="finishClick"></cc-dropDownMenu>				

```

#### HTML代码实现部分
```html

<template>
	<view class="content">

		<!-- titleArr: 选择项数组 dropArr: 下拉项数组 二维数组 @finishDropClick: 下拉筛选完成事件-->
		<cc-dropDownMenu :titleArr="titleArr" :dropArr="dropArr" @finishDropClick="finishClick"></cc-dropDownMenu>

	</view>
</template>


<script>
	export default {

		data() {
			return {

				titleArr: ['区域', '户型', '面积', '价格'],
				dropArr: [
					// 区域
					[{
							text: '不限',
							value: ""
						},
						{
							text: '荔湾区',
							value: "440103"
						}, {
							text: '越秀区',
							value: "440104"
						},
						{
							text: "海珠区",
							value: "440105"
						},
						{
							text: '天河区',
							value: "440106"
						},
						{
							text: '白云区',
							value: "440111"
						},
						{
							text: '花都区',
							value: "440114"
						},
						{
							text: '从化区',
							value: "440117"
						}, {
							text: '南海区',
							value: "440605"
						}
					],
					// 户型
					[{
							text: '不限',
							value: ""
						}, {
							text: '单间',
							value: "10000"
						},
						{
							text: '一房一厅',
							value: "11000"
						},
						{
							text: '两房一厅',
							value: "21000"
						},
						{
							text: '三房一厅',
							value: "31000"
						}, {
							text: '四房两厅',
							value: "42000"
						}
					],

					// [@"≤40㎡",@"40-60㎡",@"60-80㎡",@"80-100㎡",@"100-120㎡",@"≥120㎡"]
					// 面积
					[{
							text: '不限',
							value: ""
						}, {
							text: '≤40㎡',
							value: "0-40"
						},
						{
							text: '40-60㎡',
							value: "40-60"
						},
						{
							text: '60-80㎡',
							value: "60-80"
						},
						{
							text: '80-100㎡',
							value: "80-100"
						},
						{
							text: '100-120㎡',
							value: "100-120"
						},
						{
							text: '≥120㎡',
							value: "120-99999"
						}
					],

					// [@"≤1000",@"1000-1500",@"1500-2000",@"2000-3000",@"3000-4000㎡,@"≥4000"]
					// 租金
					[{
							text: '不限',
							value: ""
						}, {
							text: '≤1000元',
							value: "0-1000"
						},
						{
							text: '1000-1500元',
							value: "1000-1500"
						},
						{
							text: '1500-2000元',
							value: "1500-2000"
						},
						{
							text: '2000-3000元',
							value: "2000-3000"
						},
						{
							text: '3000-4000元',
							value: "3000-4000"
						},
						{
							text: '≥4000元',
							value: "4000-99999"
						}
					]
				],
				filterResultData: []
			}
		},
		methods: {

			finishClick(resultData) {

				this.filterResultData = resultData;
				uni.showModal({
					title: '温馨提示',
					content: '筛选数据 = ' + JSON.stringify(resultData)
				})
			}
		}
	}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.logo {
		height: 200rpx;
		width: 200rpx;
		margin-top: 200rpx;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 50rpx;
	}

	.text-area {
		display: flex;
		justify-content: center;
	}

	.title {
		font-size: 36rpx;
		color: #8f8f94;
	}
</style>


```
