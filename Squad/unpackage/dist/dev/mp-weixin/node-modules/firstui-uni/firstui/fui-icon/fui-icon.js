"use strict";
const common_vendor = require("../../../../common/vendor.js");
const _sfc_main = {
  name: "fui-icon",
  emits: ["click"],
  options: {
    addGlobalClass: true
  },
  props: {
    name: {
      type: String,
      default: ""
    },
    size: {
      type: [Number, String],
      default: 0
    },
    //rpx | px
    unit: {
      type: String,
      default: ""
    },
    color: {
      type: String,
      default: ""
    },
    //字重
    fontWeight: {
      type: [Number, String],
      default: "normal"
    },
    //是否禁用点击
    disabled: {
      type: Boolean,
      default: false
    },
    params: {
      type: [Number, String],
      default: 0
    },
    customPrefix: {
      type: String,
      default: ""
    },
    //是否显示为主色调，color为空时有效。【内部使用】
    primary: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    getSize() {
      const size = common_vendor.index.$fui && common_vendor.index.$fui.fuiIcon && common_vendor.index.$fui.fuiIcon.size || 64;
      const unit = common_vendor.index.$fui && common_vendor.index.$fui.fuiIcon && common_vendor.index.$fui.fuiIcon.unit || "rpx";
      return (this.size || size) + (this.unit || unit);
    },
    primaryColor() {
      const app = common_vendor.index && common_vendor.index.$fui && common_vendor.index.$fui.color;
      return app && app.primary || "#465CFF";
    },
    getColor() {
      const app = common_vendor.index && common_vendor.index.$fui && common_vendor.index.$fui.fuiIcon;
      let color = this.color;
      if (!color || color && color === true) {
        color = app && app.color;
      }
      return color;
    }
  },
  data() {
    return {
      icons: common_vendor.icons
    };
  },
  methods: {
    handleClick() {
      if (this.disabled)
        return;
      this.$emit("click", {
        params: this.params
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($data.icons[$props.name] || ""),
    b: $options.getColor,
    c: $options.getSize,
    d: $props.fontWeight,
    e: common_vendor.n(!$options.getColor && !$props.primary ? "fui-icon__color" : ""),
    f: common_vendor.n($props.primary && (!$props.color || $props.color === true) ? "fui-icon__active-color" : ""),
    g: common_vendor.n($props.disabled ? "fui-icon__not-allowed" : ""),
    h: common_vendor.n($props.customPrefix && $props.customPrefix !== true ? $props.customPrefix : ""),
    i: common_vendor.n($props.customPrefix && $props.customPrefix !== true ? $props.name : ""),
    j: common_vendor.o((...args) => $options.handleClick && $options.handleClick(...args))
  };
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-0d5d8e40"]]);
wx.createComponent(Component);
