<template>
	<view style="width: 100vw;">
		<view class="screen-bar" :style="{'height':height + 'rpx',backgroundColor:bgcolor}">
			<view class="screen-bar-item" @tap.stop="itemClick(index)" v-for="(item,index) in updateArr" :key="index"
				:style="{'width':(100/titleArr.length)+'%','fontSize':barFontSize+'rpx','color':(currentIndex==index&&show)?activeColor:barTextColor}">
				<view class="bar-item-text">
					{{item}}
				</view>
				<image :src="arrBase64"
					:style="{'transform': show?currentIndex==index? 'rotate(180deg)':'rotate(0)':'rotate(0)'}"></image>
			</view>
			<view class="dropdown-box"
				:style="{'bottom':'-' + (itemHeight*maxDropdownLength) + 'rpx','height':(itemHeight*maxDropdownLength) + 'rpx',backgroundColor:bgcolor,'opacity':show?'1':'0','display':show?'block':'none'}">
				<scroll-view scroll-y="true" style="height: 100%;">
					<view class="dropdown-item"
						:style="{'height':itemHeight+'rpx','paddingLeft':itemPadding+'rpx','fontSize':itemFontSize+'rpx','color':itemTextColor}"
						v-for="(item,index) in dropArr[currentIndex]" :key="index" @tap.stop="subItemClick(index)">
						{{item[showTag]}}
					</view>
				</scroll-view>
			</view>
		</view>
		<view class="bg-mask" :class="[show?'bg-mask-show':'']" @tap="maskClose" @touchmove="touchControl"></view>
	</view>

</template>

<script>
	/**
	 *  下拉组件
	 * @author xzj
	 * @create date 2021-4-3
	 * @update user xzj
	 * @update date 2021-4-3
	 * @note 遮罩层级98 筛选条&下拉层层级99
	 **/
	export default {

		data() {
			return {
				// 主条目选择序列
				currentIndex: 0,
				// 下拉条目序列
				currentSubIndex: 0,
				show: false,
				// 更新数组
				updateArr: [],
				// 结果数组
				resultArr: [],
				arrBase64: 'data:image/png;base64,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'
			};
		},
		computed: {
			maxDropdownLength() {
				return this.dropArr[this.currentIndex].length > this.maxItemCount ? this.maxItemCount : this.dropArr[this
					.currentIndex].length
			}
		},
		props: {
			// 筛选条高度 （rpx）
			height: {
				type: Number,
				default: 92
			},
			// 下拉单项高度
			itemHeight: {
				type: Number,
				default: 88
			},
			// 当前文字活跃颜色
			activeColor: {
				type: String,
				default: '#0377fc'
			},
			//背景颜色
			bgcolor: {
				type: String,
				default: '#fff'
			},
			//下拉标题数组
			titleArr: {
				type: Array,
				default: () => {
					return []
				}
			},
			// item数量超过多少开始滚动
			maxItemCount: {
				type: Number,
				default: 6
			},

			//下拉选项数组（二维数组）
			dropArr: {
				type: Array,
				default: () => {
					return []
				}
			},
			// 选项左偏移
			itemPadding: {
				type: Number,
				default: 24
			},
			// 能否遮罩关闭
			maskTouch: {
				type: Boolean,
				default: true
			},
			// 是否需要选择后替换标题
			isNeedChangeTitle: {
				type: Boolean,
				default: true
			},
			// 标题字号
			barFontSize: {
				type: Number,
				default: 26
			},
			//标题颜色
			barTextColor: {
				type: String,
				default: '#666'
			},
			//下拉字号
			itemFontSize: {
				type: Number,
				default: 26
			},
			// 下拉文字颜色
			itemTextColor: {
				type: String,
				default: '#666'
			},
			// 需要展示的字段，比如你的数据是item.name 这里填的就是name
			showTag: {
				type: String,
				default: 'text'
			},
			// 是否要滑动关闭
			isTouchPrevent: {
				type: Boolean,
				default: true
			},
			// 自定义事件的索引数组
			customIndexArr: {
				type: Array,
				default: () => {
					return []
				}
			}
		},
		mounted() {

			// 设置更新数组与列表数组同长度
			this.updateArr = [...new Set(this.titleArr)]
			// 设置结果数组与列表数组同长度
			this.resultArr = new Array(this.titleArr.length).fill('');

		},
		methods: {
			itemClick(index) {
				if (this.customIndexArr.includes(index)) {
					this.show = false
					this.$emit('customClick', {
						'$index': index
					})
					return
				}
				if (this.currentIndex == index) {
					this.show = !this.show
				} else {
					this.currentIndex = index
					this.show = true
				}
			},
			subItemClick(index) {
				this.currentSubIndex = index
				if (this.isNeedChangeTitle) {
					this.updateArr.splice(this.currentIndex, 1, this.dropArr[this.currentIndex][this.currentSubIndex][this
						.showTag
					])
				}

				this.resultArr.splice(this.currentIndex, 1, this.dropArr[this.currentIndex][this.currentSubIndex].value);

				this.$emit('finishDropClick', this.resultArr)

				console.log('更新数组 = ' + JSON.stringify(this.resultArr));

				this.show = false
			},
			maskClose() {
				if (!this.maskTouch) return
				this.show = false
			},
			//
			touchControl() {
				if (this.isTouchPrevent) {
					this.maskClose()
				}
			}
		}
	}
</script>

<style>
	.screen-bar {
		width: 100%;
		display: flex;
		position: relative;
		z-index: 99;
	}

	.screen-bar::after {
		position: absolute;
		content: '';
		width: 100%;
		height: 1rpx;
		background-color: #EEEEEE;
		bottom: -1rpx;
		left: 0;
		z-index: 99;
	}

	.screen-bar-item {
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.screen-bar-item image {
		width: 24rpx;
		height: 24rpx;
		display: block;
		margin-left: 12rpx;
		transition: all .3s;
		flex-shrink: 0;
	}

	.dropdown-box {
		width: 100%;
		position: absolute;
		left: 0;
		z-index: 99;
		overflow: hidden;
	}

	.dropdown-item {
		width: 100%;
		display: flex;
		align-items: center;
		padding: 0 30rpx;
		box-sizing: border-box;
		font-size: 26rpx;
		color: #111111;
		border-bottom: 1rpx solid #EEEEEE;
	}

	.bg-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.3);
		z-index: 98;
		transition: all 0.3s ease-in-out;
		opacity: 0;
		visibility: hidden;
	}

	.bg-mask-show {
		visibility: visible;
		opacity: 1;
	}

	.bar-item-text {
		max-width: 120rpx;
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
	}
</style>