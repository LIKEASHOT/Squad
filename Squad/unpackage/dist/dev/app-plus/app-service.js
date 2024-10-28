if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global = uni.requireGlobal();
  ArrayBuffer = global.ArrayBuffer;
  Int8Array = global.Int8Array;
  Uint8Array = global.Uint8Array;
  Uint8ClampedArray = global.Uint8ClampedArray;
  Int16Array = global.Int16Array;
  Uint16Array = global.Uint16Array;
  Int32Array = global.Int32Array;
  Uint32Array = global.Uint32Array;
  Float32Array = global.Float32Array;
  Float64Array = global.Float64Array;
  BigInt64Array = global.BigInt64Array;
  BigUint64Array = global.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  function resolveEasycom(component, easycom) {
    return typeof component === "string" ? easycom : component;
  }
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const _sfc_main$c = {
    name: "fui-input",
    emits: ["input", "update:modelValue", "focus", "blur", "confirm", "click", "keyboardheightchange"],
    props: {
      //是否为必填项
      required: {
        type: Boolean,
        default: false
      },
      requiredColor: {
        type: String,
        default: ""
      },
      //左侧标题
      label: {
        type: String,
        default: ""
      },
      //标题字体大小
      labelSize: {
        type: [Number, String],
        default: 0
      },
      labelColor: {
        type: String,
        default: "#333"
      },
      //label 最小宽度 rpx
      labelWidth: {
        type: [Number, String],
        default: 140
      },
      clearable: {
        type: Boolean,
        default: false
      },
      clearColor: {
        type: String,
        default: "#CCCCCC"
      },
      //获取焦点
      focus: {
        type: Boolean,
        default: false
      },
      placeholder: {
        type: String,
        default: ""
      },
      placeholderStyle: {
        type: String,
        default: ""
      },
      //输入框名称
      name: {
        type: String,
        default: ""
      },
      //输入框值 vue2
      value: {
        type: [Number, String],
        default: ""
      },
      //输入框值
      modelValue: {
        type: [Number, String],
        default: ""
      },
      //vue3
      modelModifiers: {
        default: () => ({})
      },
      //兼容写法，type为text时也做Number处理，NaN时返回原值
      number: {
        type: Boolean,
        default: false
      },
      //与官方input type属性一致
      type: {
        type: String,
        default: "text"
      },
      password: {
        type: Boolean,
        default: false
      },
      disabled: {
        type: Boolean,
        default: false
      },
      //V2.1.0+
      disabledStyle: {
        type: Boolean,
        default: false
      },
      readonly: {
        type: Boolean,
        default: false
      },
      maxlength: {
        type: [Number, String],
        default: 140
      },
      min: {
        type: [Number, String],
        default: "NaN"
      },
      max: {
        type: [Number, String],
        default: "NaN"
      },
      cursorSpacing: {
        type: Number,
        default: 0
      },
      confirmType: {
        type: String,
        default: "done"
      },
      confirmHold: {
        type: Boolean,
        default: false
      },
      cursor: {
        type: Number,
        default: -1
      },
      selectionStart: {
        type: Number,
        default: -1
      },
      selectionEnd: {
        type: Number,
        default: -1
      },
      adjustPosition: {
        type: Boolean,
        default: true
      },
      holdKeyboard: {
        type: Boolean,
        default: false
      },
      autoBlur: {
        type: Boolean,
        default: false
      },
      alwaysEmbed: {
        type: Boolean,
        default: false
      },
      size: {
        type: [Number, String],
        default: 0
      },
      color: {
        type: String,
        default: "#333"
      },
      inputBorder: {
        type: Boolean,
        default: false
      },
      isFillet: {
        type: Boolean,
        default: false
      },
      radius: {
        type: [Number, String],
        default: 8
      },
      borderTop: {
        type: Boolean,
        default: false
      },
      topLeft: {
        type: [Number, String],
        default: 0
      },
      topRight: {
        type: [Number, String],
        default: 0
      },
      borderBottom: {
        type: Boolean,
        default: true
      },
      bottomLeft: {
        type: [Number, String],
        default: 32
      },
      bottomRight: {
        type: [Number, String],
        default: 0
      },
      borderColor: {
        type: String,
        default: ""
      },
      trim: {
        type: Boolean,
        default: true
      },
      //即将废弃，请使用textAlign属性
      textRight: {
        type: Boolean,
        default: false
      },
      //V2.2.0+ 可选值：left/center/right
      textAlign: {
        type: String,
        default: "left"
      },
      padding: {
        type: Array,
        default() {
          return ["28rpx", "32rpx"];
        }
      },
      backgroundColor: {
        type: String,
        default: "#FFFFFF"
      },
      marginTop: {
        type: [Number, String],
        default: 0
      }
    },
    data() {
      return {
        placeholderStyl: "",
        focused: false,
        val: ""
      };
    },
    computed: {
      getRadius() {
        let radius = this.radius + "rpx";
        if (this.isFillet) {
          radius = "120px";
        }
        return radius;
      },
      getBorderRadius() {
        let radius = Number(this.radius) * 2 + "rpx";
        if (this.isFillet) {
          radius = "240px";
        }
        return radius;
      },
      getSize() {
        const size = uni.$fui && uni.$fui.fuiInput && uni.$fui.fuiInput.size || 32;
        return `${this.size || size}rpx`;
      },
      getLabelSize() {
        const labelSize = uni.$fui && uni.$fui.fuiInput && uni.$fui.fuiInput.labelSize || 32;
        return `${this.labelSize || labelSize}rpx`;
      },
      dangerColor() {
        const app = uni && uni.$fui && uni.$fui.color;
        return app && app.danger || "#FF2B2B";
      }
    },
    watch: {
      focus(val) {
        this.$nextTick(() => {
          setTimeout(() => {
            this.focused = val;
          }, 20);
        });
      },
      placeholderStyle() {
        this.fieldPlaceholderStyle();
      },
      modelValue(newVal) {
        this.val = newVal;
      },
      value(newVal) {
        this.val = newVal;
      }
    },
    created() {
      this.fieldPlaceholderStyle();
      setTimeout(() => {
        if (this.value && !this.modelValue) {
          this.val = this.value;
        } else {
          this.val = this.modelValue;
        }
      }, 50);
    },
    mounted() {
      this.$nextTick(() => {
        setTimeout(() => {
          this.focused = this.focus;
        }, 300);
      });
    },
    methods: {
      fieldPlaceholderStyle() {
        if (this.placeholderStyle) {
          this.placeholderStyl = this.placeholderStyle;
        } else {
          const _size = uni.$fui && uni.$fui.fuiInput && uni.$fui.fuiInput.size || 32;
          const size = uni.upx2px(this.size || _size);
          this.placeholderStyl = `fontSize:${size}px;`;
        }
      },
      onInput(event) {
        let value = event.detail.value;
        if (this.trim)
          value = this.trimStr(value);
        this.val = value;
        const currentVal = Number(value);
        if ((this.modelModifiers.number || this.number || this.type === "digit" || this.type === "number") && !isNaN(currentVal) && Number.isSafeInteger(currentVal)) {
          let eVal = this.type === "digit" ? value : currentVal;
          if (typeof eVal === "number") {
            const min = Number(this.min);
            const max = Number(this.max);
            if (typeof min === "number" && currentVal < min) {
              eVal = min;
            } else if (typeof max === "number" && max < currentVal) {
              eVal = max;
            }
          }
          value = isNaN(eVal) ? value : eVal;
        }
        this.$nextTick(() => {
          event.detail.value !== "" && (this.val = String(value));
        });
        const inputValue = event.detail.value !== "" ? value : "";
        this.$emit("input", inputValue);
        this.$emit("update:modelValue", inputValue);
      },
      onFocus(event) {
        this.$emit("focus", event);
      },
      onBlur(event) {
        this.$emit("blur", event);
      },
      onConfirm(e) {
        this.$emit("confirm", e);
      },
      onClear(event) {
        if (this.disabled && !this.readonly)
          return;
        uni.hideKeyboard();
        this.val = "";
        this.$emit("input", "");
        this.$emit("update:modelValue", "");
      },
      fieldClick() {
        this.$emit("click", {
          name: this.name,
          target: "wrap"
        });
      },
      /**
       * 在安卓nvue上，事件无法冒泡 
       * 外层容器点击事件无法触发，需要单独处理
       */
      fieldClickAndroid(e) {
      },
      getParent(name = "fui-form-item") {
        let parent = this.$parent;
        let parentName = parent.$options.name;
        while (parentName !== name) {
          parent = parent.$parent;
          if (!parent)
            return false;
          parentName = parent.$options.name;
        }
        return parent;
      },
      onKeyboardheightchange(e) {
        this.$emit("keyboardheightchange", e.detail);
      },
      trimStr(str) {
        return str.replace(/^\s+|\s+$/g, "");
      }
    }
  };
  function _sfc_render$b(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: vue.normalizeClass(["fui-input__wrap", { "fui-input__border-nvue": $props.inputBorder }]),
        style: vue.normalizeStyle({ paddingTop: $props.padding[0] || 0, paddingRight: $props.padding[1] || 0, paddingBottom: $props.padding[2] || $props.padding[0] || 0, paddingLeft: $props.padding[3] || $props.padding[1] || 0, background: $props.backgroundColor, marginTop: $props.marginTop + "rpx", borderRadius: $options.getRadius, borderColor: $props.borderColor }),
        onClick: _cache[6] || (_cache[6] = (...args) => $options.fieldClick && $options.fieldClick(...args))
      },
      [
        $props.borderTop && !$props.inputBorder ? (vue.openBlock(), vue.createElementBlock(
          "view",
          {
            key: 0,
            style: vue.normalizeStyle({ background: $props.borderColor, left: $props.topLeft + "rpx", right: $props.topRight + "rpx" }),
            class: vue.normalizeClass(["fui-input__border-top", { "fui-input__background": !$props.borderColor }])
          },
          null,
          6
          /* CLASS, STYLE */
        )) : vue.createCommentVNode("v-if", true),
        $props.inputBorder ? (vue.openBlock(), vue.createElementBlock(
          "view",
          {
            key: 1,
            class: vue.normalizeClass(["fui-input__border", { "fui-input__bordercolor": !$props.borderColor }]),
            style: vue.normalizeStyle({ borderRadius: $options.getBorderRadius, borderColor: $props.borderColor })
          },
          null,
          6
          /* CLASS, STYLE */
        )) : vue.createCommentVNode("v-if", true),
        $props.required ? (vue.openBlock(), vue.createElementBlock(
          "view",
          {
            key: 2,
            class: "fui-input__required",
            style: vue.normalizeStyle({ color: $props.requiredColor || $options.dangerColor })
          },
          "*",
          4
          /* STYLE */
        )) : vue.createCommentVNode("v-if", true),
        $props.label ? (vue.openBlock(), vue.createElementBlock(
          "view",
          {
            key: 3,
            class: "fui-input__label",
            style: vue.normalizeStyle({ minWidth: $props.labelWidth + "rpx" })
          },
          [
            vue.createElementVNode(
              "text",
              {
                style: vue.normalizeStyle({ fontSize: $options.getLabelSize, color: $props.labelColor })
              },
              vue.toDisplayString($props.label),
              5
              /* TEXT, STYLE */
            )
          ],
          4
          /* STYLE */
        )) : vue.createCommentVNode("v-if", true),
        vue.renderSlot(_ctx.$slots, "left", {}, void 0, true),
        vue.createElementVNode("input", {
          class: vue.normalizeClass(["fui-input__self", { "fui-input__text-right": $props.textRight, "fui-input__disabled-styl": $props.disabled && $props.disabledStyle, "fui-input__disabled": $props.disabled }]),
          style: vue.normalizeStyle({ fontSize: $options.getSize, color: $props.color, textAlign: $props.textRight ? "right" : $props.textAlign }),
          "placeholder-class": "fui-input__placeholder",
          type: $props.type,
          name: $props.name,
          value: $data.val,
          placeholder: $data.val ? "" : $props.placeholder,
          password: $props.password || $props.type === "password" || null,
          "placeholder-style": $data.placeholderStyl,
          disabled: $props.disabled || $props.readonly,
          "cursor-spacing": $props.cursorSpacing,
          maxlength: $props.maxlength,
          focus: $data.focused,
          "confirm-type": $props.confirmType,
          "confirm-hold": $props.confirmHold,
          cursor: $props.cursor,
          "selection-start": $props.selectionStart,
          "selection-end": $props.selectionEnd,
          "adjust-position": $props.adjustPosition,
          "hold-keyboard": $props.holdKeyboard,
          "auto-blur": $props.autoBlur,
          enableNative: false,
          "always-embed": $props.alwaysEmbed,
          onFocus: _cache[0] || (_cache[0] = (...args) => $options.onFocus && $options.onFocus(...args)),
          onBlur: _cache[1] || (_cache[1] = (...args) => $options.onBlur && $options.onBlur(...args)),
          onInput: _cache[2] || (_cache[2] = (...args) => $options.onInput && $options.onInput(...args)),
          onConfirm: _cache[3] || (_cache[3] = (...args) => $options.onConfirm && $options.onConfirm(...args)),
          onKeyboardheightchange: _cache[4] || (_cache[4] = (...args) => $options.onKeyboardheightchange && $options.onKeyboardheightchange(...args))
        }, null, 46, ["type", "name", "value", "placeholder", "password", "placeholder-style", "disabled", "cursor-spacing", "maxlength", "focus", "confirm-type", "confirm-hold", "cursor", "selection-start", "selection-end", "adjust-position", "hold-keyboard", "auto-blur", "always-embed"]),
        $props.clearable && $data.val != "" ? (vue.openBlock(), vue.createElementBlock(
          "view",
          {
            key: 4,
            class: "fui-input__clear-wrap",
            style: vue.normalizeStyle({ background: $props.clearColor }),
            onClick: _cache[5] || (_cache[5] = vue.withModifiers((...args) => $options.onClear && $options.onClear(...args), ["stop"]))
          },
          [
            vue.createElementVNode("view", { class: "fui-input__clear" }, [
              vue.createElementVNode("view", { class: "fui-input__clear-a" })
            ]),
            vue.createElementVNode("view", { class: "fui-input__clear" }, [
              vue.createElementVNode("view", { class: "fui-input__clear-b" })
            ])
          ],
          4
          /* STYLE */
        )) : vue.createCommentVNode("v-if", true),
        vue.renderSlot(_ctx.$slots, "default", {}, void 0, true),
        $props.borderBottom && !$props.inputBorder ? (vue.openBlock(), vue.createElementBlock(
          "view",
          {
            key: 5,
            style: vue.normalizeStyle({ background: $props.borderColor, left: $props.bottomLeft + "rpx", right: $props.bottomRight + "rpx" }),
            class: vue.normalizeClass(["fui-input__border-bottom", { "fui-input__background": !$props.borderColor }])
          },
          null,
          6
          /* CLASS, STYLE */
        )) : vue.createCommentVNode("v-if", true)
      ],
      6
      /* CLASS, STYLE */
    );
  }
  const __easycom_0$2 = /* @__PURE__ */ _export_sfc(_sfc_main$c, [["render", _sfc_render$b], ["__scopeId", "data-v-a23503dd"], ["__file", "C:/Users/LIKEASHOT/Documents/HBuilderProjects/Squad/node_modules/firstui-uni/firstui/fui-input/fui-input.vue"]]);
  const icons = {
    "addressbook": "",
    "addfriends-fill": "",
    "addfriends": "",
    "backspace-fill": "",
    "backspace": "",
    "bankcard-fill": "",
    "bankcard": "",
    "camera-fill": "",
    "camera": "",
    "captcha-fill": "",
    "captcha": "",
    "cart-fill": "",
    "cart": "",
    "classify": "",
    "classify-fill": "",
    "comment-fill": "",
    "comment": "",
    "community-fill": "",
    "community": "",
    "coupon-fill": "",
    "coupon": "",
    "delete": "",
    "delete-fill": "",
    "edit": "",
    "edit-fill": "",
    "fabulous-fill": "",
    "fabulous": "",
    "find": "",
    "find-fill": "",
    "help-fill": "",
    "help": "",
    "home-fill": "",
    "home": "",
    "idcard-fill": "",
    "idcard": "",
    "info": "",
    "info-fill": "",
    "invite-fill": "",
    "invite": "",
    "kefu-fill": "",
    "kefu": "",
    "like-fill": "",
    "like": "",
    "location": "",
    "location-fill": "",
    "lock": "",
    "lock-fill": "",
    "mail-fill": "",
    "mail": "",
    "message": "",
    "message-fill": "",
    "mobile-fill": "",
    "mobile": "",
    "more": "",
    "more-fill": "",
    "my-fill": "",
    "my": "",
    "principal": "",
    "notice-fill": "",
    "notice": "",
    "order": "",
    "order-fill": "",
    "picture": "",
    "picture-fill": "",
    "setup-fill": "",
    "setup": "",
    "share": "",
    "share-fill": "",
    "shop": "",
    "shop-fill": "",
    "star-fill": "",
    "star": "",
    "starhalf": "",
    "stepon-fill": "",
    "stepon": "",
    "wait-fill": "",
    "wait": "",
    "warning": "",
    "warning-fill": "",
    "plus": "",
    "plussign-fill": "",
    "plussign": "",
    "minus": "",
    "minussign": "",
    "minussign-fill": "",
    "close": "",
    "clear": "",
    "clear-fill": "",
    "checkbox-fill": "",
    "checkround": "",
    "checkbox": "",
    "check": "",
    "pulldown-fill": "",
    "pullup": "",
    "pullup-fill": "",
    "pulldown": "",
    "roundright-fill": "",
    "roundright": "",
    "arrowright": "",
    "arrowleft": "",
    "arrowdown": "",
    "left": "",
    "up": "",
    "right": "",
    "back": "",
    "top": "",
    "dropdown": "",
    "turningleft": "",
    "turningup": "",
    "turningright": "",
    "turningdown": "",
    "refresh": "",
    "loading": "",
    "search": "",
    "rotate": "",
    "screen": "",
    "signin": "",
    "calendar": "",
    "scan": "",
    "qrcode": "",
    "wallet": "",
    "telephone": "",
    "visible": "",
    "invisible": "",
    "menu": "",
    "operate": "",
    "slide": "",
    "list": "",
    "nonetwork": "",
    "partake": "",
    "qa": "",
    "barchart": "",
    "piechart": "",
    "linechart": "",
    "at": "",
    "face": "",
    "redpacket": "",
    "suspend": "",
    "link": "",
    "keyboard": "",
    "play": "",
    "video": "",
    "voice": "",
    "sina": "",
    "browser": "",
    "moments": "",
    "qq": "",
    "wechat": "",
    "balance": "",
    "bankcardpay": "",
    "wxpay": "",
    "alipay": "",
    "payment": "",
    "receive": "",
    "sendout": "",
    "evaluate": "",
    "aftersale": "",
    "warehouse": "",
    "transport": "",
    "delivery": "",
    "switch": "",
    "goods": "",
    "goods-fill": ""
  };
  const _sfc_main$b = {
    name: "fui-icon",
    emits: ["click"],
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
        const size = uni.$fui && uni.$fui.fuiIcon && uni.$fui.fuiIcon.size || 64;
        const unit = uni.$fui && uni.$fui.fuiIcon && uni.$fui.fuiIcon.unit || "rpx";
        return (this.size || size) + (this.unit || unit);
      },
      primaryColor() {
        const app = uni && uni.$fui && uni.$fui.color;
        return app && app.primary || "#465CFF";
      },
      getColor() {
        const app = uni && uni.$fui && uni.$fui.fuiIcon;
        let color = this.color;
        if (!color || color && color === true) {
          color = app && app.color;
        }
        return color;
      }
    },
    data() {
      return {
        icons
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
  function _sfc_render$a(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "text",
      {
        style: vue.normalizeStyle({ color: $options.getColor, fontSize: $options.getSize, fontWeight: $props.fontWeight }),
        class: vue.normalizeClass(["fui-icon", [!$options.getColor && !$props.primary ? "fui-icon__color" : "", $props.primary && (!$props.color || $props.color === true) ? "fui-icon__active-color" : "", $props.disabled ? "fui-icon__not-allowed" : "", $props.customPrefix && $props.customPrefix !== true ? $props.customPrefix : "", $props.customPrefix && $props.customPrefix !== true ? $props.name : ""]]),
        onClick: _cache[0] || (_cache[0] = (...args) => $options.handleClick && $options.handleClick(...args))
      },
      vue.toDisplayString($data.icons[$props.name] || ""),
      7
      /* TEXT, CLASS, STYLE */
    );
  }
  const __easycom_1$1 = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["render", _sfc_render$a], ["__scopeId", "data-v-0d5d8e40"], ["__file", "C:/Users/LIKEASHOT/Documents/HBuilderProjects/Squad/node_modules/firstui-uni/firstui/fui-icon/fui-icon.vue"]]);
  const logo$2 = "/static/Squad1.png";
  const _sfc_main$a = {
    __name: "Login",
    setup(__props, { expose: __expose }) {
      __expose();
      const isPressed = vue.ref(false);
      const password = vue.ref(true);
      const inputpwd = (e) => {
        formatAppLog("log", "at pages/Login/Login.vue:88", e);
      };
      const changepwd_vis = () => {
        password.value = !password.value;
      };
      const onButtonPress = () => {
        isPressed.value = true;
      };
      const onButtonRelease = () => {
        isPressed.value = false;
      };
      const form = vue.ref({
        account: "",
        password: ""
      });
      const submitLogin = () => {
        if (!form.value.account || !form.value.password) {
          uni.showToast({
            title: "请输入账号和密码",
            icon: "none"
          });
          return;
        }
        formatAppLog("log", "at pages/Login/Login.vue:116", "提交登录表单", form.value);
      };
      const goRegister = () => {
        formatAppLog("log", "at pages/Login/Login.vue:121", "前往注册页面");
        uni.navigateTo({ url: "/pages/Register/Register" });
      };
      const __returned__ = { isPressed, password, inputpwd, changepwd_vis, onButtonPress, onButtonRelease, logo: logo$2, form, submitLogin, goRegister, ref: vue.ref };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$9(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_fui_input = resolveEasycom(vue.resolveDynamicComponent("fui-input"), __easycom_0$2);
    const _component_fui_icon = resolveEasycom(vue.resolveDynamicComponent("fui-icon"), __easycom_1$1);
    return vue.openBlock(), vue.createElementBlock("view", { class: "login-container" }, [
      vue.createCommentVNode(" Logo 和标题 "),
      vue.createElementVNode("view", { class: "logo-container" }, [
        vue.createElementVNode("image", {
          src: $setup.logo,
          class: "logo"
        }),
        vue.createElementVNode("text", { class: "title" }, "Squad")
      ]),
      vue.createCommentVNode(" 登录表单 "),
      vue.createElementVNode("view", { class: "form-container" }, [
        vue.createCommentVNode(' <uni-easyinput\n        v-model="form.account"\n        placeholder="请输入账号"\n        clearable\n        class="input-field rounded-input"\n      ></uni-easyinput> '),
        vue.createVNode(_component_fui_input, {
          placeholder: "请输入账号",
          borderTop: "",
          padding: ["20rpx", "32rpx"],
          modelValue: $setup.form.account,
          "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.form.account = $event),
          isFillet: true,
          clearable: ""
        }, null, 8, ["modelValue"]),
        vue.createElementVNode("view", { class: "spacing" }),
        vue.createCommentVNode(" 账号和密码之间的间距 "),
        vue.createCommentVNode(' <uni-easyinput\n        v-model="form.password"\n        placeholder="请输入密码"\n        type="password"\n        clearable\n        class="input-field rounded-input"\n      ></uni-easyinput> '),
        vue.createVNode(_component_fui_input, {
          borderTop: "",
          padding: ["20rpx", "32rpx"],
          placeholder: "请输入密码",
          password: $setup.password,
          clearable: "",
          modelValue: $setup.form.password,
          "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.form.password = $event),
          isFillet: true,
          onInput: $setup.inputpwd
        }, {
          default: vue.withCtx(() => [
            vue.createVNode(_component_fui_icon, {
              name: $setup.password ? "invisible" : "visible",
              color: "#B2B2B2",
              size: 50,
              onClick: $setup.changepwd_vis
            }, null, 8, ["name"])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["password", "modelValue"]),
        vue.createCommentVNode(' <fui-input\n        placeholder="请输入密码"\n        v-model="form.password"\n        :isFillet="true"\n        type="password"\n        clearable\n      ></fui-input> '),
        vue.createElementVNode("view", { class: "spacing" }),
        vue.createCommentVNode(" 登录按钮 "),
        vue.createElementVNode(
          "button",
          {
            class: vue.normalizeClass(["login-button", { active: $setup.isPressed }]),
            onTouchstart: $setup.onButtonPress,
            onTouchend: $setup.onButtonRelease,
            onClick: $setup.submitLogin
          },
          " 登录 ",
          34
          /* CLASS, NEED_HYDRATION */
        ),
        vue.createElementVNode("view", { class: "spacing" }),
        vue.createCommentVNode(" 注册按钮 "),
        vue.createElementVNode("text", {
          class: "register-text",
          onClick: $setup.goRegister
        }, "注册")
      ]),
      vue.createCommentVNode(" 底部协议 "),
      vue.createElementVNode("view", { class: "agreement" }, [
        vue.createTextVNode(" 登录/注册表示您已同意 "),
        vue.createElementVNode("text", { class: "link" }, "《用户协议》"),
        vue.createTextVNode(" 和 "),
        vue.createElementVNode("text", { class: "link" }, "《隐私政策》")
      ])
    ]);
  }
  const PagesLoginLogin = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["render", _sfc_render$9], ["__scopeId", "data-v-461d1d79"], ["__file", "C:/Users/LIKEASHOT/Documents/HBuilderProjects/Squad/pages/Login/Login.vue"]]);
  const _sfc_main$9 = {
    name: "fui-checkbox",
    emits: ["change"],
    props: {
      //注意：返回值仍为string类型
      value: {
        type: [String, Number],
        default: ""
      },
      checked: {
        type: Boolean,
        default: false
      },
      disabled: {
        type: Boolean,
        default: false
      },
      //checkbox选中背景颜色
      color: {
        type: String,
        default: ""
      },
      //checkbox未选中时边框颜色
      borderColor: {
        type: String,
        default: "#ccc"
      },
      borderRadius: {
        type: String,
        default: "50%"
      },
      //是否只展示对号，无边框背景
      isCheckMark: {
        type: Boolean,
        default: false
      },
      //对号颜色
      checkMarkColor: {
        type: String,
        default: "#fff"
      },
      scaleRatio: {
        type: [Number, String],
        default: 1
      }
    },
    beforeUnmount() {
      this.unInstall();
    },
    created() {
      this.val = this.checked;
      this.group = this.getParent();
      if (this.group) {
        this.group.childrens.push(this);
        if (this.group.value && this.group.value.length > 0) {
          this.val = this.group.value.includes(this.value);
        }
        if (this.group.modelValue && this.group.modelValue.length > 0) {
          this.val = this.group.modelValue.includes(this.value);
        }
      }
      this.label = this.getParent("fui-label");
      if (this.label) {
        this.label.childrens.push(this);
      }
    },
    watch: {
      checked(newVal) {
        this.val = newVal;
      },
      val(newVal) {
        if (this.group) {
          this.group.changeValue(this.val, this);
        }
      }
    },
    computed: {
      getColor() {
        let color = this.color;
        return color;
      },
      getValue() {
        return String(this.value);
      }
    },
    data() {
      let isNvue = false;
      return {
        val: false,
        isNvue
      };
    },
    methods: {
      unInstall() {
        if (this.group) {
          this.group.childrens.forEach((item, index) => {
            if (item === this) {
              this.group.childrens.splice(index, 1);
            }
          });
        }
      },
      getBackgroundColor(val, isCheckMark) {
        let color = val ? this.getColor : "#fff";
        if (isCheckMark) {
          color = "transparent";
        }
        return color;
      },
      getBorderColor(val, isCheckMark) {
        let color = val ? this.getColor : this.borderColor;
        if (isCheckMark) {
          color = "transparent";
        }
        return color;
      },
      checkboxChange(e) {
        if (this.disabled)
          return;
        this.val = !this.val;
        this.$emit("change", {
          checked: this.val,
          value: this.value
        });
      },
      getParent(name = "fui-checkbox-group") {
        let parent = this.$parent;
        let parentName = parent.$options.name;
        while (parentName !== name) {
          parent = parent.$parent;
          if (!parent)
            return false;
          parentName = parent.$options.name;
        }
        return parent;
      },
      labelClick() {
        this.checkboxChange();
      }
    }
  };
  function _sfc_render$8(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: vue.normalizeClass(["fui-checkbox__input", { "fui-checkbox__disabled": $props.disabled, "fui-checkbox__color": !$options.getColor && $data.val && !$props.isCheckMark }]),
        style: vue.normalizeStyle({ backgroundColor: $options.getBackgroundColor($data.val, $props.isCheckMark), borderColor: $options.getBorderColor($data.val, $props.isCheckMark), zoom: $data.isNvue ? 1 : $props.scaleRatio, transform: `scale(${$data.isNvue ? $props.scaleRatio : 1})`, borderRadius: $props.borderRadius }),
        onClick: _cache[0] || (_cache[0] = vue.withModifiers((...args) => $options.checkboxChange && $options.checkboxChange(...args), ["stop"]))
      },
      [
        $data.val ? (vue.openBlock(), vue.createElementBlock(
          "view",
          {
            key: 0,
            class: "fui-check__mark",
            style: vue.normalizeStyle({ borderBottomColor: $props.checkMarkColor, borderRightColor: $props.checkMarkColor })
          },
          null,
          4
          /* STYLE */
        )) : vue.createCommentVNode("v-if", true),
        vue.createElementVNode("checkbox", {
          class: "fui-checkbox__hidden",
          style: { "opacity": "0", "position": "absolute" },
          color: $options.getColor,
          disabled: $props.disabled,
          value: $options.getValue,
          checked: $data.val
        }, null, 8, ["color", "disabled", "value", "checked"])
      ],
      6
      /* CLASS, STYLE */
    );
  }
  const __easycom_1 = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["render", _sfc_render$8], ["__scopeId", "data-v-bc643473"], ["__file", "C:/Users/LIKEASHOT/Documents/HBuilderProjects/Squad/node_modules/firstui-uni/firstui/fui-checkbox/fui-checkbox.vue"]]);
  const _sfc_main$8 = {
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
          const app = uni && uni.$fui && uni.$fui.fuiListCell;
          padding = app && app.padding;
          if (!padding || Array.isArray(padding) && padding.length === 0) {
            padding = ["32rpx", "32rpx"];
          }
        }
        return padding;
      },
      getArrowColor() {
        const app = uni && uni.$fui && uni.$fui.fuiListCell;
        return this.arrowColor || app && app.arrowColor || "#B2B2B2";
      },
      getBorderColor() {
        let color = this.borderColor;
        return color;
      },
      getBottomLeft() {
        const app = uni && uni.$fui && uni.$fui.fuiListCell;
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
  function _sfc_render$7(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: vue.normalizeClass(["fui-list__cell", { "fui-highlight": $props.highlight, "fui-list__cell-background": !$props.background }]),
        style: vue.normalizeStyle({ paddingTop: $options.getPadding[0] || 0, paddingRight: $options.getPadding[1] || 0, paddingBottom: $options.getPadding[2] || $options.getPadding[0] || 0, paddingLeft: $options.getPadding[3] || $options.getPadding[1] || 0, background: $props.background, marginTop: $props.marginTop + "rpx", marginBottom: $props.marginBottom + "rpx", borderRadius: $props.radius }),
        onClick: _cache[0] || (_cache[0] = (...args) => $options.handleClick && $options.handleClick(...args))
      },
      [
        $props.topBorder ? (vue.openBlock(), vue.createElementBlock(
          "view",
          {
            key: 0,
            style: vue.normalizeStyle({ background: $options.getBorderColor, left: $props.topLeft + "rpx", right: $props.topRight + "rpx" }),
            class: vue.normalizeClass(["fui-cell__border-top", { "fui-cell__border-color": !$options.getBorderColor }])
          },
          null,
          6
          /* CLASS, STYLE */
        )) : vue.createCommentVNode("v-if", true),
        vue.renderSlot(_ctx.$slots, "default", {}, void 0, true),
        $props.bottomBorder ? (vue.openBlock(), vue.createElementBlock(
          "view",
          {
            key: 1,
            style: vue.normalizeStyle({ background: $options.getBorderColor, left: $options.getBottomLeft + "rpx", right: $props.bottomRight + "rpx" }),
            class: vue.normalizeClass(["fui-cell__border-bottom", { "fui-cell__border-color": !$options.getBorderColor }])
          },
          null,
          6
          /* CLASS, STYLE */
        )) : vue.createCommentVNode("v-if", true),
        $props.arrow ? (vue.openBlock(), vue.createElementBlock(
          "view",
          {
            key: 2,
            class: "fui-cell__arrow",
            style: vue.normalizeStyle({ "border-color": $options.getArrowColor })
          },
          null,
          4
          /* STYLE */
        )) : vue.createCommentVNode("v-if", true)
      ],
      6
      /* CLASS, STYLE */
    );
  }
  const __easycom_2 = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["render", _sfc_render$7], ["__scopeId", "data-v-c16a41c6"], ["__file", "C:/Users/LIKEASHOT/Documents/HBuilderProjects/Squad/node_modules/firstui-uni/firstui/fui-list-cell/fui-list-cell.vue"]]);
  const _sfc_main$7 = {
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
  function _sfc_render$6(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: vue.normalizeClass(["fui-label__box", { "fui-label__full": $props.full, "fui-label__inline": $props.inline }]),
        style: vue.normalizeStyle({ paddingTop: $props.padding[0] || 0, paddingRight: $props.padding[1] || 0, paddingBottom: $props.padding[2] || $props.padding[0] || 0, paddingLeft: $props.padding[3] || $props.padding[1] || 0, marginTop: $props.margin[0] || 0, marginRight: $props.margin[1] || 0, marginBottom: $props.margin[2] || $props.margin[0] || 0, marginLeft: $props.margin[3] || $props.margin[1] || 0 }),
        onClick: _cache[0] || (_cache[0] = vue.withModifiers((...args) => $options.onClick && $options.onClick(...args), ["stop"]))
      },
      [
        vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
      ],
      6
      /* CLASS, STYLE */
    );
  }
  const __easycom_3 = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["render", _sfc_render$6], ["__scopeId", "data-v-186dfc0c"], ["__file", "C:/Users/LIKEASHOT/Documents/HBuilderProjects/Squad/node_modules/firstui-uni/firstui/fui-label/fui-label.vue"]]);
  const _sfc_main$6 = {
    name: "fui-checkbox-group",
    emits: ["change", "input", "update:modelValue"],
    props: {
      name: {
        type: String,
        default: ""
      },
      modelValue: {
        type: Array,
        default() {
          return [];
        }
      }
    },
    data() {
      return {
        vals: ""
      };
    },
    watch: {
      modelValue(vals) {
        this.modelChange(vals);
      }
    },
    created() {
      this.childrens = [];
    },
    methods: {
      checkboxChange(e) {
        this.$emit("change", e);
        this.$emit("input", e.detail.value);
        this.$emit("update:modelValue", e.detail.value);
      },
      changeValue(checked, target) {
        const vals = [];
        this.childrens.forEach((item) => {
          if (item.val) {
            vals.push(item.value);
          }
        });
        this.vals = vals;
        let e = {
          detail: {
            value: vals
          }
        };
        this.checkboxChange(e);
      },
      modelChange(vals) {
        this.childrens.forEach((item) => {
          if (vals.includes(item.value)) {
            item.val = true;
          } else {
            item.val = false;
          }
        });
      }
    }
  };
  function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("checkbox-group", { name: $props.name }, [
      vue.renderSlot(_ctx.$slots, "default")
    ], 8, ["name"]);
  }
  const __easycom_4 = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$5], ["__file", "C:/Users/LIKEASHOT/Documents/HBuilderProjects/Squad/node_modules/firstui-uni/firstui/fui-checkbox-group/fui-checkbox-group.vue"]]);
  const _sfc_main$5 = {
    data() {
      return {
        title: "checkbox 复选框",
        items: [
          {
            value: "USA",
            name: "美国"
          },
          {
            value: "CHN",
            name: "中国",
            checked: "true"
          },
          {
            value: "BRA",
            name: "巴西"
          },
          {
            value: "JPN",
            name: "日本"
          },
          {
            value: "ENG",
            name: "英国"
          },
          {
            value: "FRA",
            name: "法国"
          }
        ],
        vals: ["1"],
        checkboxItems: [
          {
            name: "篮球",
            value: "1",
            checked: true
          },
          {
            name: "羽毛球",
            value: "2",
            checked: false
          },
          {
            name: "乒乓球",
            value: "3",
            checked: false
          }
        ]
      };
    },
    methods: {
      checkboxChange: function(e) {
        var items = this.items, values = e.detail.value;
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
        formatAppLog("log", "at pages/index/index.vue:134", "change:" + JSON.stringify(e.detail.value));
      }
    }
  };
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_fui_checkbox = resolveEasycom(vue.resolveDynamicComponent("fui-checkbox"), __easycom_1);
    const _component_fui_list_cell = resolveEasycom(vue.resolveDynamicComponent("fui-list-cell"), __easycom_2);
    const _component_fui_label = resolveEasycom(vue.resolveDynamicComponent("fui-label"), __easycom_3);
    const _component_fui_checkbox_group = resolveEasycom(vue.resolveDynamicComponent("fui-checkbox-group"), __easycom_4);
    return vue.openBlock(), vue.createElementBlock("view", null, [
      vue.createElementVNode("view", { class: "fui-section__title" }, "修改圆角值"),
      vue.createVNode(_component_fui_checkbox_group, null, {
        default: vue.withCtx(() => [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.checkboxItems, (item, index) => {
              return vue.openBlock(), vue.createBlock(
                _component_fui_label,
                { key: index },
                {
                  default: vue.withCtx(() => [
                    vue.createVNode(
                      _component_fui_list_cell,
                      null,
                      {
                        default: vue.withCtx(() => [
                          vue.createElementVNode("view", { class: "fui-align__center" }, [
                            vue.createVNode(_component_fui_checkbox, {
                              checked: item.checked,
                              value: item.value,
                              color: "#777CFF",
                              borderColor: "#B2B2B2",
                              borderRadius: "8rpx"
                            }, null, 8, ["checked", "value"]),
                            vue.createElementVNode(
                              "text",
                              { class: "fui-text" },
                              vue.toDisplayString(item.name),
                              1
                              /* TEXT */
                            )
                          ])
                        ]),
                        _: 2
                        /* DYNAMIC */
                      },
                      1024
                      /* DYNAMIC_SLOTS */
                    )
                  ]),
                  _: 2
                  /* DYNAMIC */
                },
                1024
                /* DYNAMIC_SLOTS */
              );
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        _: 1
        /* STABLE */
      }),
      vue.createElementVNode("view", { class: "uni-padding-wrap uni-common-mt" }, [
        vue.createElementVNode("view", { class: "uni-title uni-common-mt" }, "默认样式"),
        vue.createElementVNode("view", null, [
          vue.createElementVNode("checkbox-group", null, [
            vue.createElementVNode("label", null, [
              vue.createElementVNode("checkbox", {
                value: "cb",
                checked: "true"
              }),
              vue.createTextVNode("选中 ")
            ]),
            vue.createElementVNode("label", null, [
              vue.createElementVNode("checkbox", { value: "cb" }),
              vue.createTextVNode("未选中 ")
            ])
          ])
        ]),
        vue.createElementVNode("view", { class: "uni-title uni-common-mt" }, "不同颜色和尺寸的checkbox"),
        vue.createElementVNode("view", null, [
          vue.createElementVNode("checkbox-group", null, [
            vue.createElementVNode("label", null, [
              vue.createElementVNode("checkbox", {
                value: "cb",
                checked: "true",
                color: "#FFCC33",
                style: { "transform": "scale(0.7)" }
              }),
              vue.createTextVNode("选中 ")
            ]),
            vue.createElementVNode("label", null, [
              vue.createElementVNode("checkbox", {
                value: "cb",
                color: "#FFCC33",
                style: { "transform": "scale(0.7)" }
              }),
              vue.createTextVNode("未选中 ")
            ])
          ])
        ])
      ]),
      vue.createElementVNode("view", { class: "uni-padding-wrap" }, [
        vue.createElementVNode("view", { class: "uni-title uni-common-mt" }, [
          vue.createTextVNode(" 推荐展示样式 "),
          vue.createElementVNode("text", null, "\\n使用 uni-list 布局")
        ])
      ]),
      vue.createElementVNode("view", { class: "uni-list" }, [
        vue.createElementVNode(
          "checkbox-group",
          {
            onChange: _cache[0] || (_cache[0] = (...args) => $options.checkboxChange && $options.checkboxChange(...args))
          },
          [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($data.items, (item) => {
                return vue.openBlock(), vue.createElementBlock("label", {
                  class: "uni-list-cell uni-list-cell-pd",
                  key: item.value
                }, [
                  vue.createElementVNode("view", null, [
                    vue.createElementVNode("checkbox", {
                      value: item.value,
                      checked: item.checked
                    }, null, 8, ["value", "checked"])
                  ]),
                  vue.createElementVNode(
                    "view",
                    null,
                    vue.toDisplayString(item.name),
                    1
                    /* TEXT */
                  )
                ]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ],
          32
          /* NEED_HYDRATION */
        )
      ])
    ]);
  }
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$4], ["__file", "C:/Users/LIKEASHOT/Documents/HBuilderProjects/Squad/pages/index/index.vue"]]);
  const logo$1 = "/static/Squad1.png";
  const _sfc_main$4 = {
    __name: "Register",
    setup(__props, { expose: __expose }) {
      __expose();
      const password = vue.ref(true);
      const password_confirm = vue.ref(true);
      const inputpwd = (e) => {
        formatAppLog("log", "at pages/Register/Register.vue:92", e);
      };
      const changepwd_vis = () => {
        password.value = !password.value;
      };
      const inputpwd_confirm = (e) => {
        formatAppLog("log", "at pages/Register/Register.vue:98", e);
      };
      const changepwd_vis_confirm = () => {
        password_confirm.value = !password_confirm.value;
      };
      const form = vue.ref({
        username: "",
        password: "",
        confirmPassword: ""
      });
      const submitRegister = () => {
        if (!form.value.username || !form.value.password || !form.value.confirmPassword) {
          uni.showToast({
            title: "请填写完整信息",
            icon: "none"
          });
          return;
        }
        if (form.value.password !== form.value.confirmPassword) {
          uni.showToast({
            title: "两次密码输入不一致",
            icon: "none"
          });
          return;
        }
        formatAppLog("log", "at pages/Register/Register.vue:130", "提交注册表单", form.value);
        uni.request({
          url: "http://192.168.56.1:3000/register",
          method: "POST",
          data: {
            username: form.value.username,
            password: form.value.password,
            confirmPassword: form.value.confirmPassword
          },
          success: (res) => {
            formatAppLog("log", "at pages/Register/Register.vue:141", "注册请求返回：", res);
            if (res.statusCode === 201 && res.data.success) {
              uni.showToast({
                title: "注册成功",
                icon: "success"
              });
              uni.navigateTo({ url: "/pages/FirstLogin/FirstLogin" }).then(() => {
                formatAppLog("log", "at pages/Register/Register.vue:149", "跳转成功");
              }).catch((err) => {
                formatAppLog("error", "at pages/Register/Register.vue:152", "跳转失败：", err);
              });
            } else {
              uni.showToast({
                title: res.data.message || "注册失败",
                icon: "none"
              });
            }
          },
          fail: (err) => {
            uni.showToast({
              title: "网络请求失败",
              icon: "none"
            });
            formatAppLog("error", "at pages/Register/Register.vue:166", "注册请求失败：", err);
          }
        });
      };
      const __returned__ = { password, password_confirm, inputpwd, changepwd_vis, inputpwd_confirm, changepwd_vis_confirm, logo: logo$1, form, submitRegister, ref: vue.ref };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_fui_input = resolveEasycom(vue.resolveDynamicComponent("fui-input"), __easycom_0$2);
    const _component_fui_icon = resolveEasycom(vue.resolveDynamicComponent("fui-icon"), __easycom_1$1);
    return vue.openBlock(), vue.createElementBlock("view", { class: "register-container" }, [
      vue.createCommentVNode(" Logo 和标题 "),
      vue.createElementVNode("view", { class: "logo-container" }, [
        vue.createElementVNode("image", {
          src: $setup.logo,
          class: "logo"
        }),
        vue.createElementVNode("text", { class: "title" }, "注册")
      ]),
      vue.createCommentVNode(" 注册表单 "),
      vue.createElementVNode("view", { class: "form-container" }, [
        vue.createVNode(_component_fui_input, {
          placeholder: "请输入账号",
          borderTop: "",
          padding: ["20rpx", "32rpx"],
          modelValue: $setup.form.username,
          "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.form.username = $event),
          isFillet: true,
          clearable: ""
        }, null, 8, ["modelValue"]),
        vue.createElementVNode("view", { class: "spacing" }),
        vue.createCommentVNode(" 输入密码 "),
        vue.createCommentVNode(' <uni-easyinput\n        v-model="form.password"\n        type="password"\n        placeholder="请输入密码"\n        clearable\n        class="input-field"\n      ></uni-easyinput> '),
        vue.createVNode(_component_fui_input, {
          borderTop: "",
          padding: ["20rpx", "32rpx"],
          placeholder: "请输入密码",
          password: $setup.password,
          clearable: "",
          modelValue: $setup.form.password,
          "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.form.password = $event),
          isFillet: true,
          onInput: $setup.inputpwd
        }, {
          default: vue.withCtx(() => [
            vue.createVNode(_component_fui_icon, {
              name: $setup.password ? "invisible" : "visible",
              color: "#B2B2B2",
              size: 50,
              onClick: $setup.changepwd_vis
            }, null, 8, ["name"])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["password", "modelValue"]),
        vue.createElementVNode("view", { class: "spacing" }),
        vue.createCommentVNode(" 再次输入密码 "),
        vue.createCommentVNode(' <uni-easyinput\n        v-model="form.confirmPassword"\n        type="password"\n        placeholder="请再次输入密码"\n        clearable\n        class="input-field"\n      ></uni-easyinput> '),
        vue.createVNode(_component_fui_input, {
          borderTop: "",
          padding: ["20rpx", "32rpx"],
          placeholder: "请再次输入密码",
          password: $setup.password_confirm,
          clearable: "",
          modelValue: $setup.form.confirmPassword,
          "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $setup.form.confirmPassword = $event),
          isFillet: true,
          onInput: $setup.inputpwd_confirm
        }, {
          default: vue.withCtx(() => [
            vue.createVNode(_component_fui_icon, {
              name: $setup.password_confirm ? "invisible" : "visible",
              color: "#B2B2B2",
              size: 50,
              onClick: $setup.changepwd_vis_confirm
            }, null, 8, ["name"])
          ]),
          _: 1
          /* STABLE */
        }, 8, ["password", "modelValue"]),
        vue.createElementVNode("view", { class: "spacing" }),
        vue.createCommentVNode(" 注册按钮 "),
        vue.createElementVNode("button", {
          class: "register-button",
          onClick: $setup.submitRegister
        }, "注册")
      ]),
      vue.createCommentVNode(" 底部协议 "),
      vue.createElementVNode("view", { class: "agreement" }, [
        vue.createTextVNode(" 登录/注册表示您已同意 "),
        vue.createElementVNode("text", { class: "link" }, "《用户协议》"),
        vue.createTextVNode(" 和 "),
        vue.createElementVNode("text", { class: "link" }, "《隐私政策》")
      ])
    ]);
  }
  const PagesRegisterRegister = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$3], ["__scopeId", "data-v-6b0433d4"], ["__file", "C:/Users/LIKEASHOT/Documents/HBuilderProjects/Squad/pages/Register/Register.vue"]]);
  const fontData = [
    {
      "font_class": "arrow-down",
      "unicode": ""
    },
    {
      "font_class": "arrow-left",
      "unicode": ""
    },
    {
      "font_class": "arrow-right",
      "unicode": ""
    },
    {
      "font_class": "arrow-up",
      "unicode": ""
    },
    {
      "font_class": "auth",
      "unicode": ""
    },
    {
      "font_class": "auth-filled",
      "unicode": ""
    },
    {
      "font_class": "back",
      "unicode": ""
    },
    {
      "font_class": "bars",
      "unicode": ""
    },
    {
      "font_class": "calendar",
      "unicode": ""
    },
    {
      "font_class": "calendar-filled",
      "unicode": ""
    },
    {
      "font_class": "camera",
      "unicode": ""
    },
    {
      "font_class": "camera-filled",
      "unicode": ""
    },
    {
      "font_class": "cart",
      "unicode": ""
    },
    {
      "font_class": "cart-filled",
      "unicode": ""
    },
    {
      "font_class": "chat",
      "unicode": ""
    },
    {
      "font_class": "chat-filled",
      "unicode": ""
    },
    {
      "font_class": "chatboxes",
      "unicode": ""
    },
    {
      "font_class": "chatboxes-filled",
      "unicode": ""
    },
    {
      "font_class": "chatbubble",
      "unicode": ""
    },
    {
      "font_class": "chatbubble-filled",
      "unicode": ""
    },
    {
      "font_class": "checkbox",
      "unicode": ""
    },
    {
      "font_class": "checkbox-filled",
      "unicode": ""
    },
    {
      "font_class": "checkmarkempty",
      "unicode": ""
    },
    {
      "font_class": "circle",
      "unicode": ""
    },
    {
      "font_class": "circle-filled",
      "unicode": ""
    },
    {
      "font_class": "clear",
      "unicode": ""
    },
    {
      "font_class": "close",
      "unicode": ""
    },
    {
      "font_class": "closeempty",
      "unicode": ""
    },
    {
      "font_class": "cloud-download",
      "unicode": ""
    },
    {
      "font_class": "cloud-download-filled",
      "unicode": ""
    },
    {
      "font_class": "cloud-upload",
      "unicode": ""
    },
    {
      "font_class": "cloud-upload-filled",
      "unicode": ""
    },
    {
      "font_class": "color",
      "unicode": ""
    },
    {
      "font_class": "color-filled",
      "unicode": ""
    },
    {
      "font_class": "compose",
      "unicode": ""
    },
    {
      "font_class": "contact",
      "unicode": ""
    },
    {
      "font_class": "contact-filled",
      "unicode": ""
    },
    {
      "font_class": "down",
      "unicode": ""
    },
    {
      "font_class": "bottom",
      "unicode": ""
    },
    {
      "font_class": "download",
      "unicode": ""
    },
    {
      "font_class": "download-filled",
      "unicode": ""
    },
    {
      "font_class": "email",
      "unicode": ""
    },
    {
      "font_class": "email-filled",
      "unicode": ""
    },
    {
      "font_class": "eye",
      "unicode": ""
    },
    {
      "font_class": "eye-filled",
      "unicode": ""
    },
    {
      "font_class": "eye-slash",
      "unicode": ""
    },
    {
      "font_class": "eye-slash-filled",
      "unicode": ""
    },
    {
      "font_class": "fire",
      "unicode": ""
    },
    {
      "font_class": "fire-filled",
      "unicode": ""
    },
    {
      "font_class": "flag",
      "unicode": ""
    },
    {
      "font_class": "flag-filled",
      "unicode": ""
    },
    {
      "font_class": "folder-add",
      "unicode": ""
    },
    {
      "font_class": "folder-add-filled",
      "unicode": ""
    },
    {
      "font_class": "font",
      "unicode": ""
    },
    {
      "font_class": "forward",
      "unicode": ""
    },
    {
      "font_class": "gear",
      "unicode": ""
    },
    {
      "font_class": "gear-filled",
      "unicode": ""
    },
    {
      "font_class": "gift",
      "unicode": ""
    },
    {
      "font_class": "gift-filled",
      "unicode": ""
    },
    {
      "font_class": "hand-down",
      "unicode": ""
    },
    {
      "font_class": "hand-down-filled",
      "unicode": ""
    },
    {
      "font_class": "hand-up",
      "unicode": ""
    },
    {
      "font_class": "hand-up-filled",
      "unicode": ""
    },
    {
      "font_class": "headphones",
      "unicode": ""
    },
    {
      "font_class": "heart",
      "unicode": ""
    },
    {
      "font_class": "heart-filled",
      "unicode": ""
    },
    {
      "font_class": "help",
      "unicode": ""
    },
    {
      "font_class": "help-filled",
      "unicode": ""
    },
    {
      "font_class": "home",
      "unicode": ""
    },
    {
      "font_class": "home-filled",
      "unicode": ""
    },
    {
      "font_class": "image",
      "unicode": ""
    },
    {
      "font_class": "image-filled",
      "unicode": ""
    },
    {
      "font_class": "images",
      "unicode": ""
    },
    {
      "font_class": "images-filled",
      "unicode": ""
    },
    {
      "font_class": "info",
      "unicode": ""
    },
    {
      "font_class": "info-filled",
      "unicode": ""
    },
    {
      "font_class": "left",
      "unicode": ""
    },
    {
      "font_class": "link",
      "unicode": ""
    },
    {
      "font_class": "list",
      "unicode": ""
    },
    {
      "font_class": "location",
      "unicode": ""
    },
    {
      "font_class": "location-filled",
      "unicode": ""
    },
    {
      "font_class": "locked",
      "unicode": ""
    },
    {
      "font_class": "locked-filled",
      "unicode": ""
    },
    {
      "font_class": "loop",
      "unicode": ""
    },
    {
      "font_class": "mail-open",
      "unicode": ""
    },
    {
      "font_class": "mail-open-filled",
      "unicode": ""
    },
    {
      "font_class": "map",
      "unicode": ""
    },
    {
      "font_class": "map-filled",
      "unicode": ""
    },
    {
      "font_class": "map-pin",
      "unicode": ""
    },
    {
      "font_class": "map-pin-ellipse",
      "unicode": ""
    },
    {
      "font_class": "medal",
      "unicode": ""
    },
    {
      "font_class": "medal-filled",
      "unicode": ""
    },
    {
      "font_class": "mic",
      "unicode": ""
    },
    {
      "font_class": "mic-filled",
      "unicode": ""
    },
    {
      "font_class": "micoff",
      "unicode": ""
    },
    {
      "font_class": "micoff-filled",
      "unicode": ""
    },
    {
      "font_class": "minus",
      "unicode": ""
    },
    {
      "font_class": "minus-filled",
      "unicode": ""
    },
    {
      "font_class": "more",
      "unicode": ""
    },
    {
      "font_class": "more-filled",
      "unicode": ""
    },
    {
      "font_class": "navigate",
      "unicode": ""
    },
    {
      "font_class": "navigate-filled",
      "unicode": ""
    },
    {
      "font_class": "notification",
      "unicode": ""
    },
    {
      "font_class": "notification-filled",
      "unicode": ""
    },
    {
      "font_class": "paperclip",
      "unicode": ""
    },
    {
      "font_class": "paperplane",
      "unicode": ""
    },
    {
      "font_class": "paperplane-filled",
      "unicode": ""
    },
    {
      "font_class": "person",
      "unicode": ""
    },
    {
      "font_class": "person-filled",
      "unicode": ""
    },
    {
      "font_class": "personadd",
      "unicode": ""
    },
    {
      "font_class": "personadd-filled",
      "unicode": ""
    },
    {
      "font_class": "personadd-filled-copy",
      "unicode": ""
    },
    {
      "font_class": "phone",
      "unicode": ""
    },
    {
      "font_class": "phone-filled",
      "unicode": ""
    },
    {
      "font_class": "plus",
      "unicode": ""
    },
    {
      "font_class": "plus-filled",
      "unicode": ""
    },
    {
      "font_class": "plusempty",
      "unicode": ""
    },
    {
      "font_class": "pulldown",
      "unicode": ""
    },
    {
      "font_class": "pyq",
      "unicode": ""
    },
    {
      "font_class": "qq",
      "unicode": ""
    },
    {
      "font_class": "redo",
      "unicode": ""
    },
    {
      "font_class": "redo-filled",
      "unicode": ""
    },
    {
      "font_class": "refresh",
      "unicode": ""
    },
    {
      "font_class": "refresh-filled",
      "unicode": ""
    },
    {
      "font_class": "refreshempty",
      "unicode": ""
    },
    {
      "font_class": "reload",
      "unicode": ""
    },
    {
      "font_class": "right",
      "unicode": ""
    },
    {
      "font_class": "scan",
      "unicode": ""
    },
    {
      "font_class": "search",
      "unicode": ""
    },
    {
      "font_class": "settings",
      "unicode": ""
    },
    {
      "font_class": "settings-filled",
      "unicode": ""
    },
    {
      "font_class": "shop",
      "unicode": ""
    },
    {
      "font_class": "shop-filled",
      "unicode": ""
    },
    {
      "font_class": "smallcircle",
      "unicode": ""
    },
    {
      "font_class": "smallcircle-filled",
      "unicode": ""
    },
    {
      "font_class": "sound",
      "unicode": ""
    },
    {
      "font_class": "sound-filled",
      "unicode": ""
    },
    {
      "font_class": "spinner-cycle",
      "unicode": ""
    },
    {
      "font_class": "staff",
      "unicode": ""
    },
    {
      "font_class": "staff-filled",
      "unicode": ""
    },
    {
      "font_class": "star",
      "unicode": ""
    },
    {
      "font_class": "star-filled",
      "unicode": ""
    },
    {
      "font_class": "starhalf",
      "unicode": ""
    },
    {
      "font_class": "trash",
      "unicode": ""
    },
    {
      "font_class": "trash-filled",
      "unicode": ""
    },
    {
      "font_class": "tune",
      "unicode": ""
    },
    {
      "font_class": "tune-filled",
      "unicode": ""
    },
    {
      "font_class": "undo",
      "unicode": ""
    },
    {
      "font_class": "undo-filled",
      "unicode": ""
    },
    {
      "font_class": "up",
      "unicode": ""
    },
    {
      "font_class": "top",
      "unicode": ""
    },
    {
      "font_class": "upload",
      "unicode": ""
    },
    {
      "font_class": "upload-filled",
      "unicode": ""
    },
    {
      "font_class": "videocam",
      "unicode": ""
    },
    {
      "font_class": "videocam-filled",
      "unicode": ""
    },
    {
      "font_class": "vip",
      "unicode": ""
    },
    {
      "font_class": "vip-filled",
      "unicode": ""
    },
    {
      "font_class": "wallet",
      "unicode": ""
    },
    {
      "font_class": "wallet-filled",
      "unicode": ""
    },
    {
      "font_class": "weibo",
      "unicode": ""
    },
    {
      "font_class": "weixin",
      "unicode": ""
    }
  ];
  const getVal = (val) => {
    const reg = /^[0-9]*$/g;
    return typeof val === "number" || reg.test(val) ? val + "px" : val;
  };
  const _sfc_main$3 = {
    name: "UniIcons",
    emits: ["click"],
    props: {
      type: {
        type: String,
        default: ""
      },
      color: {
        type: String,
        default: "#333333"
      },
      size: {
        type: [Number, String],
        default: 16
      },
      customPrefix: {
        type: String,
        default: ""
      },
      fontFamily: {
        type: String,
        default: ""
      }
    },
    data() {
      return {
        icons: fontData
      };
    },
    computed: {
      unicode() {
        let code = this.icons.find((v) => v.font_class === this.type);
        if (code) {
          return code.unicode;
        }
        return "";
      },
      iconSize() {
        return getVal(this.size);
      },
      styleObj() {
        if (this.fontFamily !== "") {
          return `color: ${this.color}; font-size: ${this.iconSize}; font-family: ${this.fontFamily};`;
        }
        return `color: ${this.color}; font-size: ${this.iconSize};`;
      }
    },
    methods: {
      _onClick() {
        this.$emit("click");
      }
    }
  };
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "text",
      {
        style: vue.normalizeStyle($options.styleObj),
        class: vue.normalizeClass(["uni-icons", ["uniui-" + $props.type, $props.customPrefix, $props.customPrefix ? $props.type : ""]]),
        onClick: _cache[0] || (_cache[0] = (...args) => $options._onClick && $options._onClick(...args))
      },
      [
        vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
      ],
      6
      /* CLASS, STYLE */
    );
  }
  const __easycom_0$1 = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$2], ["__scopeId", "data-v-d31e1c47"], ["__file", "C:/Users/LIKEASHOT/Documents/HBuilderProjects/Squad/uni_modules/uni-icons/components/uni-icons/uni-icons.vue"]]);
  function obj2strClass(obj) {
    let classess = "";
    for (let key in obj) {
      const val = obj[key];
      if (val) {
        classess += `${key} `;
      }
    }
    return classess;
  }
  function obj2strStyle(obj) {
    let style = "";
    for (let key in obj) {
      const val = obj[key];
      style += `${key}:${val};`;
    }
    return style;
  }
  const _sfc_main$2 = {
    name: "uni-easyinput",
    emits: [
      "click",
      "iconClick",
      "update:modelValue",
      "input",
      "focus",
      "blur",
      "confirm",
      "clear",
      "eyes",
      "change",
      "keyboardheightchange"
    ],
    model: {
      prop: "modelValue",
      event: "update:modelValue"
    },
    options: {
      virtualHost: true
    },
    inject: {
      form: {
        from: "uniForm",
        default: null
      },
      formItem: {
        from: "uniFormItem",
        default: null
      }
    },
    props: {
      name: String,
      value: [Number, String],
      modelValue: [Number, String],
      type: {
        type: String,
        default: "text"
      },
      clearable: {
        type: Boolean,
        default: true
      },
      autoHeight: {
        type: Boolean,
        default: false
      },
      placeholder: {
        type: String,
        default: " "
      },
      placeholderStyle: String,
      focus: {
        type: Boolean,
        default: false
      },
      disabled: {
        type: Boolean,
        default: false
      },
      maxlength: {
        type: [Number, String],
        default: 140
      },
      confirmType: {
        type: String,
        default: "done"
      },
      clearSize: {
        type: [Number, String],
        default: 24
      },
      inputBorder: {
        type: Boolean,
        default: true
      },
      prefixIcon: {
        type: String,
        default: ""
      },
      suffixIcon: {
        type: String,
        default: ""
      },
      trim: {
        type: [Boolean, String],
        default: false
      },
      cursorSpacing: {
        type: Number,
        default: 0
      },
      passwordIcon: {
        type: Boolean,
        default: true
      },
      adjustPosition: {
        type: Boolean,
        default: true
      },
      primaryColor: {
        type: String,
        default: "#2979ff"
      },
      styles: {
        type: Object,
        default() {
          return {
            color: "#333",
            backgroundColor: "#fff",
            disableColor: "#F7F6F6",
            borderColor: "#e5e5e5"
          };
        }
      },
      errorMessage: {
        type: [String, Boolean],
        default: ""
      }
    },
    data() {
      return {
        focused: false,
        val: "",
        showMsg: "",
        border: false,
        isFirstBorder: false,
        showClearIcon: false,
        showPassword: false,
        focusShow: false,
        localMsg: "",
        isEnter: false
        // 用于判断当前是否是使用回车操作
      };
    },
    computed: {
      // 输入框内是否有值
      isVal() {
        const val = this.val;
        if (val || val === 0) {
          return true;
        }
        return false;
      },
      msg() {
        return this.localMsg || this.errorMessage;
      },
      // 因为uniapp的input组件的maxlength组件必须要数值，这里转为数值，用户可以传入字符串数值
      inputMaxlength() {
        return Number(this.maxlength);
      },
      // 处理外层样式的style
      boxStyle() {
        return `color:${this.inputBorder && this.msg ? "#e43d33" : this.styles.color};`;
      },
      // input 内容的类和样式处理
      inputContentClass() {
        return obj2strClass({
          "is-input-border": this.inputBorder,
          "is-input-error-border": this.inputBorder && this.msg,
          "is-textarea": this.type === "textarea",
          "is-disabled": this.disabled,
          "is-focused": this.focusShow
        });
      },
      inputContentStyle() {
        const focusColor = this.focusShow ? this.primaryColor : this.styles.borderColor;
        const borderColor = this.inputBorder && this.msg ? "#dd524d" : focusColor;
        return obj2strStyle({
          "border-color": borderColor || "#e5e5e5",
          "background-color": this.disabled ? this.styles.disableColor : this.styles.backgroundColor
        });
      },
      // input右侧样式
      inputStyle() {
        const paddingRight = this.type === "password" || this.clearable || this.prefixIcon ? "" : "10px";
        return obj2strStyle({
          "padding-right": paddingRight,
          "padding-left": this.prefixIcon ? "" : "10px"
        });
      }
    },
    watch: {
      value(newVal) {
        this.val = newVal;
      },
      modelValue(newVal) {
        this.val = newVal;
      },
      focus(newVal) {
        this.$nextTick(() => {
          this.focused = this.focus;
          this.focusShow = this.focus;
        });
      }
    },
    created() {
      this.init();
      if (this.form && this.formItem) {
        this.$watch("formItem.errMsg", (newVal) => {
          this.localMsg = newVal;
        });
      }
    },
    mounted() {
      this.$nextTick(() => {
        this.focused = this.focus;
        this.focusShow = this.focus;
      });
    },
    methods: {
      /**
       * 初始化变量值
       */
      init() {
        if (this.value || this.value === 0) {
          this.val = this.value;
        } else if (this.modelValue || this.modelValue === 0 || this.modelValue === "") {
          this.val = this.modelValue;
        } else {
          this.val = null;
        }
      },
      /**
       * 点击图标时触发
       * @param {Object} type
       */
      onClickIcon(type) {
        this.$emit("iconClick", type);
      },
      /**
       * 显示隐藏内容，密码框时生效
       */
      onEyes() {
        this.showPassword = !this.showPassword;
        this.$emit("eyes", this.showPassword);
      },
      /**
       * 输入时触发
       * @param {Object} event
       */
      onInput(event) {
        let value = event.detail.value;
        if (this.trim) {
          if (typeof this.trim === "boolean" && this.trim) {
            value = this.trimStr(value);
          }
          if (typeof this.trim === "string") {
            value = this.trimStr(value, this.trim);
          }
        }
        if (this.errMsg)
          this.errMsg = "";
        this.val = value;
        this.$emit("input", value);
        this.$emit("update:modelValue", value);
      },
      /**
       * 外部调用方法
       * 获取焦点时触发
       * @param {Object} event
       */
      onFocus() {
        this.$nextTick(() => {
          this.focused = true;
        });
        this.$emit("focus", null);
      },
      _Focus(event) {
        this.focusShow = true;
        this.$emit("focus", event);
      },
      /**
       * 外部调用方法
       * 失去焦点时触发
       * @param {Object} event
       */
      onBlur() {
        this.focused = false;
        this.$emit("blur", null);
      },
      _Blur(event) {
        event.detail.value;
        this.focusShow = false;
        this.$emit("blur", event);
        if (this.isEnter === false) {
          this.$emit("change", this.val);
        }
        if (this.form && this.formItem) {
          const { validateTrigger } = this.form;
          if (validateTrigger === "blur") {
            this.formItem.onFieldChange();
          }
        }
      },
      /**
       * 按下键盘的发送键
       * @param {Object} e
       */
      onConfirm(e) {
        this.$emit("confirm", this.val);
        this.isEnter = true;
        this.$emit("change", this.val);
        this.$nextTick(() => {
          this.isEnter = false;
        });
      },
      /**
       * 清理内容
       * @param {Object} event
       */
      onClear(event) {
        this.val = "";
        this.$emit("input", "");
        this.$emit("update:modelValue", "");
        this.$emit("clear");
      },
      /**
       * 键盘高度发生变化的时候触发此事件
       * 兼容性：微信小程序2.7.0+、App 3.1.0+
       * @param {Object} event
       */
      onkeyboardheightchange(event) {
        this.$emit("keyboardheightchange", event);
      },
      /**
       * 去除空格
       */
      trimStr(str, pos = "both") {
        if (pos === "both") {
          return str.trim();
        } else if (pos === "left") {
          return str.trimLeft();
        } else if (pos === "right") {
          return str.trimRight();
        } else if (pos === "start") {
          return str.trimStart();
        } else if (pos === "end") {
          return str.trimEnd();
        } else if (pos === "all") {
          return str.replace(/\s+/g, "");
        } else if (pos === "none") {
          return str;
        }
        return str;
      }
    }
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$1);
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: vue.normalizeClass(["uni-easyinput", { "uni-easyinput-error": $options.msg }]),
        style: vue.normalizeStyle($options.boxStyle)
      },
      [
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["uni-easyinput__content", $options.inputContentClass]),
            style: vue.normalizeStyle($options.inputContentStyle)
          },
          [
            $props.prefixIcon ? (vue.openBlock(), vue.createBlock(_component_uni_icons, {
              key: 0,
              class: "content-clear-icon",
              type: $props.prefixIcon,
              color: "#c0c4cc",
              onClick: _cache[0] || (_cache[0] = ($event) => $options.onClickIcon("prefix")),
              size: "22"
            }, null, 8, ["type"])) : vue.createCommentVNode("v-if", true),
            vue.renderSlot(_ctx.$slots, "left", {}, void 0, true),
            $props.type === "textarea" ? (vue.openBlock(), vue.createElementBlock("textarea", {
              key: 1,
              class: vue.normalizeClass(["uni-easyinput__content-textarea", { "input-padding": $props.inputBorder }]),
              name: $props.name,
              value: $data.val,
              placeholder: $props.placeholder,
              placeholderStyle: $props.placeholderStyle,
              disabled: $props.disabled,
              "placeholder-class": "uni-easyinput__placeholder-class",
              maxlength: $options.inputMaxlength,
              focus: $data.focused,
              autoHeight: $props.autoHeight,
              "cursor-spacing": $props.cursorSpacing,
              "adjust-position": $props.adjustPosition,
              onInput: _cache[1] || (_cache[1] = (...args) => $options.onInput && $options.onInput(...args)),
              onBlur: _cache[2] || (_cache[2] = (...args) => $options._Blur && $options._Blur(...args)),
              onFocus: _cache[3] || (_cache[3] = (...args) => $options._Focus && $options._Focus(...args)),
              onConfirm: _cache[4] || (_cache[4] = (...args) => $options.onConfirm && $options.onConfirm(...args)),
              onKeyboardheightchange: _cache[5] || (_cache[5] = (...args) => $options.onkeyboardheightchange && $options.onkeyboardheightchange(...args))
            }, null, 42, ["name", "value", "placeholder", "placeholderStyle", "disabled", "maxlength", "focus", "autoHeight", "cursor-spacing", "adjust-position"])) : (vue.openBlock(), vue.createElementBlock("input", {
              key: 2,
              type: $props.type === "password" ? "text" : $props.type,
              class: "uni-easyinput__content-input",
              style: vue.normalizeStyle($options.inputStyle),
              name: $props.name,
              value: $data.val,
              password: !$data.showPassword && $props.type === "password",
              placeholder: $props.placeholder,
              placeholderStyle: $props.placeholderStyle,
              "placeholder-class": "uni-easyinput__placeholder-class",
              disabled: $props.disabled,
              maxlength: $options.inputMaxlength,
              focus: $data.focused,
              confirmType: $props.confirmType,
              "cursor-spacing": $props.cursorSpacing,
              "adjust-position": $props.adjustPosition,
              onFocus: _cache[6] || (_cache[6] = (...args) => $options._Focus && $options._Focus(...args)),
              onBlur: _cache[7] || (_cache[7] = (...args) => $options._Blur && $options._Blur(...args)),
              onInput: _cache[8] || (_cache[8] = (...args) => $options.onInput && $options.onInput(...args)),
              onConfirm: _cache[9] || (_cache[9] = (...args) => $options.onConfirm && $options.onConfirm(...args)),
              onKeyboardheightchange: _cache[10] || (_cache[10] = (...args) => $options.onkeyboardheightchange && $options.onkeyboardheightchange(...args))
            }, null, 44, ["type", "name", "value", "password", "placeholder", "placeholderStyle", "disabled", "maxlength", "focus", "confirmType", "cursor-spacing", "adjust-position"])),
            $props.type === "password" && $props.passwordIcon ? (vue.openBlock(), vue.createElementBlock(
              vue.Fragment,
              { key: 3 },
              [
                vue.createCommentVNode(" 开启密码时显示小眼睛 "),
                $options.isVal ? (vue.openBlock(), vue.createBlock(_component_uni_icons, {
                  key: 0,
                  class: vue.normalizeClass(["content-clear-icon", { "is-textarea-icon": $props.type === "textarea" }]),
                  type: $data.showPassword ? "eye-slash-filled" : "eye-filled",
                  size: 22,
                  color: $data.focusShow ? $props.primaryColor : "#c0c4cc",
                  onClick: $options.onEyes
                }, null, 8, ["class", "type", "color", "onClick"])) : vue.createCommentVNode("v-if", true)
              ],
              64
              /* STABLE_FRAGMENT */
            )) : vue.createCommentVNode("v-if", true),
            $props.suffixIcon ? (vue.openBlock(), vue.createElementBlock(
              vue.Fragment,
              { key: 4 },
              [
                $props.suffixIcon ? (vue.openBlock(), vue.createBlock(_component_uni_icons, {
                  key: 0,
                  class: "content-clear-icon",
                  type: $props.suffixIcon,
                  color: "#c0c4cc",
                  onClick: _cache[11] || (_cache[11] = ($event) => $options.onClickIcon("suffix")),
                  size: "22"
                }, null, 8, ["type"])) : vue.createCommentVNode("v-if", true)
              ],
              64
              /* STABLE_FRAGMENT */
            )) : (vue.openBlock(), vue.createElementBlock(
              vue.Fragment,
              { key: 5 },
              [
                $props.clearable && $options.isVal && !$props.disabled && $props.type !== "textarea" ? (vue.openBlock(), vue.createBlock(_component_uni_icons, {
                  key: 0,
                  class: vue.normalizeClass(["content-clear-icon", { "is-textarea-icon": $props.type === "textarea" }]),
                  type: "clear",
                  size: $props.clearSize,
                  color: $options.msg ? "#dd524d" : $data.focusShow ? $props.primaryColor : "#c0c4cc",
                  onClick: $options.onClear
                }, null, 8, ["class", "size", "color", "onClick"])) : vue.createCommentVNode("v-if", true)
              ],
              64
              /* STABLE_FRAGMENT */
            )),
            vue.renderSlot(_ctx.$slots, "right", {}, void 0, true)
          ],
          6
          /* CLASS, STYLE */
        )
      ],
      6
      /* CLASS, STYLE */
    );
  }
  const __easycom_0 = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__scopeId", "data-v-09fd5285"], ["__file", "C:/Users/LIKEASHOT/Documents/HBuilderProjects/Squad/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue"]]);
  const _imports_0 = "/static/back/返回 (2).png";
  const logo = "/static/Squad1.png";
  const _sfc_main$1 = {
    __name: "FirstLogin",
    setup(__props, { expose: __expose }) {
      __expose();
      const step = vue.ref(1);
      const form = vue.ref({
        height: "",
        weight: "",
        gender: "",
        age: "",
        goals: [],
        sportTypes: []
      });
      const goalOptions = [
        { value: "weight_loss", name: "减脂", checked: false },
        { value: "muscle_gain", name: "增肌", checked: false },
        { value: "endurance", name: "耐力", checked: false },
        { value: "flexibility", name: "柔韧性", checked: false },
        { value: "general_fitness", name: "综合健身", checked: false }
      ];
      const sportTypeOptions = [
        { value: "running", text: "跑步", checked: false },
        { value: "swimming", text: "游泳", checked: false },
        { value: "weightlifting", text: "举重", checked: false },
        { value: "yoga", text: "瑜伽", checked: false },
        { value: "basketball", text: "篮球", checked: false }
      ];
      const nextStep = () => {
        if (step.value < 4) {
          step.value++;
        }
      };
      const prevStep = () => {
        if (step.value > 1) {
          step.value--;
        }
      };
      const submitHealthInfo = () => {
        if (!form.value.height || !form.value.weight) {
          uni.showToast({
            title: "请输入身高和体重",
            icon: "none"
          });
          return;
        }
        formatAppLog("log", "at pages/FirstLogin/FirstLogin.vue:207", "提交身高和体重", form.value);
        uni.request({
          url: "http://192.168.56.1:3000/updateHealthInfo",
          // 后端 API 地址
          method: "POST",
          data: {
            height: form.value.height,
            weight: form.value.weight
          },
          success: (res) => {
            formatAppLog("log", "at pages/FirstLogin/FirstLogin.vue:218", "身高体重更新成功", res);
            if (res.statusCode === 200) {
              uni.showToast({
                title: `更新成功，BMI: ${res.data.bmi}`,
                icon: "success"
              });
            } else {
              uni.showToast({
                title: res.data.error || "更新失败",
                icon: "none"
              });
            }
          },
          fail: (err) => {
            formatAppLog("error", "at pages/FirstLogin/FirstLogin.vue:232", "请求失败：", err);
            uni.showToast({
              title: "网络请求失败",
              icon: "none"
            });
          }
        });
        if (step.value < 4) {
          step.value++;
        }
      };
      const submitGenderAge = () => {
        if (!form.value.gender || !form.value.age) {
          uni.showToast({
            title: "请输入性别和年龄",
            icon: "none"
          });
          return;
        }
        formatAppLog("log", "at pages/FirstLogin/FirstLogin.vue:253", "提交性别和年龄", form.value);
        uni.request({
          url: "http://192.168.56.1:3000/updateGenderAge",
          // 后端 API 地址
          method: "POST",
          data: {
            gender: form.value.gender,
            age: form.value.age
          },
          header: {
            "Content-Type": "application/json"
            // 设置请求头
            // 这里可以添加认证信息，例如 JWT
            // 'Authorization': `Bearer ${yourToken}`
          },
          success: (res) => {
            formatAppLog("log", "at pages/FirstLogin/FirstLogin.vue:268", "性别和年龄更新成功", res);
            if (res.statusCode === 200) {
              uni.showToast({
                title: "更新成功",
                icon: "success"
              });
            } else {
              uni.showToast({
                title: res.data.error || "更新失败",
                icon: "none"
              });
            }
          },
          fail: (err) => {
            formatAppLog("error", "at pages/FirstLogin/FirstLogin.vue:282", "请求失败：", err);
            uni.showToast({
              title: "网络请求失败",
              icon: "none"
            });
          }
        });
        if (step.value < 4) {
          step.value++;
        }
      };
      const submitFitnessGoal = () => {
        const selectedGoals = goalOptions.filter((option) => option.checked).map((option) => option.value);
        if (selectedGoals.length === 0) {
          uni.showToast({
            title: "请选择至少一个运动目标",
            icon: "none"
          });
          return;
        }
        formatAppLog("log", "at pages/FirstLogin/FirstLogin.vue:305", "提交运动目标", selectedGoals);
        uni.request({
          url: "http://192.168.56.1:3000/updateFitnessGoal",
          // 后端 API 地址
          method: "POST",
          data: {
            fitnessGoal: selectedGoals
          },
          header: {
            "Content-Type": "application/json"
            // 设置请求头
            // 可以添加JWT或其他认证信息
            // 'Authorization': `Bearer ${yourToken}`
          },
          success: (res) => {
            formatAppLog("log", "at pages/FirstLogin/FirstLogin.vue:319", "运动目标更新成功", res);
            if (res.statusCode === 200) {
              uni.showToast({
                title: "更新成功",
                icon: "success"
              });
            } else {
              uni.showToast({
                title: res.data.error || "更新失败",
                icon: "none"
              });
            }
          },
          fail: (err) => {
            formatAppLog("error", "at pages/FirstLogin/FirstLogin.vue:333", "请求失败：", err);
            uni.showToast({
              title: "网络请求失败",
              icon: "none"
            });
          }
        });
      };
      const submitExerciseType = () => {
        const selectedTypes = sportTypeOptions.filter((option) => option.checked).map((option) => option.value);
        if (selectedTypes.length === 0) {
          uni.showToast({
            title: "请选择至少一种运动方式",
            icon: "none"
          });
          return;
        }
        formatAppLog("log", "at pages/FirstLogin/FirstLogin.vue:353", "提交运动方式", selectedTypes);
        uni.request({
          url: "http://192.168.56.1:3000/updateExerciseType",
          method: "POST",
          data: {
            exerciseType: selectedTypes
          },
          success: (res) => {
            formatAppLog("log", "at pages/FirstLogin/FirstLogin.vue:362", "运动方式更新成功", res);
            if (res.statusCode === 201) {
              uni.showToast({
                title: "更新成功",
                icon: "success"
              });
            } else {
              uni.showToast({
                title: res.data.error || "更新失败",
                icon: "none"
              });
            }
          },
          fail: (err) => {
            formatAppLog("error", "at pages/FirstLogin/FirstLogin.vue:376", "请求失败：", err);
            uni.showToast({
              title: "网络请求失败",
              icon: "none"
            });
          }
        });
      };
      const __returned__ = { logo, step, form, goalOptions, sportTypeOptions, nextStep, prevStep, submitHealthInfo, submitGenderAge, submitFitnessGoal, submitExerciseType, ref: vue.ref };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_easyinput = resolveEasycom(vue.resolveDynamicComponent("uni-easyinput"), __easycom_0);
    const _component_fui_checkbox = resolveEasycom(vue.resolveDynamicComponent("fui-checkbox"), __easycom_1);
    const _component_fui_list_cell = resolveEasycom(vue.resolveDynamicComponent("fui-list-cell"), __easycom_2);
    const _component_fui_label = resolveEasycom(vue.resolveDynamicComponent("fui-label"), __easycom_3);
    const _component_fui_checkbox_group = resolveEasycom(vue.resolveDynamicComponent("fui-checkbox-group"), __easycom_4);
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 返回按钮 "),
      $setup.step > 1 ? (vue.openBlock(), vue.createElementBlock("img", {
        key: 0,
        src: _imports_0,
        alt: "返回",
        class: "back-icon",
        onClick: $setup.prevStep
      })) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 上半部分: 浅灰背景 "),
      vue.createElementVNode("view", { class: "upper-section" }, [
        vue.createElementVNode("image", {
          src: $setup.logo,
          class: "logo"
        }),
        vue.createElementVNode("text", { class: "welcome-title" }, "欢迎来到"),
        vue.createElementVNode("text", { class: "app-name" }, "Squad")
      ]),
      vue.createCommentVNode(" Step 1: 输入身高与体重 "),
      $setup.step === 1 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "lower-section"
      }, [
        vue.createElementVNode("text", { class: "instructions" }, "输入身高与体重，获取更准确的热量消耗"),
        vue.createElementVNode("p", null, [
          vue.createElementVNode("br")
        ]),
        vue.createElementVNode("text", { class: "subtext" }, "个人的身高体重不同，热量消耗也会有所不同。"),
        vue.createElementVNode("view", { class: "spacing" }),
        vue.createVNode(_component_uni_easyinput, {
          modelValue: $setup.form.height,
          "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.form.height = $event),
          placeholder: "请输入身高/cm",
          class: "input-field",
          clearable: ""
        }, null, 8, ["modelValue"]),
        vue.createElementVNode("view", { class: "spacing" }),
        vue.createVNode(_component_uni_easyinput, {
          modelValue: $setup.form.weight,
          "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $setup.form.weight = $event),
          placeholder: "请输入体重/kg",
          class: "input-field",
          clearable: ""
        }, null, 8, ["modelValue"]),
        vue.createElementVNode("view", { class: "spacing" }),
        vue.createElementVNode("view", { class: "button-group" }, [
          vue.createElementVNode("button", {
            class: "button secret",
            onClick: $setup.nextStep
          }, "保密"),
          vue.createElementVNode("button", {
            class: "button confirm",
            onClick: $setup.submitHealthInfo
          }, "确定"),
          vue.createElementVNode("view", { class: "spacing" }),
          vue.createElementVNode("view", { class: "skip-container" }, [
            vue.createElementVNode("button", {
              plain: "true",
              class: "skip-button",
              onClick: _cache[2] || (_cache[2] = (...args) => _ctx.submitForm && _ctx.submitForm(...args))
            }, " 我有十分丰富的运动经验，可以直接使用→ ")
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" Step 2: 输入性别与年龄 "),
      $setup.step === 2 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 2,
        class: "lower-section"
      }, [
        vue.createElementVNode("text", { class: "instructions" }, "输入性别与年龄"),
        vue.createElementVNode("p", null, [
          vue.createElementVNode("br")
        ]),
        vue.createElementVNode("text", { class: "subtext" }, "完善个人信息，更科学地获取运动指导。"),
        vue.createElementVNode("view", { class: "spacing" }),
        vue.createVNode(_component_uni_easyinput, {
          modelValue: $setup.form.gender,
          "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $setup.form.gender = $event),
          placeholder: "请输入性别(男/女)",
          class: "input-field",
          clearable: ""
        }, null, 8, ["modelValue"]),
        vue.createElementVNode("view", { class: "spacing" }),
        vue.createVNode(_component_uni_easyinput, {
          modelValue: $setup.form.age,
          "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => $setup.form.age = $event),
          placeholder: "请输入年龄",
          class: "input-field",
          clearable: ""
        }, null, 8, ["modelValue"]),
        vue.createElementVNode("view", { class: "spacing" }),
        vue.createElementVNode("view", { class: "button-group" }, [
          vue.createElementVNode("button", {
            class: "button secret",
            onClick: $setup.nextStep
          }, "保密"),
          vue.createElementVNode("button", {
            class: "button confirm",
            onClick: $setup.submitGenderAge
          }, "确定"),
          vue.createElementVNode("view", { class: "spacing" }),
          vue.createElementVNode("view", { class: "skip-container" }, [
            vue.createElementVNode("button", {
              plain: "true",
              class: "skip-button",
              onClick: _cache[5] || (_cache[5] = (...args) => _ctx.submitForm && _ctx.submitForm(...args))
            }, " 我有十分丰富的运动经验，可以直接使用→ ")
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" Step 3: 选择运动目标 "),
      $setup.step === 3 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 3,
        class: "lower-section"
      }, [
        vue.createElementVNode("text", { class: "instructions" }, "您的运动目标是？"),
        vue.createElementVNode("p", null, [
          vue.createElementVNode("br")
        ]),
        vue.createElementVNode("text", { class: "subtext" }, "了解运动目标，我们能更好地为您推送运动计划。"),
        vue.createElementVNode("view", { class: "spacing" }),
        vue.createCommentVNode(" 使用fui-checkbox-group替换运动目标的多选框 "),
        vue.createVNode(_component_fui_checkbox_group, {
          modelValue: $setup.form.goals,
          "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => $setup.form.goals = $event)
        }, {
          default: vue.withCtx(() => [
            (vue.openBlock(), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.goalOptions, (item, index) => {
                return vue.createVNode(
                  _component_fui_label,
                  { key: index },
                  {
                    default: vue.withCtx(() => [
                      vue.createVNode(
                        _component_fui_list_cell,
                        null,
                        {
                          default: vue.withCtx(() => [
                            vue.createElementVNode("view", { class: "fui-align__center" }, [
                              vue.createVNode(_component_fui_checkbox, {
                                checked: item.checked,
                                value: item.value,
                                color: "#777CFF",
                                borderColor: "#B2B2B2",
                                borderRadius: "8rpx"
                              }, null, 8, ["checked", "value"]),
                              vue.createElementVNode(
                                "text",
                                { class: "fui-text" },
                                vue.toDisplayString(item.name),
                                1
                                /* TEXT */
                              )
                            ])
                          ]),
                          _: 2
                          /* DYNAMIC */
                        },
                        1024
                        /* DYNAMIC_SLOTS */
                      )
                    ]),
                    _: 2
                    /* DYNAMIC */
                  },
                  1024
                  /* DYNAMIC_SLOTS */
                );
              }),
              64
              /* STABLE_FRAGMENT */
            ))
          ]),
          _: 1
          /* STABLE */
        }, 8, ["modelValue"]),
        vue.createElementVNode("view", { class: "spacing" }),
        vue.createElementVNode("view", { class: "button-group" }, [
          vue.createElementVNode("button", {
            class: "button secret",
            onClick: $setup.nextStep
          }, "保密"),
          vue.createElementVNode("button", {
            class: "button confirm",
            onClick: $setup.nextStep
          }, "确定")
        ]),
        vue.createElementVNode("view", { class: "spacing" }),
        vue.createElementVNode("view", { class: "skip-container" }, [
          vue.createElementVNode("button", {
            plain: "true",
            class: "skip-button",
            onClick: _cache[7] || (_cache[7] = (...args) => _ctx.submitForm && _ctx.submitForm(...args))
          }, " 我有十分丰富的运动经验，可以直接使用→ ")
        ])
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" Step 4: 选择运动类型 "),
      $setup.step === 4 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 4,
        class: "lower-section"
      }, [
        vue.createElementVNode("text", { class: "instructions" }, "您喜欢的运动类型是？"),
        vue.createElementVNode("p", null, [
          vue.createElementVNode("br")
        ]),
        vue.createElementVNode("text", { class: "subtext" }, "了解运动类型，我们能更好地为您推送运动计划。"),
        vue.createElementVNode("view", { class: "spacing" }),
        vue.createCommentVNode(" 使用fui-checkbox-group替换运动类型的多选框 "),
        vue.createVNode(_component_fui_checkbox_group, {
          modelValue: $setup.form.sportTypes,
          "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => $setup.form.sportTypes = $event)
        }, {
          default: vue.withCtx(() => [
            (vue.openBlock(), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.sportTypeOptions, (item, index) => {
                return vue.createVNode(
                  _component_fui_label,
                  { key: index },
                  {
                    default: vue.withCtx(() => [
                      vue.createVNode(
                        _component_fui_list_cell,
                        null,
                        {
                          default: vue.withCtx(() => [
                            vue.createElementVNode("view", { class: "fui-align__center" }, [
                              vue.createVNode(_component_fui_checkbox, {
                                checked: item.checked,
                                value: item.value,
                                color: "#777CFF",
                                borderColor: "#B2B2B2",
                                borderRadius: "8rpx"
                              }, null, 8, ["checked", "value"]),
                              vue.createElementVNode(
                                "text",
                                { class: "fui-text" },
                                vue.toDisplayString(item.text),
                                1
                                /* TEXT */
                              )
                            ])
                          ]),
                          _: 2
                          /* DYNAMIC */
                        },
                        1024
                        /* DYNAMIC_SLOTS */
                      )
                    ]),
                    _: 2
                    /* DYNAMIC */
                  },
                  1024
                  /* DYNAMIC_SLOTS */
                );
              }),
              64
              /* STABLE_FRAGMENT */
            ))
          ]),
          _: 1
          /* STABLE */
        }, 8, ["modelValue"]),
        vue.createElementVNode("view", { class: "spacing" }),
        vue.createElementVNode("view", { class: "button-group" }, [
          vue.createElementVNode("button", {
            class: "button secret",
            onClick: _cache[9] || (_cache[9] = (...args) => _ctx.submitForm && _ctx.submitForm(...args))
          }, "保密"),
          vue.createElementVNode("button", {
            class: "button confirm",
            onClick: _cache[10] || (_cache[10] = (...args) => _ctx.submitForm && _ctx.submitForm(...args))
          }, "确定")
        ]),
        vue.createElementVNode("view", { class: "spacing" }),
        vue.createElementVNode("view", { class: "skip-container" }, [
          vue.createElementVNode("button", {
            plain: "true",
            class: "skip-button",
            onClick: _cache[11] || (_cache[11] = (...args) => _ctx.submitForm && _ctx.submitForm(...args))
          }, " 我有十分丰富的运动经验，可以直接使用→ ")
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesFirstLoginFirstLogin = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__scopeId", "data-v-e8fa868b"], ["__file", "C:/Users/LIKEASHOT/Documents/HBuilderProjects/Squad/pages/FirstLogin/FirstLogin.vue"]]);
  __definePage("pages/Login/Login", PagesLoginLogin);
  __definePage("pages/index/index", PagesIndexIndex);
  __definePage("pages/Register/Register", PagesRegisterRegister);
  __definePage("pages/FirstLogin/FirstLogin", PagesFirstLoginFirstLogin);
  const _sfc_main = {
    onLaunch: function() {
      formatAppLog("warn", "at App.vue:4", "当前组件仅支持 uni_modules 目录结构 ，请升级 HBuilderX 到 3.1.0 版本以上！");
      formatAppLog("log", "at App.vue:5", "App Launch");
    },
    onShow: function() {
      formatAppLog("log", "at App.vue:8", "App Show");
    },
    onHide: function() {
      formatAppLog("log", "at App.vue:11", "App Hide");
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "C:/Users/LIKEASHOT/Documents/HBuilderProjects/Squad/App.vue"]]);
  function createApp() {
    const app = vue.createVueApp(App);
    return {
      app
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);
