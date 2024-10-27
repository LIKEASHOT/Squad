"use strict";
const common_vendor = require("../../../../common/vendor.js");
const _sfc_main = {
  name: "fui-label",
  props: {
    //padding值：['20rpx','32rpx']->[上，右，下，左]
    padding: {
      type: Array,
      default() {
        return [];
      }
    },
    //margin值：[上，右，下，左]
    margin: {
      type: Array,
      default() {
        return [];
      }
    },
    full: {
      type: Boolean,
      default: false
    },
    inline: {
      type: Boolean,
      default: false
    }
  },
  created() {
    this.childrens = [];
  },
  methods: {
    onClick() {
      if (this.childrens && this.childrens.length > 0) {
        for (let child of this.childrens) {
          child.labelClick();
        }
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $props.full ? 1 : "",
    b: $props.inline ? 1 : "",
    c: $props.padding[0] || 0,
    d: $props.padding[1] || 0,
    e: $props.padding[2] || $props.padding[0] || 0,
    f: $props.padding[3] || $props.padding[1] || 0,
    g: $props.margin[0] || 0,
    h: $props.margin[1] || 0,
    i: $props.margin[2] || $props.margin[0] || 0,
    j: $props.margin[3] || $props.margin[1] || 0,
    k: common_vendor.o((...args) => $options.onClick && $options.onClick(...args))
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-186dfc0c"]]);
wx.createComponent(Component);
