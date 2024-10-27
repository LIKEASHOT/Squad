<!-- 本示例未包含完整css，获取外链css请参考上文，在hello uni-app项目中查看 -->
<template>
  <view>
	<view class="fui-section__title">修改圆角值</view>
			<fui-checkbox-group>
				<fui-label v-for="(item,index) in checkboxItems" :key="index">
					<fui-list-cell>
						<view class="fui-align__center">
							<fui-checkbox :checked="item.checked" :value="item.value" color="#777CFF"
								borderColor="#B2B2B2" borderRadius="8rpx">
							</fui-checkbox>
							<text class="fui-text">{{item.name}}</text>
						</view>
					</fui-list-cell>
				</fui-label>
			</fui-checkbox-group>
    <view class="uni-padding-wrap uni-common-mt">
      <view class="uni-title uni-common-mt">默认样式</view>
      <view>
        <checkbox-group>
          <label> <checkbox value="cb" checked="true" />选中 </label>
          <label> <checkbox value="cb" />未选中 </label>
        </checkbox-group>
      </view>
      <view class="uni-title uni-common-mt">不同颜色和尺寸的checkbox</view>
      <view>
        <checkbox-group>
          <label>
            <checkbox
              value="cb"
              checked="true"
              color="#FFCC33"
              style="transform: scale(0.7)"
            />选中
          </label>
          <label>
            <checkbox
              value="cb"
              color="#FFCC33"
              style="transform: scale(0.7)"
            />未选中
          </label>
        </checkbox-group>
      </view>
    </view>

    <view class="uni-padding-wrap">
      <view class="uni-title uni-common-mt">
        推荐展示样式
        <text>\n使用 uni-list 布局</text>
      </view>
    </view>
    <view class="uni-list">
      <checkbox-group @change="checkboxChange">
        <label
          class="uni-list-cell uni-list-cell-pd"
          v-for="item in items"
          :key="item.value"
        >
          <view>
            <checkbox :value="item.value" :checked="item.checked" />
          </view>
          <view>{{ item.name }}</view>
        </label>
      </checkbox-group>
    </view>
  </view>
</template>
<script>
export default {
  data() {
    return {
      title: "checkbox 复选框",
      items: [
        {
          value: "USA",
          name: "美国",
        },
        {
          value: "CHN",
          name: "中国",
          checked: "true",
        },
        {
          value: "BRA",
          name: "巴西",
        },
        {
          value: "JPN",
          name: "日本",
        },
        {
          value: "ENG",
          name: "英国",
        },
        {
          value: "FRA",
          name: "法国",
        },
		],
		vals: ['1'],
				checkboxItems: [{
						name: '篮球',
						value: '1',
						checked: true
					},
					{
						name: '羽毛球',
						value: '2',
						checked: false
					},
					{
						name: '乒乓球',
						value: '3',
						checked: false
					}
				],
    };
  },
  methods: {
    checkboxChange: function (e) {
      var items = this.items,
        values = e.detail.value;
      for (var i = 0, lenI = items.length; i < lenI; ++i) {
        const item = items[i];
        if (values.includes(item.value)) {
          this.$set(item, "checked", true);
        } else {
          this.$set(item, "checked", false);
        }
      }
	  },
	  change(e) {
				console.log('change:' + JSON.stringify(e.detail.value))
			}
  },
};
</script>

<style>
.uni-list-cell {
  justify-content: flex-start;
}
page {
		font-weight: normal;
	}

	.fui-section__title {
		margin-left: 32rpx;
	}

	.fui-list__item {
		width: 100%;
		display: flex;
		align-items: center;
		background-color: #FFFFFF;
		padding: 28rpx 32rpx;
		box-sizing: border-box;
	}

	.fui-text {
		font-size: 30rpx;
		padding-left: 16rpx;
	}

	.fui-list__cell {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
</style>
