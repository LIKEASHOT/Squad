"use strict";
const common_vendor = require("../../../../common/vendor.js");
const _sfc_main = {
  name: "fui-list-cell",
  emits: ["click"],
  props: {
    //padding值，上、右、下、左,nvue下padding-right(右)无效
    padding: {
      type: Array,
      default() {
        return [];
      }
    },
    //margin-top 单位rpx
    marginTop: {
      type: [Number, String],
      default: 0
    },
    //margin-bottom 单位rpx
    marginBottom: {
      type: [Number, String],
      default: 0
    },
    //背景颜色
    background: {
      type: String,
      default: ""
    },
    //是否有点击效果
    highlight: {
      type: Boolean,
      default: true
    },
    //是否需要右侧箭头
    arrow: {
      type: Boolean,
      default: false
    },
    arrowColor: {
      type: String,
      default: ""
    },
    //是否显示上边框
    topBorder: {
      type: Boolean,
      default: false
    },
    //是否显示下边框
    bottomBorder: {
      type: Boolean,
      default: true
    },
    //边框颜色，非nvue下传值则全局默认样式失效
    borderColor: {
      type: String,
      default: ""
    },
    //上边框left值，单位rpx
    topLeft: {
      type: [Number, String],
      default: 0
    },
    //上边框right值，单位rpx
    topRight: {
      type: [Number, String],
      default: 0
    },
    //下边框left值，单位rpx
    bottomLeft: {
      type: [Number, String],
      default: -1
    },
    //下边框right值，单位rpx
    bottomRight: {
      type: [Number, String],
      default: 0
    },
    //border-radius圆角值
    radius: {
      type: String,
      default: "0"
    },
    index: {
      type: Number,
      default: 0
    }
  },
  computed: {
    getPadding() {
      let padding = this.padding;
      if (Array.isArray(padding) && padding.length === 0) {
        const app = common_vendor.index && common_vendor.index.$fui && common_vendor.index.$fui.fuiListCell;
        padding = app && app.padding;
        if (!padding || Array.isArray(padding) && padding.length === 0) {
          padding = ["32rpx", "32rpx"];
        }
      }
      return padding;
    },
    getArrowColor() {
      const app = common_vendor.index && common_vendor.index.$fui && common_vendor.index.$fui.fuiListCell;
      return this.arrowColor || app && app.arrowColor || "#B2B2B2";
    },
    getBorderColor() {
      let color = this.borderColor;
      return color;
    },
    getBottomLeft() {
      const app = common_vendor.index && common_vendor.index.$fui && common_vendor.index.$fui.fuiListCell;
      let left = this.bottomLeft;
      const c_left = app && app.bottomLeft;
      if (left === -1) {
        left = c_left === void 0 || c_left === null ? 32 : c_left;
      }
      return left;
    }
  },
  methods: {
    handleClick() {
      this.$emit("click", {
        index: this.index
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.topBorder
  }, $props.topBorder ? {
    b: $options.getBorderColor,
    c: $props.topLeft + "rpx",
    d: $props.topRight + "rpx",
    e: !$options.getBorderColor ? 1 : ""
  } : {}, {
    f: $props.bottomBorder
  }, $props.bottomBorder ? {
    g: $options.getBorderColor,
    h: $options.getBottomLeft + "rpx",
    i: $props.bottomRight + "rpx",
    j: !$options.getBorderColor ? 1 : ""
  } : {}, {
    k: $props.arrow
  }, $props.arrow ? {
    l: $options.getArrowColor
  } : {}, {
    m: $props.highlight ? 1 : "",
    n: !$props.background ? 1 : "",
    o: $options.getPadding[0] || 0,
    p: $options.getPadding[1] || 0,
    q: $options.getPadding[2] || $options.getPadding[0] || 0,
    r: $options.getPadding[3] || $options.getPadding[1] || 0,
    s: $props.background,
    t: $props.marginTop + "rpx",
    v: $props.marginBottom + "rpx",
    w: $props.radius,
    x: common_vendor.o((...args) => $options.handleClick && $options.handleClick(...args))
  });
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-c16a41c6"]]);
wx.createComponent(Component);
