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
  const global2 = uni.requireGlobal();
  ArrayBuffer = global2.ArrayBuffer;
  Int8Array = global2.Int8Array;
  Uint8Array = global2.Uint8Array;
  Uint8ClampedArray = global2.Uint8ClampedArray;
  Int16Array = global2.Int16Array;
  Uint16Array = global2.Uint16Array;
  Int32Array = global2.Int32Array;
  Uint32Array = global2.Uint32Array;
  Float32Array = global2.Float32Array;
  Float64Array = global2.Float64Array;
  BigInt64Array = global2.BigInt64Array;
  BigUint64Array = global2.BigUint64Array;
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
  const _sfc_main$l = {
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
      onConfirm(e2) {
        this.$emit("confirm", e2);
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
      fieldClickAndroid(e2) {
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
      onKeyboardheightchange(e2) {
        this.$emit("keyboardheightchange", e2.detail);
      },
      trimStr(str) {
        return str.replace(/^\s+|\s+$/g, "");
      }
    }
  };
  function _sfc_render$k(_ctx, _cache, $props, $setup, $data, $options) {
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
  const __easycom_0$3 = /* @__PURE__ */ _export_sfc(_sfc_main$l, [["render", _sfc_render$k], ["__scopeId", "data-v-a23503dd"], ["__file", "D:/coding/sf_enginering/Squad/Squad/node_modules/firstui-uni/firstui/fui-input/fui-input.vue"]]);
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
  const _sfc_main$k = {
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
  function _sfc_render$j(_ctx, _cache, $props, $setup, $data, $options) {
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
  const __easycom_1$2 = /* @__PURE__ */ _export_sfc(_sfc_main$k, [["render", _sfc_render$j], ["__scopeId", "data-v-0d5d8e40"], ["__file", "D:/coding/sf_enginering/Squad/Squad/node_modules/firstui-uni/firstui/fui-icon/fui-icon.vue"]]);
  const logo$2 = "/static/Squad1.png";
  const serverUrl$2 = "http://10.133.80.141:3000";
  const _sfc_main$j = {
    __name: "Login",
    setup(__props, { expose: __expose }) {
      __expose();
      const isPressed = vue.ref(false);
      const password = vue.ref(true);
      const inputpwd = (e2) => {
        formatAppLog("log", "at pages/Login/Login.vue:87", e2);
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
        username: "",
        password: ""
      });
      const submitLogin = () => {
        if (!form.value.username || !form.value.password) {
          uni.showToast({
            title: "请输入账号和密码",
            icon: "none"
          });
          return;
        }
        formatAppLog("log", "at pages/Login/Login.vue:115", "提交登录表单", form.value);
        uni.request({
          url: serverUrl$2 + "/login",
          method: "POST",
          data: {
            username: form.value.username,
            password: form.value.password
          },
          success: (res) => {
            if (res.statusCode === 200) {
              uni.showToast({
                title: "登录成功",
                icon: "success"
              });
              uni.setStorageSync("token", res.data.token);
              uni.setStorageSync("username", form.value.username);
              uni.switchTab({
                url: "/pages/Home/Home"
              });
            } else {
              uni.showToast({
                title: "登录失败",
                icon: "none"
              });
            }
          }
        });
      };
      const goRegister = () => {
        formatAppLog("log", "at pages/Login/Login.vue:145", "前往注册页面");
        uni.navigateTo({ url: "/pages/Register/Register" });
      };
      const __returned__ = { isPressed, password, inputpwd, changepwd_vis, onButtonPress, onButtonRelease, logo: logo$2, serverUrl: serverUrl$2, form, submitLogin, goRegister, ref: vue.ref };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$i(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_fui_input = resolveEasycom(vue.resolveDynamicComponent("fui-input"), __easycom_0$3);
    const _component_fui_icon = resolveEasycom(vue.resolveDynamicComponent("fui-icon"), __easycom_1$2);
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
        vue.createCommentVNode(' <uni-easyinput\r\n        v-model="form.account"\r\n        placeholder="请输入账号"\r\n        clearable\r\n        class="input-field rounded-input"\r\n      ></uni-easyinput> '),
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
        vue.createCommentVNode(" 账号和密码之间的间距 "),
        vue.createCommentVNode(' <uni-easyinput\r\n        v-model="form.password"\r\n        placeholder="请输入密码"\r\n        type="password"\r\n        clearable\r\n        class="input-field rounded-input"\r\n      ></uni-easyinput> '),
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
        vue.createCommentVNode(' <fui-input\r\n        placeholder="请输入密码"\r\n        v-model="form.password"\r\n        :isFillet="true"\r\n        type="password"\r\n        clearable\r\n      ></fui-input> '),
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
  const PagesLoginLogin = /* @__PURE__ */ _export_sfc(_sfc_main$j, [["render", _sfc_render$i], ["__scopeId", "data-v-461d1d79"], ["__file", "D:/coding/sf_enginering/Squad/Squad/pages/Login/Login.vue"]]);
  const _sfc_main$i = {
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
      checkboxChange(e2) {
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
  function _sfc_render$h(_ctx, _cache, $props, $setup, $data, $options) {
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
  const __easycom_1$1 = /* @__PURE__ */ _export_sfc(_sfc_main$i, [["render", _sfc_render$h], ["__scopeId", "data-v-bc643473"], ["__file", "D:/coding/sf_enginering/Squad/Squad/node_modules/firstui-uni/firstui/fui-checkbox/fui-checkbox.vue"]]);
  const _sfc_main$h = {
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
  function _sfc_render$g(_ctx, _cache, $props, $setup, $data, $options) {
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
  const __easycom_2 = /* @__PURE__ */ _export_sfc(_sfc_main$h, [["render", _sfc_render$g], ["__scopeId", "data-v-c16a41c6"], ["__file", "D:/coding/sf_enginering/Squad/Squad/node_modules/firstui-uni/firstui/fui-list-cell/fui-list-cell.vue"]]);
  const _sfc_main$g = {
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
  function _sfc_render$f(_ctx, _cache, $props, $setup, $data, $options) {
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
  const __easycom_3 = /* @__PURE__ */ _export_sfc(_sfc_main$g, [["render", _sfc_render$f], ["__scopeId", "data-v-186dfc0c"], ["__file", "D:/coding/sf_enginering/Squad/Squad/node_modules/firstui-uni/firstui/fui-label/fui-label.vue"]]);
  const _sfc_main$f = {
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
      checkboxChange(e2) {
        this.$emit("change", e2);
        this.$emit("input", e2.detail.value);
        this.$emit("update:modelValue", e2.detail.value);
      },
      changeValue(checked, target) {
        const vals = [];
        this.childrens.forEach((item) => {
          if (item.val) {
            vals.push(item.value);
          }
        });
        this.vals = vals;
        let e2 = {
          detail: {
            value: vals
          }
        };
        this.checkboxChange(e2);
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
  function _sfc_render$e(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("checkbox-group", { name: $props.name }, [
      vue.renderSlot(_ctx.$slots, "default")
    ], 8, ["name"]);
  }
  const __easycom_4 = /* @__PURE__ */ _export_sfc(_sfc_main$f, [["render", _sfc_render$e], ["__file", "D:/coding/sf_enginering/Squad/Squad/node_modules/firstui-uni/firstui/fui-checkbox-group/fui-checkbox-group.vue"]]);
  const _sfc_main$e = {
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
      checkboxChange: function(e2) {
        var items = this.items, values = e2.detail.value;
        for (var i2 = 0, lenI = items.length; i2 < lenI; ++i2) {
          const item = items[i2];
          if (values.includes(item.value)) {
            this.$set(item, "checked", true);
          } else {
            this.$set(item, "checked", false);
          }
        }
      },
      change(e2) {
        formatAppLog("log", "at pages/index/index.vue:134", "change:" + JSON.stringify(e2.detail.value));
      }
    }
  };
  function _sfc_render$d(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_fui_checkbox = resolveEasycom(vue.resolveDynamicComponent("fui-checkbox"), __easycom_1$1);
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
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$e, [["render", _sfc_render$d], ["__file", "D:/coding/sf_enginering/Squad/Squad/pages/index/index.vue"]]);
  const logo$1 = "/static/Squad1.png";
  const serverUrl$1 = "http://10.133.80.141:3000";
  const _sfc_main$d = {
    __name: "Register",
    setup(__props, { expose: __expose }) {
      __expose();
      const password = vue.ref(true);
      const password_confirm = vue.ref(true);
      const inputpwd = (e2) => {
        formatAppLog("log", "at pages/Register/Register.vue:92", e2);
      };
      const changepwd_vis = () => {
        password.value = !password.value;
      };
      const inputpwd_confirm = (e2) => {
        formatAppLog("log", "at pages/Register/Register.vue:98", e2);
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
          url: serverUrl$1 + "/register",
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
              uni.setStorage({
                key: "username",
                data: form.value.username,
                success: function() {
                  formatAppLog("log", "at pages/Register/Register.vue:152", "success");
                }
              });
              uni.navigateTo({ url: "/pages/FirstLogin/FirstLogin" }).then(() => {
                formatAppLog("log", "at pages/Register/Register.vue:157", "跳转成功");
              }).catch((err) => {
                formatAppLog("error", "at pages/Register/Register.vue:160", "跳转失败：", err);
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
            formatAppLog("error", "at pages/Register/Register.vue:174", "注册请求失败：", err);
          }
        });
      };
      const __returned__ = { password, password_confirm, inputpwd, changepwd_vis, inputpwd_confirm, changepwd_vis_confirm, logo: logo$1, serverUrl: serverUrl$1, form, submitRegister, ref: vue.ref };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$c(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_fui_input = resolveEasycom(vue.resolveDynamicComponent("fui-input"), __easycom_0$3);
    const _component_fui_icon = resolveEasycom(vue.resolveDynamicComponent("fui-icon"), __easycom_1$2);
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
        vue.createCommentVNode(' <uni-easyinput\r\n        v-model="form.password"\r\n        type="password"\r\n        placeholder="请输入密码"\r\n        clearable\r\n        class="input-field"\r\n      ></uni-easyinput> '),
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
        vue.createCommentVNode(' <uni-easyinput\r\n        v-model="form.confirmPassword"\r\n        type="password"\r\n        placeholder="请再次输入密码"\r\n        clearable\r\n        class="input-field"\r\n      ></uni-easyinput> '),
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
  const PagesRegisterRegister = /* @__PURE__ */ _export_sfc(_sfc_main$d, [["render", _sfc_render$c], ["__scopeId", "data-v-6b0433d4"], ["__file", "D:/coding/sf_enginering/Squad/Squad/pages/Register/Register.vue"]]);
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
  const _sfc_main$c = {
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
        let code = this.icons.find((v2) => v2.font_class === this.type);
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
  function _sfc_render$b(_ctx, _cache, $props, $setup, $data, $options) {
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
  const __easycom_0$2 = /* @__PURE__ */ _export_sfc(_sfc_main$c, [["render", _sfc_render$b], ["__scopeId", "data-v-d31e1c47"], ["__file", "D:/coding/sf_enginering/Squad/Squad/uni_modules/uni-icons/components/uni-icons/uni-icons.vue"]]);
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
  const _sfc_main$b = {
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
      onConfirm(e2) {
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
  function _sfc_render$a(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_icons = resolveEasycom(vue.resolveDynamicComponent("uni-icons"), __easycom_0$2);
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
  const __easycom_0$1 = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["render", _sfc_render$a], ["__scopeId", "data-v-09fd5285"], ["__file", "D:/coding/sf_enginering/Squad/Squad/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue"]]);
  const _imports_0$1 = "/static/back/返回 (2).png";
  const serverUrl = "http://10.133.80.141:3000";
  const logo = "/static/Squad1.png";
  const _sfc_main$a = {
    __name: "FirstLogin",
    setup(__props, { expose: __expose }) {
      __expose();
      const step = vue.ref(1);
      const username = uni.getStorageSync("username");
      const form = vue.ref({
        height: "",
        weight: "",
        gender: "",
        age: "",
        goals: [],
        sportTypes: []
      });
      const goalOptions = [
        { value: "减脂", name: "减脂", checked: false },
        { value: "增肌", name: "增肌", checked: false },
        { value: "耐力", name: "耐力", checked: false },
        { value: "柔韧性", name: "柔韧性", checked: false },
        { value: "综合健身", name: "综合健身", checked: false }
      ];
      const sportTypeOptions = [
        { value: "跑步", text: "跑步", checked: false },
        { value: "游泳", text: "游泳", checked: false },
        { value: "撸铁", text: "撸铁", checked: false },
        { value: "瑜伽", text: "瑜伽", checked: false },
        { value: "篮球", text: "篮球", checked: false }
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
        formatAppLog("log", "at pages/FirstLogin/FirstLogin.vue:204", "用户名", username);
        formatAppLog("log", "at pages/FirstLogin/FirstLogin.vue:205", "提交身高和体重", form.value);
        uni.request({
          url: serverUrl + "/updateHealthInfo",
          method: "POST",
          data: {
            height: form.value.height,
            weight: form.value.weight,
            username
          },
          success: (res) => {
            formatAppLog("log", "at pages/FirstLogin/FirstLogin.vue:217", "身高体重更新成功", res);
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
            if (step.value < 4) {
              step.value++;
            }
          },
          fail: (err) => {
            formatAppLog("error", "at pages/FirstLogin/FirstLogin.vue:234", "请求失败：", err);
            uni.showToast({
              title: "网络请求失败",
              icon: "none"
            });
          }
        });
      };
      const submitGenderAge = () => {
        if (!form.value.gender || !form.value.age) {
          uni.showToast({
            title: "请输入性别和年龄",
            icon: "none"
          });
          return;
        }
        formatAppLog("log", "at pages/FirstLogin/FirstLogin.vue:252", "提交性别和年龄", form.value);
        uni.request({
          url: serverUrl + "/updateGenderAge",
          method: "POST",
          data: {
            gender: form.value.gender,
            age: form.value.age,
            username
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
            if (step.value < 4) {
              step.value++;
            }
          },
          fail: (err) => {
            formatAppLog("error", "at pages/FirstLogin/FirstLogin.vue:286", "请求失败：", err);
            uni.showToast({
              title: "网络请求失败",
              icon: "none"
            });
          }
        });
      };
      const submitFitnessGoal = () => {
        const selectedGoals = form.value.goals;
        if (selectedGoals.length === 0) {
          uni.showToast({
            title: "请选择至少一个运动目标",
            icon: "none"
          });
          return;
        }
        formatAppLog("log", "at pages/FirstLogin/FirstLogin.vue:306", "提交运动目标", selectedGoals.join(","));
        uni.request({
          url: serverUrl + "/updateFitnessGoal",
          method: "POST",
          data: {
            fitnessGoal: selectedGoals.join(","),
            // 将数组转换为字符串，使用逗号分隔
            username
          },
          header: {
            "Content-Type": "application/json"
            // 'Authorization': `Bearer ${yourToken}` // 需要设置实际 token
          },
          success: (res) => {
            formatAppLog("log", "at pages/FirstLogin/FirstLogin.vue:320", "运动目标更新成功", res);
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
            if (step.value < 4) {
              step.value++;
            }
          },
          fail: (err) => {
            formatAppLog("error", "at pages/FirstLogin/FirstLogin.vue:337", "请求失败：", err);
            uni.showToast({
              title: "网络请求失败",
              icon: "none"
            });
          }
        });
      };
      const submitExerciseType = () => {
        const selectedTypes = form.value.sportTypes;
        if (selectedTypes.length === 0) {
          uni.showToast({
            title: "请选择至少一种运动方式",
            icon: "none"
          });
          return;
        }
        formatAppLog("log", "at pages/FirstLogin/FirstLogin.vue:357", "提交运动方式", selectedTypes.join(","));
        uni.request({
          url: serverUrl + "/updateExerciseType",
          method: "POST",
          data: {
            exerciseType: selectedTypes.join(","),
            username
          },
          header: {
            "Content-Type": "application/json"
            // 'Authorization': `Bearer ${yourToken}` // 需要设置实际 token
          },
          success: (res) => {
            formatAppLog("log", "at pages/FirstLogin/FirstLogin.vue:371", "运动方式更新成功", res);
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
            if (step.value < 4) {
              step.value++;
            }
          },
          fail: (err) => {
            formatAppLog("error", "at pages/FirstLogin/FirstLogin.vue:388", "请求失败：", err);
            uni.showToast({
              title: "网络请求失败",
              icon: "none"
            });
          }
        });
      };
      const submitForm = () => {
        uni.navigateTo({ url: "/pages/Home/Home" }).then(() => {
          formatAppLog("log", "at pages/FirstLogin/FirstLogin.vue:400", "跳转成功");
        }).catch((err) => {
          formatAppLog("error", "at pages/FirstLogin/FirstLogin.vue:403", "跳转失败：", err);
        });
      };
      const __returned__ = { serverUrl, logo, step, username, form, goalOptions, sportTypeOptions, nextStep, prevStep, submitHealthInfo, submitGenderAge, submitFitnessGoal, submitExerciseType, submitForm, ref: vue.ref };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$9(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_easyinput = resolveEasycom(vue.resolveDynamicComponent("uni-easyinput"), __easycom_0$1);
    const _component_fui_checkbox = resolveEasycom(vue.resolveDynamicComponent("fui-checkbox"), __easycom_1$1);
    const _component_fui_list_cell = resolveEasycom(vue.resolveDynamicComponent("fui-list-cell"), __easycom_2);
    const _component_fui_label = resolveEasycom(vue.resolveDynamicComponent("fui-label"), __easycom_3);
    const _component_fui_checkbox_group = resolveEasycom(vue.resolveDynamicComponent("fui-checkbox-group"), __easycom_4);
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 返回按钮 "),
      vue.createCommentVNode(' <img\r\n      v-if="step > 1"\r\n      src="@/static/back/返回 (2).png"\r\n      alt="返回"\r\n      class="back-icon"\r\n      @click="prevStep"\r\n    /> '),
      vue.createElementVNode("view", { class: "upper-section" }, [
        $setup.step > 1 ? (vue.openBlock(), vue.createElementBlock("image", {
          key: 0,
          src: _imports_0$1,
          class: "return-button",
          onClick: $setup.prevStep
        })) : vue.createCommentVNode("v-if", true),
        vue.createElementVNode("image", {
          src: $setup.logo,
          class: "logo"
        }),
        vue.createElementVNode("text", { class: "welcome-title" }, "欢迎来到"),
        vue.createElementVNode("text", { class: "app-name" }, "Squad")
      ]),
      vue.createCommentVNode(' <image v-if="step>1" src="../../static/back/返回 (2).png" class="back-icon" @click="prevStep"></image>\r\n    上半部分: 浅灰背景 '),
      vue.createCommentVNode(' <view class="upper-section">\r\n      <image :src="logo" class="logo"></image>\r\n      <text class="welcome-title">欢迎来到</text>\r\n      <text class="app-name">Squad</text>\r\n    </view> '),
      vue.createCommentVNode(" Step 1: 输入身高与体重 "),
      $setup.step === 1 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
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
          vue.createElementVNode("view", { class: "spacing" })
        ])
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" Step 2: 输入性别与年龄 "),
      $setup.step === 2 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
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
          "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $setup.form.gender = $event),
          placeholder: "请输入性别(男/女)",
          class: "input-field",
          clearable: ""
        }, null, 8, ["modelValue"]),
        vue.createElementVNode("view", { class: "spacing" }),
        vue.createVNode(_component_uni_easyinput, {
          modelValue: $setup.form.age,
          "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $setup.form.age = $event),
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
          vue.createElementVNode("view", { class: "spacing" })
        ])
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" Step 3: 选择运动目标 "),
      $setup.step === 3 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 2,
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
          "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => $setup.form.goals = $event)
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
            onClick: $setup.submitFitnessGoal
          }, "确定")
        ]),
        vue.createElementVNode("view", { class: "spacing" })
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" Step 4: 选择运动类型 "),
      $setup.step === 4 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 3,
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
          "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => $setup.form.sportTypes = $event)
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
            onClick: $setup.submitForm
          }, "保密"),
          vue.createElementVNode("button", {
            class: "button confirm",
            onClick: $setup.submitExerciseType
          }, "确定")
        ]),
        vue.createElementVNode("view", { class: "spacing" })
      ])) : vue.createCommentVNode("v-if", true),
      vue.createElementVNode("view", { class: "skip-container" }, [
        vue.createElementVNode("button", {
          plain: "true",
          class: "skip-button",
          onClick: $setup.submitForm
        }, " 我有十分丰富的运动经验，可以直接使用→ ")
      ])
    ]);
  }
  const PagesFirstLoginFirstLogin = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["render", _sfc_render$9], ["__scopeId", "data-v-e8fa868b"], ["__file", "D:/coding/sf_enginering/Squad/Squad/pages/FirstLogin/FirstLogin.vue"]]);
  const _sfc_main$9 = {
    name: "UniSection",
    emits: ["click"],
    props: {
      type: {
        type: String,
        default: ""
      },
      title: {
        type: String,
        required: true,
        default: ""
      },
      titleFontSize: {
        type: String,
        default: "14px"
      },
      titleColor: {
        type: String,
        default: "#333"
      },
      subTitle: {
        type: String,
        default: ""
      },
      subTitleFontSize: {
        type: String,
        default: "12px"
      },
      subTitleColor: {
        type: String,
        default: "#999"
      },
      padding: {
        type: [Boolean, String],
        default: false
      }
    },
    computed: {
      _padding() {
        if (typeof this.padding === "string") {
          return this.padding;
        }
        return this.padding ? "10px" : "";
      }
    },
    watch: {
      title(newVal) {
        if (uni.report && newVal !== "") {
          uni.report("title", newVal);
        }
      }
    },
    methods: {
      onClick() {
        this.$emit("click");
      }
    }
  };
  function _sfc_render$8(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "uni-section" }, [
      vue.createElementVNode("view", {
        class: "uni-section-header",
        onClick: _cache[0] || (_cache[0] = (...args) => $options.onClick && $options.onClick(...args))
      }, [
        $props.type ? (vue.openBlock(), vue.createElementBlock(
          "view",
          {
            key: 0,
            class: vue.normalizeClass(["uni-section-header__decoration", $props.type])
          },
          null,
          2
          /* CLASS */
        )) : vue.renderSlot(_ctx.$slots, "decoration", { key: 1 }, void 0, true),
        vue.createElementVNode("view", { class: "uni-section-header__content" }, [
          vue.createElementVNode(
            "text",
            {
              style: vue.normalizeStyle({ "font-size": $props.titleFontSize, "color": $props.titleColor }),
              class: vue.normalizeClass(["uni-section__content-title", { "distraction": !$props.subTitle }])
            },
            vue.toDisplayString($props.title),
            7
            /* TEXT, CLASS, STYLE */
          ),
          $props.subTitle ? (vue.openBlock(), vue.createElementBlock(
            "text",
            {
              key: 0,
              style: vue.normalizeStyle({ "font-size": $props.subTitleFontSize, "color": $props.subTitleColor }),
              class: "uni-section-header__content-sub"
            },
            vue.toDisplayString($props.subTitle),
            5
            /* TEXT, STYLE */
          )) : vue.createCommentVNode("v-if", true)
        ]),
        vue.createElementVNode("view", { class: "uni-section-header__slot-right" }, [
          vue.renderSlot(_ctx.$slots, "right", {}, void 0, true)
        ])
      ]),
      vue.createElementVNode(
        "view",
        {
          class: "uni-section-content",
          style: vue.normalizeStyle({ padding: $options._padding })
        },
        [
          vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
        ],
        4
        /* STYLE */
      )
    ]);
  }
  const __easycom_0 = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["render", _sfc_render$8], ["__scopeId", "data-v-637fd36b"], ["__file", "D:/coding/sf_enginering/Squad/Squad/uni_modules/uni-section/components/uni-section/uni-section.vue"]]);
  var calendar = {
    /**
        * 农历1900-2100的润大小信息表
        * @Array Of Property
        * @return Hex
        */
    lunarInfo: [
      19416,
      19168,
      42352,
      21717,
      53856,
      55632,
      91476,
      22176,
      39632,
      21970,
      // 1900-1909
      19168,
      42422,
      42192,
      53840,
      119381,
      46400,
      54944,
      44450,
      38320,
      84343,
      // 1910-1919
      18800,
      42160,
      46261,
      27216,
      27968,
      109396,
      11104,
      38256,
      21234,
      18800,
      // 1920-1929
      25958,
      54432,
      59984,
      28309,
      23248,
      11104,
      100067,
      37600,
      116951,
      51536,
      // 1930-1939
      54432,
      120998,
      46416,
      22176,
      107956,
      9680,
      37584,
      53938,
      43344,
      46423,
      // 1940-1949
      27808,
      46416,
      86869,
      19872,
      42416,
      83315,
      21168,
      43432,
      59728,
      27296,
      // 1950-1959
      44710,
      43856,
      19296,
      43748,
      42352,
      21088,
      62051,
      55632,
      23383,
      22176,
      // 1960-1969
      38608,
      19925,
      19152,
      42192,
      54484,
      53840,
      54616,
      46400,
      46752,
      103846,
      // 1970-1979
      38320,
      18864,
      43380,
      42160,
      45690,
      27216,
      27968,
      44870,
      43872,
      38256,
      // 1980-1989
      19189,
      18800,
      25776,
      29859,
      59984,
      27480,
      23232,
      43872,
      38613,
      37600,
      // 1990-1999
      51552,
      55636,
      54432,
      55888,
      30034,
      22176,
      43959,
      9680,
      37584,
      51893,
      // 2000-2009
      43344,
      46240,
      47780,
      44368,
      21977,
      19360,
      42416,
      86390,
      21168,
      43312,
      // 2010-2019
      31060,
      27296,
      44368,
      23378,
      19296,
      42726,
      42208,
      53856,
      60005,
      54576,
      // 2020-2029
      23200,
      30371,
      38608,
      19195,
      19152,
      42192,
      118966,
      53840,
      54560,
      56645,
      // 2030-2039
      46496,
      22224,
      21938,
      18864,
      42359,
      42160,
      43600,
      111189,
      27936,
      44448,
      // 2040-2049
      /** Add By JJonline@JJonline.Cn**/
      84835,
      37744,
      18936,
      18800,
      25776,
      92326,
      59984,
      27424,
      108228,
      43744,
      // 2050-2059
      41696,
      53987,
      51552,
      54615,
      54432,
      55888,
      23893,
      22176,
      42704,
      21972,
      // 2060-2069
      21200,
      43448,
      43344,
      46240,
      46758,
      44368,
      21920,
      43940,
      42416,
      21168,
      // 2070-2079
      45683,
      26928,
      29495,
      27296,
      44368,
      84821,
      19296,
      42352,
      21732,
      53600,
      // 2080-2089
      59752,
      54560,
      55968,
      92838,
      22224,
      19168,
      43476,
      41680,
      53584,
      62034,
      // 2090-2099
      54560
    ],
    // 2100
    /**
        * 公历每个月份的天数普通表
        * @Array Of Property
        * @return Number
        */
    solarMonth: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
    /**
        * 天干地支之天干速查表
        * @Array Of Property trans["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"]
        * @return Cn string
        */
    Gan: ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"],
    /**
        * 天干地支之地支速查表
        * @Array Of Property
        * @trans["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"]
        * @return Cn string
        */
    Zhi: ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"],
    /**
        * 天干地支之地支速查表<=>生肖
        * @Array Of Property
        * @trans["鼠","牛","虎","兔","龙","蛇","马","羊","猴","鸡","狗","猪"]
        * @return Cn string
        */
    Animals: ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"],
    /**
        * 24节气速查表
        * @Array Of Property
        * @trans["小寒","大寒","立春","雨水","惊蛰","春分","清明","谷雨","立夏","小满","芒种","夏至","小暑","大暑","立秋","处暑","白露","秋分","寒露","霜降","立冬","小雪","大雪","冬至"]
        * @return Cn string
        */
    solarTerm: ["小寒", "大寒", "立春", "雨水", "惊蛰", "春分", "清明", "谷雨", "立夏", "小满", "芒种", "夏至", "小暑", "大暑", "立秋", "处暑", "白露", "秋分", "寒露", "霜降", "立冬", "小雪", "大雪", "冬至"],
    /**
        * 1900-2100各年的24节气日期速查表
        * @Array Of Property
        * @return 0x string For splice
        */
    sTermInfo: [
      "9778397bd097c36b0b6fc9274c91aa",
      "97b6b97bd19801ec9210c965cc920e",
      "97bcf97c3598082c95f8c965cc920f",
      "97bd0b06bdb0722c965ce1cfcc920f",
      "b027097bd097c36b0b6fc9274c91aa",
      "97b6b97bd19801ec9210c965cc920e",
      "97bcf97c359801ec95f8c965cc920f",
      "97bd0b06bdb0722c965ce1cfcc920f",
      "b027097bd097c36b0b6fc9274c91aa",
      "97b6b97bd19801ec9210c965cc920e",
      "97bcf97c359801ec95f8c965cc920f",
      "97bd0b06bdb0722c965ce1cfcc920f",
      "b027097bd097c36b0b6fc9274c91aa",
      "9778397bd19801ec9210c965cc920e",
      "97b6b97bd19801ec95f8c965cc920f",
      "97bd09801d98082c95f8e1cfcc920f",
      "97bd097bd097c36b0b6fc9210c8dc2",
      "9778397bd197c36c9210c9274c91aa",
      "97b6b97bd19801ec95f8c965cc920e",
      "97bd09801d98082c95f8e1cfcc920f",
      "97bd097bd097c36b0b6fc9210c8dc2",
      "9778397bd097c36c9210c9274c91aa",
      "97b6b97bd19801ec95f8c965cc920e",
      "97bcf97c3598082c95f8e1cfcc920f",
      "97bd097bd097c36b0b6fc9210c8dc2",
      "9778397bd097c36c9210c9274c91aa",
      "97b6b97bd19801ec9210c965cc920e",
      "97bcf97c3598082c95f8c965cc920f",
      "97bd097bd097c35b0b6fc920fb0722",
      "9778397bd097c36b0b6fc9274c91aa",
      "97b6b97bd19801ec9210c965cc920e",
      "97bcf97c3598082c95f8c965cc920f",
      "97bd097bd097c35b0b6fc920fb0722",
      "9778397bd097c36b0b6fc9274c91aa",
      "97b6b97bd19801ec9210c965cc920e",
      "97bcf97c359801ec95f8c965cc920f",
      "97bd097bd097c35b0b6fc920fb0722",
      "9778397bd097c36b0b6fc9274c91aa",
      "97b6b97bd19801ec9210c965cc920e",
      "97bcf97c359801ec95f8c965cc920f",
      "97bd097bd097c35b0b6fc920fb0722",
      "9778397bd097c36b0b6fc9274c91aa",
      "97b6b97bd19801ec9210c965cc920e",
      "97bcf97c359801ec95f8c965cc920f",
      "97bd097bd07f595b0b6fc920fb0722",
      "9778397bd097c36b0b6fc9210c8dc2",
      "9778397bd19801ec9210c9274c920e",
      "97b6b97bd19801ec95f8c965cc920f",
      "97bd07f5307f595b0b0bc920fb0722",
      "7f0e397bd097c36b0b6fc9210c8dc2",
      "9778397bd097c36c9210c9274c920e",
      "97b6b97bd19801ec95f8c965cc920f",
      "97bd07f5307f595b0b0bc920fb0722",
      "7f0e397bd097c36b0b6fc9210c8dc2",
      "9778397bd097c36c9210c9274c91aa",
      "97b6b97bd19801ec9210c965cc920e",
      "97bd07f1487f595b0b0bc920fb0722",
      "7f0e397bd097c36b0b6fc9210c8dc2",
      "9778397bd097c36b0b6fc9274c91aa",
      "97b6b97bd19801ec9210c965cc920e",
      "97bcf7f1487f595b0b0bb0b6fb0722",
      "7f0e397bd097c35b0b6fc920fb0722",
      "9778397bd097c36b0b6fc9274c91aa",
      "97b6b97bd19801ec9210c965cc920e",
      "97bcf7f1487f595b0b0bb0b6fb0722",
      "7f0e397bd097c35b0b6fc920fb0722",
      "9778397bd097c36b0b6fc9274c91aa",
      "97b6b97bd19801ec9210c965cc920e",
      "97bcf7f1487f531b0b0bb0b6fb0722",
      "7f0e397bd097c35b0b6fc920fb0722",
      "9778397bd097c36b0b6fc9274c91aa",
      "97b6b97bd19801ec9210c965cc920e",
      "97bcf7f1487f531b0b0bb0b6fb0722",
      "7f0e397bd07f595b0b6fc920fb0722",
      "9778397bd097c36b0b6fc9274c91aa",
      "97b6b97bd19801ec9210c9274c920e",
      "97bcf7f0e47f531b0b0bb0b6fb0722",
      "7f0e397bd07f595b0b0bc920fb0722",
      "9778397bd097c36b0b6fc9210c91aa",
      "97b6b97bd197c36c9210c9274c920e",
      "97bcf7f0e47f531b0b0bb0b6fb0722",
      "7f0e397bd07f595b0b0bc920fb0722",
      "9778397bd097c36b0b6fc9210c8dc2",
      "9778397bd097c36c9210c9274c920e",
      "97b6b7f0e47f531b0723b0b6fb0722",
      "7f0e37f5307f595b0b0bc920fb0722",
      "7f0e397bd097c36b0b6fc9210c8dc2",
      "9778397bd097c36b0b70c9274c91aa",
      "97b6b7f0e47f531b0723b0b6fb0721",
      "7f0e37f1487f595b0b0bb0b6fb0722",
      "7f0e397bd097c35b0b6fc9210c8dc2",
      "9778397bd097c36b0b6fc9274c91aa",
      "97b6b7f0e47f531b0723b0b6fb0721",
      "7f0e27f1487f595b0b0bb0b6fb0722",
      "7f0e397bd097c35b0b6fc920fb0722",
      "9778397bd097c36b0b6fc9274c91aa",
      "97b6b7f0e47f531b0723b0b6fb0721",
      "7f0e27f1487f531b0b0bb0b6fb0722",
      "7f0e397bd097c35b0b6fc920fb0722",
      "9778397bd097c36b0b6fc9274c91aa",
      "97b6b7f0e47f531b0723b0b6fb0721",
      "7f0e27f1487f531b0b0bb0b6fb0722",
      "7f0e397bd097c35b0b6fc920fb0722",
      "9778397bd097c36b0b6fc9274c91aa",
      "97b6b7f0e47f531b0723b0b6fb0721",
      "7f0e27f1487f531b0b0bb0b6fb0722",
      "7f0e397bd07f595b0b0bc920fb0722",
      "9778397bd097c36b0b6fc9274c91aa",
      "97b6b7f0e47f531b0723b0787b0721",
      "7f0e27f0e47f531b0b0bb0b6fb0722",
      "7f0e397bd07f595b0b0bc920fb0722",
      "9778397bd097c36b0b6fc9210c91aa",
      "97b6b7f0e47f149b0723b0787b0721",
      "7f0e27f0e47f531b0723b0b6fb0722",
      "7f0e397bd07f595b0b0bc920fb0722",
      "9778397bd097c36b0b6fc9210c8dc2",
      "977837f0e37f149b0723b0787b0721",
      "7f07e7f0e47f531b0723b0b6fb0722",
      "7f0e37f5307f595b0b0bc920fb0722",
      "7f0e397bd097c35b0b6fc9210c8dc2",
      "977837f0e37f14998082b0787b0721",
      "7f07e7f0e47f531b0723b0b6fb0721",
      "7f0e37f1487f595b0b0bb0b6fb0722",
      "7f0e397bd097c35b0b6fc9210c8dc2",
      "977837f0e37f14998082b0787b06bd",
      "7f07e7f0e47f531b0723b0b6fb0721",
      "7f0e27f1487f531b0b0bb0b6fb0722",
      "7f0e397bd097c35b0b6fc920fb0722",
      "977837f0e37f14998082b0787b06bd",
      "7f07e7f0e47f531b0723b0b6fb0721",
      "7f0e27f1487f531b0b0bb0b6fb0722",
      "7f0e397bd097c35b0b6fc920fb0722",
      "977837f0e37f14998082b0787b06bd",
      "7f07e7f0e47f531b0723b0b6fb0721",
      "7f0e27f1487f531b0b0bb0b6fb0722",
      "7f0e397bd07f595b0b0bc920fb0722",
      "977837f0e37f14998082b0787b06bd",
      "7f07e7f0e47f531b0723b0b6fb0721",
      "7f0e27f1487f531b0b0bb0b6fb0722",
      "7f0e397bd07f595b0b0bc920fb0722",
      "977837f0e37f14998082b0787b06bd",
      "7f07e7f0e47f149b0723b0787b0721",
      "7f0e27f0e47f531b0b0bb0b6fb0722",
      "7f0e397bd07f595b0b0bc920fb0722",
      "977837f0e37f14998082b0723b06bd",
      "7f07e7f0e37f149b0723b0787b0721",
      "7f0e27f0e47f531b0723b0b6fb0722",
      "7f0e397bd07f595b0b0bc920fb0722",
      "977837f0e37f14898082b0723b02d5",
      "7ec967f0e37f14998082b0787b0721",
      "7f07e7f0e47f531b0723b0b6fb0722",
      "7f0e37f1487f595b0b0bb0b6fb0722",
      "7f0e37f0e37f14898082b0723b02d5",
      "7ec967f0e37f14998082b0787b0721",
      "7f07e7f0e47f531b0723b0b6fb0722",
      "7f0e37f1487f531b0b0bb0b6fb0722",
      "7f0e37f0e37f14898082b0723b02d5",
      "7ec967f0e37f14998082b0787b06bd",
      "7f07e7f0e47f531b0723b0b6fb0721",
      "7f0e37f1487f531b0b0bb0b6fb0722",
      "7f0e37f0e37f14898082b072297c35",
      "7ec967f0e37f14998082b0787b06bd",
      "7f07e7f0e47f531b0723b0b6fb0721",
      "7f0e27f1487f531b0b0bb0b6fb0722",
      "7f0e37f0e37f14898082b072297c35",
      "7ec967f0e37f14998082b0787b06bd",
      "7f07e7f0e47f531b0723b0b6fb0721",
      "7f0e27f1487f531b0b0bb0b6fb0722",
      "7f0e37f0e366aa89801eb072297c35",
      "7ec967f0e37f14998082b0787b06bd",
      "7f07e7f0e47f149b0723b0787b0721",
      "7f0e27f1487f531b0b0bb0b6fb0722",
      "7f0e37f0e366aa89801eb072297c35",
      "7ec967f0e37f14998082b0723b06bd",
      "7f07e7f0e47f149b0723b0787b0721",
      "7f0e27f0e47f531b0723b0b6fb0722",
      "7f0e37f0e366aa89801eb072297c35",
      "7ec967f0e37f14998082b0723b06bd",
      "7f07e7f0e37f14998083b0787b0721",
      "7f0e27f0e47f531b0723b0b6fb0722",
      "7f0e37f0e366aa89801eb072297c35",
      "7ec967f0e37f14898082b0723b02d5",
      "7f07e7f0e37f14998082b0787b0721",
      "7f07e7f0e47f531b0723b0b6fb0722",
      "7f0e36665b66aa89801e9808297c35",
      "665f67f0e37f14898082b0723b02d5",
      "7ec967f0e37f14998082b0787b0721",
      "7f07e7f0e47f531b0723b0b6fb0722",
      "7f0e36665b66a449801e9808297c35",
      "665f67f0e37f14898082b0723b02d5",
      "7ec967f0e37f14998082b0787b06bd",
      "7f07e7f0e47f531b0723b0b6fb0721",
      "7f0e36665b66a449801e9808297c35",
      "665f67f0e37f14898082b072297c35",
      "7ec967f0e37f14998082b0787b06bd",
      "7f07e7f0e47f531b0723b0b6fb0721",
      "7f0e26665b66a449801e9808297c35",
      "665f67f0e37f1489801eb072297c35",
      "7ec967f0e37f14998082b0787b06bd",
      "7f07e7f0e47f531b0723b0b6fb0721",
      "7f0e27f1487f531b0b0bb0b6fb0722"
    ],
    /**
        * 数字转中文速查表
        * @Array Of Property
        * @trans ['日','一','二','三','四','五','六','七','八','九','十']
        * @return Cn string
        */
    nStr1: ["日", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"],
    /**
        * 日期转农历称呼速查表
        * @Array Of Property
        * @trans ['初','十','廿','卅']
        * @return Cn string
        */
    nStr2: ["初", "十", "廿", "卅"],
    /**
        * 月份转农历称呼速查表
        * @Array Of Property
        * @trans ['正','一','二','三','四','五','六','七','八','九','十','冬','腊']
        * @return Cn string
        */
    nStr3: ["正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "冬", "腊"],
    /**
        * 返回农历y年一整年的总天数
        * @param lunar Year
        * @return Number
        * @eg:var count = calendar.lYearDays(1987) ;//count=387
        */
    lYearDays: function(y2) {
      var i2;
      var sum = 348;
      for (i2 = 32768; i2 > 8; i2 >>= 1) {
        sum += this.lunarInfo[y2 - 1900] & i2 ? 1 : 0;
      }
      return sum + this.leapDays(y2);
    },
    /**
        * 返回农历y年闰月是哪个月；若y年没有闰月 则返回0
        * @param lunar Year
        * @return Number (0-12)
        * @eg:var leapMonth = calendar.leapMonth(1987) ;//leapMonth=6
        */
    leapMonth: function(y2) {
      return this.lunarInfo[y2 - 1900] & 15;
    },
    /**
        * 返回农历y年闰月的天数 若该年没有闰月则返回0
        * @param lunar Year
        * @return Number (0、29、30)
        * @eg:var leapMonthDay = calendar.leapDays(1987) ;//leapMonthDay=29
        */
    leapDays: function(y2) {
      if (this.leapMonth(y2)) {
        return this.lunarInfo[y2 - 1900] & 65536 ? 30 : 29;
      }
      return 0;
    },
    /**
        * 返回农历y年m月（非闰月）的总天数，计算m为闰月时的天数请使用leapDays方法
        * @param lunar Year
        * @return Number (-1、29、30)
        * @eg:var MonthDay = calendar.monthDays(1987,9) ;//MonthDay=29
        */
    monthDays: function(y2, m2) {
      if (m2 > 12 || m2 < 1) {
        return -1;
      }
      return this.lunarInfo[y2 - 1900] & 65536 >> m2 ? 30 : 29;
    },
    /**
        * 返回公历(!)y年m月的天数
        * @param solar Year
        * @return Number (-1、28、29、30、31)
        * @eg:var solarMonthDay = calendar.leapDays(1987) ;//solarMonthDay=30
        */
    solarDays: function(y2, m2) {
      if (m2 > 12 || m2 < 1) {
        return -1;
      }
      var ms = m2 - 1;
      if (ms == 1) {
        return y2 % 4 == 0 && y2 % 100 != 0 || y2 % 400 == 0 ? 29 : 28;
      } else {
        return this.solarMonth[ms];
      }
    },
    /**
       * 农历年份转换为干支纪年
       * @param  lYear 农历年的年份数
       * @return Cn string
       */
    toGanZhiYear: function(lYear) {
      var ganKey = (lYear - 3) % 10;
      var zhiKey = (lYear - 3) % 12;
      if (ganKey == 0)
        ganKey = 10;
      if (zhiKey == 0)
        zhiKey = 12;
      return this.Gan[ganKey - 1] + this.Zhi[zhiKey - 1];
    },
    /**
       * 公历月、日判断所属星座
       * @param  cMonth [description]
       * @param  cDay [description]
       * @return Cn string
       */
    toAstro: function(cMonth, cDay) {
      var s2 = "魔羯水瓶双鱼白羊金牛双子巨蟹狮子处女天秤天蝎射手魔羯";
      var arr = [20, 19, 21, 21, 21, 22, 23, 23, 23, 23, 22, 22];
      return s2.substr(cMonth * 2 - (cDay < arr[cMonth - 1] ? 2 : 0), 2) + "座";
    },
    /**
        * 传入offset偏移量返回干支
        * @param offset 相对甲子的偏移量
        * @return Cn string
        */
    toGanZhi: function(offset) {
      return this.Gan[offset % 10] + this.Zhi[offset % 12];
    },
    /**
        * 传入公历(!)y年获得该年第n个节气的公历日期
        * @param y公历年(1900-2100)；n二十四节气中的第几个节气(1~24)；从n=1(小寒)算起
        * @return day Number
        * @eg:var _24 = calendar.getTerm(1987,3) ;//_24=4;意即1987年2月4日立春
        */
    getTerm: function(y2, n2) {
      if (y2 < 1900 || y2 > 2100) {
        return -1;
      }
      if (n2 < 1 || n2 > 24) {
        return -1;
      }
      var _table = this.sTermInfo[y2 - 1900];
      var _info = [
        parseInt("0x" + _table.substr(0, 5)).toString(),
        parseInt("0x" + _table.substr(5, 5)).toString(),
        parseInt("0x" + _table.substr(10, 5)).toString(),
        parseInt("0x" + _table.substr(15, 5)).toString(),
        parseInt("0x" + _table.substr(20, 5)).toString(),
        parseInt("0x" + _table.substr(25, 5)).toString()
      ];
      var _calday = [
        _info[0].substr(0, 1),
        _info[0].substr(1, 2),
        _info[0].substr(3, 1),
        _info[0].substr(4, 2),
        _info[1].substr(0, 1),
        _info[1].substr(1, 2),
        _info[1].substr(3, 1),
        _info[1].substr(4, 2),
        _info[2].substr(0, 1),
        _info[2].substr(1, 2),
        _info[2].substr(3, 1),
        _info[2].substr(4, 2),
        _info[3].substr(0, 1),
        _info[3].substr(1, 2),
        _info[3].substr(3, 1),
        _info[3].substr(4, 2),
        _info[4].substr(0, 1),
        _info[4].substr(1, 2),
        _info[4].substr(3, 1),
        _info[4].substr(4, 2),
        _info[5].substr(0, 1),
        _info[5].substr(1, 2),
        _info[5].substr(3, 1),
        _info[5].substr(4, 2)
      ];
      return parseInt(_calday[n2 - 1]);
    },
    /**
        * 传入农历数字月份返回汉语通俗表示法
        * @param lunar month
        * @return Cn string
        * @eg:var cnMonth = calendar.toChinaMonth(12) ;//cnMonth='腊月'
        */
    toChinaMonth: function(m2) {
      if (m2 > 12 || m2 < 1) {
        return -1;
      }
      var s2 = this.nStr3[m2 - 1];
      s2 += "月";
      return s2;
    },
    /**
        * 传入农历日期数字返回汉字表示法
        * @param lunar day
        * @return Cn string
        * @eg:var cnDay = calendar.toChinaDay(21) ;//cnMonth='廿一'
        */
    toChinaDay: function(d2) {
      var s2;
      switch (d2) {
        case 10:
          s2 = "初十";
          break;
        case 20:
          s2 = "二十";
          break;
        case 30:
          s2 = "三十";
          break;
        default:
          s2 = this.nStr2[Math.floor(d2 / 10)];
          s2 += this.nStr1[d2 % 10];
      }
      return s2;
    },
    /**
        * 年份转生肖[!仅能大致转换] => 精确划分生肖分界线是“立春”
        * @param y year
        * @return Cn string
        * @eg:var animal = calendar.getAnimal(1987) ;//animal='兔'
        */
    getAnimal: function(y2) {
      return this.Animals[(y2 - 4) % 12];
    },
    /**
        * 传入阳历年月日获得详细的公历、农历object信息 <=>JSON
        * @param y  solar year
        * @param m  solar month
        * @param d  solar day
        * @return JSON object
        * @eg:__f__('log','at uni_modules/uni-calendar/components/uni-calendar/calendar.js:381',calendar.solar2lunar(1987,11,01));
        */
    solar2lunar: function(y2, m2, d2) {
      if (y2 < 1900 || y2 > 2100) {
        return -1;
      }
      if (y2 == 1900 && m2 == 1 && d2 < 31) {
        return -1;
      }
      if (!y2) {
        var objDate = /* @__PURE__ */ new Date();
      } else {
        var objDate = new Date(y2, parseInt(m2) - 1, d2);
      }
      var i2;
      var leap = 0;
      var temp = 0;
      var y2 = objDate.getFullYear();
      var m2 = objDate.getMonth() + 1;
      var d2 = objDate.getDate();
      var offset = (Date.UTC(objDate.getFullYear(), objDate.getMonth(), objDate.getDate()) - Date.UTC(1900, 0, 31)) / 864e5;
      for (i2 = 1900; i2 < 2101 && offset > 0; i2++) {
        temp = this.lYearDays(i2);
        offset -= temp;
      }
      if (offset < 0) {
        offset += temp;
        i2--;
      }
      var isTodayObj = /* @__PURE__ */ new Date();
      var isToday = false;
      if (isTodayObj.getFullYear() == y2 && isTodayObj.getMonth() + 1 == m2 && isTodayObj.getDate() == d2) {
        isToday = true;
      }
      var nWeek = objDate.getDay();
      var cWeek = this.nStr1[nWeek];
      if (nWeek == 0) {
        nWeek = 7;
      }
      var year = i2;
      var leap = this.leapMonth(i2);
      var isLeap = false;
      for (i2 = 1; i2 < 13 && offset > 0; i2++) {
        if (leap > 0 && i2 == leap + 1 && isLeap == false) {
          --i2;
          isLeap = true;
          temp = this.leapDays(year);
        } else {
          temp = this.monthDays(year, i2);
        }
        if (isLeap == true && i2 == leap + 1) {
          isLeap = false;
        }
        offset -= temp;
      }
      if (offset == 0 && leap > 0 && i2 == leap + 1) {
        if (isLeap) {
          isLeap = false;
        } else {
          isLeap = true;
          --i2;
        }
      }
      if (offset < 0) {
        offset += temp;
        --i2;
      }
      var month = i2;
      var day = offset + 1;
      var sm = m2 - 1;
      var gzY = this.toGanZhiYear(year);
      var firstNode = this.getTerm(y2, m2 * 2 - 1);
      var secondNode = this.getTerm(y2, m2 * 2);
      var gzM = this.toGanZhi((y2 - 1900) * 12 + m2 + 11);
      if (d2 >= firstNode) {
        gzM = this.toGanZhi((y2 - 1900) * 12 + m2 + 12);
      }
      var isTerm = false;
      var Term = null;
      if (firstNode == d2) {
        isTerm = true;
        Term = this.solarTerm[m2 * 2 - 2];
      }
      if (secondNode == d2) {
        isTerm = true;
        Term = this.solarTerm[m2 * 2 - 1];
      }
      var dayCyclical = Date.UTC(y2, sm, 1, 0, 0, 0, 0) / 864e5 + 25567 + 10;
      var gzD = this.toGanZhi(dayCyclical + d2 - 1);
      var astro = this.toAstro(m2, d2);
      return { "lYear": year, "lMonth": month, "lDay": day, "Animal": this.getAnimal(year), "IMonthCn": (isLeap ? "闰" : "") + this.toChinaMonth(month), "IDayCn": this.toChinaDay(day), "cYear": y2, "cMonth": m2, "cDay": d2, "gzYear": gzY, "gzMonth": gzM, "gzDay": gzD, "isToday": isToday, "isLeap": isLeap, "nWeek": nWeek, "ncWeek": "星期" + cWeek, "isTerm": isTerm, "Term": Term, "astro": astro };
    },
    /**
        * 传入农历年月日以及传入的月份是否闰月获得详细的公历、农历object信息 <=>JSON
        * @param y  lunar year
        * @param m  lunar month
        * @param d  lunar day
        * @param isLeapMonth  lunar month is leap or not.[如果是农历闰月第四个参数赋值true即可]
        * @return JSON object
        * @eg:__f__('log','at uni_modules/uni-calendar/components/uni-calendar/calendar.js:500',calendar.lunar2solar(1987,9,10));
        */
    lunar2solar: function(y2, m2, d2, isLeapMonth) {
      var isLeapMonth = !!isLeapMonth;
      var leapMonth = this.leapMonth(y2);
      this.leapDays(y2);
      if (isLeapMonth && leapMonth != m2) {
        return -1;
      }
      if (y2 == 2100 && m2 == 12 && d2 > 1 || y2 == 1900 && m2 == 1 && d2 < 31) {
        return -1;
      }
      var day = this.monthDays(y2, m2);
      var _day = day;
      if (isLeapMonth) {
        _day = this.leapDays(y2, m2);
      }
      if (y2 < 1900 || y2 > 2100 || d2 > _day) {
        return -1;
      }
      var offset = 0;
      for (var i2 = 1900; i2 < y2; i2++) {
        offset += this.lYearDays(i2);
      }
      var leap = 0;
      var isAdd = false;
      for (var i2 = 1; i2 < m2; i2++) {
        leap = this.leapMonth(y2);
        if (!isAdd) {
          if (leap <= i2 && leap > 0) {
            offset += this.leapDays(y2);
            isAdd = true;
          }
        }
        offset += this.monthDays(y2, i2);
      }
      if (isLeapMonth) {
        offset += day;
      }
      var stmap = Date.UTC(1900, 1, 30, 0, 0, 0);
      var calObj = new Date((offset + d2 - 31) * 864e5 + stmap);
      var cY = calObj.getUTCFullYear();
      var cM = calObj.getUTCMonth() + 1;
      var cD = calObj.getUTCDate();
      return this.solar2lunar(cY, cM, cD);
    }
  };
  class Calendar {
    constructor({
      date,
      selected,
      startDate,
      endDate,
      range
    } = {}) {
      this.date = this.getDate(/* @__PURE__ */ new Date());
      this.selected = selected || [];
      this.startDate = startDate;
      this.endDate = endDate;
      this.range = range;
      this.cleanMultipleStatus();
      this.weeks = {};
    }
    /**
     * 设置日期
     * @param {Object} date
     */
    setDate(date) {
      this.selectDate = this.getDate(date);
      this._getWeek(this.selectDate.fullDate);
    }
    /**
     * 清理多选状态
     */
    cleanMultipleStatus() {
      this.multipleStatus = {
        before: "",
        after: "",
        data: []
      };
    }
    /**
     * 重置开始日期
     */
    resetSatrtDate(startDate) {
      this.startDate = startDate;
    }
    /**
     * 重置结束日期
     */
    resetEndDate(endDate) {
      this.endDate = endDate;
    }
    /**
     * 获取任意时间
     */
    getDate(date, AddDayCount = 0, str = "day") {
      if (!date) {
        date = /* @__PURE__ */ new Date();
      }
      if (typeof date !== "object") {
        date = date.replace(/-/g, "/");
      }
      const dd = new Date(date);
      switch (str) {
        case "day":
          dd.setDate(dd.getDate() + AddDayCount);
          break;
        case "month":
          if (dd.getDate() === 31 && AddDayCount > 0) {
            dd.setDate(dd.getDate() + AddDayCount);
          } else {
            const preMonth = dd.getMonth();
            dd.setMonth(preMonth + AddDayCount);
            const nextMonth = dd.getMonth();
            if (AddDayCount < 0 && preMonth !== 0 && nextMonth - preMonth > AddDayCount) {
              dd.setMonth(nextMonth + (nextMonth - preMonth + AddDayCount));
            }
            if (AddDayCount > 0 && nextMonth - preMonth > AddDayCount) {
              dd.setMonth(nextMonth - (nextMonth - preMonth - AddDayCount));
            }
          }
          break;
        case "year":
          dd.setFullYear(dd.getFullYear() + AddDayCount);
          break;
      }
      const y2 = dd.getFullYear();
      const m2 = dd.getMonth() + 1 < 10 ? "0" + (dd.getMonth() + 1) : dd.getMonth() + 1;
      const d2 = dd.getDate() < 10 ? "0" + dd.getDate() : dd.getDate();
      return {
        fullDate: y2 + "-" + m2 + "-" + d2,
        year: y2,
        month: m2,
        date: d2,
        day: dd.getDay()
      };
    }
    /**
     * 获取上月剩余天数
     */
    _getLastMonthDays(firstDay, full) {
      let dateArr = [];
      for (let i2 = firstDay; i2 > 0; i2--) {
        const beforeDate = new Date(full.year, full.month - 1, -i2 + 1).getDate();
        dateArr.push({
          date: beforeDate,
          month: full.month - 1,
          lunar: this.getlunar(full.year, full.month - 1, beforeDate),
          disable: true
        });
      }
      return dateArr;
    }
    /**
     * 获取本月天数
     */
    _currentMonthDys(dateData, full) {
      let dateArr = [];
      let fullDate = this.date.fullDate;
      for (let i2 = 1; i2 <= dateData; i2++) {
        let nowDate = full.year + "-" + (full.month < 10 ? full.month : full.month) + "-" + (i2 < 10 ? "0" + i2 : i2);
        let isDay = fullDate === nowDate;
        let info = this.selected && this.selected.find((item) => {
          if (this.dateEqual(nowDate, item.date)) {
            return item;
          }
        });
        let disableBefore = true;
        let disableAfter = true;
        if (this.startDate) {
          disableBefore = this.dateCompare(this.startDate, nowDate);
        }
        if (this.endDate) {
          disableAfter = this.dateCompare(nowDate, this.endDate);
        }
        let multiples = this.multipleStatus.data;
        let checked = false;
        let multiplesStatus = -1;
        if (this.range) {
          if (multiples) {
            multiplesStatus = multiples.findIndex((item) => {
              return this.dateEqual(item, nowDate);
            });
          }
          if (multiplesStatus !== -1) {
            checked = true;
          }
        }
        let data = {
          fullDate: nowDate,
          year: full.year,
          date: i2,
          multiple: this.range ? checked : false,
          beforeMultiple: this.dateEqual(this.multipleStatus.before, nowDate),
          afterMultiple: this.dateEqual(this.multipleStatus.after, nowDate),
          month: full.month,
          lunar: this.getlunar(full.year, full.month, i2),
          disable: !(disableBefore && disableAfter),
          isDay
        };
        if (info) {
          data.extraInfo = info;
        }
        dateArr.push(data);
      }
      return dateArr;
    }
    /**
     * 获取下月天数
     */
    _getNextMonthDays(surplus, full) {
      let dateArr = [];
      for (let i2 = 1; i2 < surplus + 1; i2++) {
        dateArr.push({
          date: i2,
          month: Number(full.month) + 1,
          lunar: this.getlunar(full.year, Number(full.month) + 1, i2),
          disable: true
        });
      }
      return dateArr;
    }
    /**
     * 获取当前日期详情
     * @param {Object} date
     */
    getInfo(date) {
      if (!date) {
        date = /* @__PURE__ */ new Date();
      }
      const dateInfo = this.canlender.find((item) => item.fullDate === this.getDate(date).fullDate);
      return dateInfo;
    }
    /**
     * 比较时间大小
     */
    dateCompare(startDate, endDate) {
      startDate = new Date(startDate.replace("-", "/").replace("-", "/"));
      endDate = new Date(endDate.replace("-", "/").replace("-", "/"));
      if (startDate <= endDate) {
        return true;
      } else {
        return false;
      }
    }
    /**
     * 比较时间是否相等
     */
    dateEqual(before, after) {
      before = new Date(before.replace("-", "/").replace("-", "/"));
      after = new Date(after.replace("-", "/").replace("-", "/"));
      if (before.getTime() - after.getTime() === 0) {
        return true;
      } else {
        return false;
      }
    }
    /**
     * 获取日期范围内所有日期
     * @param {Object} begin
     * @param {Object} end
     */
    geDateAll(begin, end) {
      var arr = [];
      var ab = begin.split("-");
      var ae = end.split("-");
      var db = /* @__PURE__ */ new Date();
      db.setFullYear(ab[0], ab[1] - 1, ab[2]);
      var de = /* @__PURE__ */ new Date();
      de.setFullYear(ae[0], ae[1] - 1, ae[2]);
      var unixDb = db.getTime() - 24 * 60 * 60 * 1e3;
      var unixDe = de.getTime() - 24 * 60 * 60 * 1e3;
      for (var k = unixDb; k <= unixDe; ) {
        k = k + 24 * 60 * 60 * 1e3;
        arr.push(this.getDate(new Date(parseInt(k))).fullDate);
      }
      return arr;
    }
    /**
     * 计算阴历日期显示
     */
    getlunar(year, month, date) {
      return calendar.solar2lunar(year, month, date);
    }
    /**
     * 设置打点
     */
    setSelectInfo(data, value) {
      this.selected = value;
      this._getWeek(data);
    }
    /**
     *  获取多选状态
     */
    setMultiple(fullDate) {
      let {
        before,
        after
      } = this.multipleStatus;
      if (!this.range)
        return;
      if (before && after) {
        this.multipleStatus.before = "";
        this.multipleStatus.after = "";
        this.multipleStatus.data = [];
      } else {
        if (!before) {
          this.multipleStatus.before = fullDate;
        } else {
          this.multipleStatus.after = fullDate;
          if (this.dateCompare(this.multipleStatus.before, this.multipleStatus.after)) {
            this.multipleStatus.data = this.geDateAll(this.multipleStatus.before, this.multipleStatus.after);
          } else {
            this.multipleStatus.data = this.geDateAll(this.multipleStatus.after, this.multipleStatus.before);
          }
        }
      }
      this._getWeek(fullDate);
    }
    /**
     * 获取每周数据
     * @param {Object} dateData
     */
    _getWeek(dateData) {
      const {
        year,
        month
      } = this.getDate(dateData);
      let firstDay = new Date(year, month - 1, 1).getDay();
      let currentDay = new Date(year, month, 0).getDate();
      let dates = {
        lastMonthDays: this._getLastMonthDays(firstDay, this.getDate(dateData)),
        // 上个月末尾几天
        currentMonthDys: this._currentMonthDys(currentDay, this.getDate(dateData)),
        // 本月天数
        nextMonthDays: [],
        // 下个月开始几天
        weeks: []
      };
      let canlender = [];
      const surplus = 42 - (dates.lastMonthDays.length + dates.currentMonthDys.length);
      dates.nextMonthDays = this._getNextMonthDays(surplus, this.getDate(dateData));
      canlender = canlender.concat(dates.lastMonthDays, dates.currentMonthDys, dates.nextMonthDays);
      let weeks = {};
      for (let i2 = 0; i2 < canlender.length; i2++) {
        if (i2 % 7 === 0) {
          weeks[parseInt(i2 / 7)] = new Array(7);
        }
        weeks[parseInt(i2 / 7)][i2 % 7] = canlender[i2];
      }
      this.canlender = canlender;
      this.weeks = weeks;
    }
    //静态方法
    // static init(date) {
    // 	if (!this.instance) {
    // 		this.instance = new Calendar(date);
    // 	}
    // 	return this.instance;
    // }
  }
  const isObject = (val) => val !== null && typeof val === "object";
  const defaultDelimiters = ["{", "}"];
  class BaseFormatter {
    constructor() {
      this._caches = /* @__PURE__ */ Object.create(null);
    }
    interpolate(message, values, delimiters = defaultDelimiters) {
      if (!values) {
        return [message];
      }
      let tokens = this._caches[message];
      if (!tokens) {
        tokens = parse(message, delimiters);
        this._caches[message] = tokens;
      }
      return compile(tokens, values);
    }
  }
  const RE_TOKEN_LIST_VALUE = /^(?:\d)+/;
  const RE_TOKEN_NAMED_VALUE = /^(?:\w)+/;
  function parse(format, [startDelimiter, endDelimiter]) {
    const tokens = [];
    let position = 0;
    let text = "";
    while (position < format.length) {
      let char = format[position++];
      if (char === startDelimiter) {
        if (text) {
          tokens.push({ type: "text", value: text });
        }
        text = "";
        let sub = "";
        char = format[position++];
        while (char !== void 0 && char !== endDelimiter) {
          sub += char;
          char = format[position++];
        }
        const isClosed = char === endDelimiter;
        const type = RE_TOKEN_LIST_VALUE.test(sub) ? "list" : isClosed && RE_TOKEN_NAMED_VALUE.test(sub) ? "named" : "unknown";
        tokens.push({ value: sub, type });
      } else {
        text += char;
      }
    }
    text && tokens.push({ type: "text", value: text });
    return tokens;
  }
  function compile(tokens, values) {
    const compiled = [];
    let index = 0;
    const mode = Array.isArray(values) ? "list" : isObject(values) ? "named" : "unknown";
    if (mode === "unknown") {
      return compiled;
    }
    while (index < tokens.length) {
      const token = tokens[index];
      switch (token.type) {
        case "text":
          compiled.push(token.value);
          break;
        case "list":
          compiled.push(values[parseInt(token.value, 10)]);
          break;
        case "named":
          if (mode === "named") {
            compiled.push(values[token.value]);
          } else {
            {
              console.warn(`Type of token '${token.type}' and format of value '${mode}' don't match!`);
            }
          }
          break;
        case "unknown":
          {
            console.warn(`Detect 'unknown' type of token!`);
          }
          break;
      }
      index++;
    }
    return compiled;
  }
  const LOCALE_ZH_HANS = "zh-Hans";
  const LOCALE_ZH_HANT = "zh-Hant";
  const LOCALE_EN = "en";
  const LOCALE_FR = "fr";
  const LOCALE_ES = "es";
  const hasOwnProperty = Object.prototype.hasOwnProperty;
  const hasOwn = (val, key) => hasOwnProperty.call(val, key);
  const defaultFormatter = new BaseFormatter();
  function include(str, parts) {
    return !!parts.find((part) => str.indexOf(part) !== -1);
  }
  function startsWith(str, parts) {
    return parts.find((part) => str.indexOf(part) === 0);
  }
  function normalizeLocale(locale, messages) {
    if (!locale) {
      return;
    }
    locale = locale.trim().replace(/_/g, "-");
    if (messages && messages[locale]) {
      return locale;
    }
    locale = locale.toLowerCase();
    if (locale === "chinese") {
      return LOCALE_ZH_HANS;
    }
    if (locale.indexOf("zh") === 0) {
      if (locale.indexOf("-hans") > -1) {
        return LOCALE_ZH_HANS;
      }
      if (locale.indexOf("-hant") > -1) {
        return LOCALE_ZH_HANT;
      }
      if (include(locale, ["-tw", "-hk", "-mo", "-cht"])) {
        return LOCALE_ZH_HANT;
      }
      return LOCALE_ZH_HANS;
    }
    let locales = [LOCALE_EN, LOCALE_FR, LOCALE_ES];
    if (messages && Object.keys(messages).length > 0) {
      locales = Object.keys(messages);
    }
    const lang = startsWith(locale, locales);
    if (lang) {
      return lang;
    }
  }
  class I18n {
    constructor({ locale, fallbackLocale, messages, watcher, formater: formater2 }) {
      this.locale = LOCALE_EN;
      this.fallbackLocale = LOCALE_EN;
      this.message = {};
      this.messages = {};
      this.watchers = [];
      if (fallbackLocale) {
        this.fallbackLocale = fallbackLocale;
      }
      this.formater = formater2 || defaultFormatter;
      this.messages = messages || {};
      this.setLocale(locale || LOCALE_EN);
      if (watcher) {
        this.watchLocale(watcher);
      }
    }
    setLocale(locale) {
      const oldLocale = this.locale;
      this.locale = normalizeLocale(locale, this.messages) || this.fallbackLocale;
      if (!this.messages[this.locale]) {
        this.messages[this.locale] = {};
      }
      this.message = this.messages[this.locale];
      if (oldLocale !== this.locale) {
        this.watchers.forEach((watcher) => {
          watcher(this.locale, oldLocale);
        });
      }
    }
    getLocale() {
      return this.locale;
    }
    watchLocale(fn) {
      const index = this.watchers.push(fn) - 1;
      return () => {
        this.watchers.splice(index, 1);
      };
    }
    add(locale, message, override = true) {
      const curMessages = this.messages[locale];
      if (curMessages) {
        if (override) {
          Object.assign(curMessages, message);
        } else {
          Object.keys(message).forEach((key) => {
            if (!hasOwn(curMessages, key)) {
              curMessages[key] = message[key];
            }
          });
        }
      } else {
        this.messages[locale] = message;
      }
    }
    f(message, values, delimiters) {
      return this.formater.interpolate(message, values, delimiters).join("");
    }
    t(key, locale, values) {
      let message = this.message;
      if (typeof locale === "string") {
        locale = normalizeLocale(locale, this.messages);
        locale && (message = this.messages[locale]);
      } else {
        values = locale;
      }
      if (!hasOwn(message, key)) {
        console.warn(`Cannot translate the value of keypath ${key}. Use the value of keypath as default.`);
        return key;
      }
      return this.formater.interpolate(message[key], values).join("");
    }
  }
  function watchAppLocale(appVm, i18n) {
    if (appVm.$watchLocale) {
      appVm.$watchLocale((newLocale) => {
        i18n.setLocale(newLocale);
      });
    } else {
      appVm.$watch(() => appVm.$locale, (newLocale) => {
        i18n.setLocale(newLocale);
      });
    }
  }
  function getDefaultLocale() {
    if (typeof uni !== "undefined" && uni.getLocale) {
      return uni.getLocale();
    }
    if (typeof global !== "undefined" && global.getLocale) {
      return global.getLocale();
    }
    return LOCALE_EN;
  }
  function initVueI18n(locale, messages = {}, fallbackLocale, watcher) {
    if (typeof locale !== "string") {
      const options = [
        messages,
        locale
      ];
      locale = options[0];
      messages = options[1];
    }
    if (typeof locale !== "string") {
      locale = getDefaultLocale();
    }
    if (typeof fallbackLocale !== "string") {
      fallbackLocale = typeof __uniConfig !== "undefined" && __uniConfig.fallbackLocale || LOCALE_EN;
    }
    const i18n = new I18n({
      locale,
      fallbackLocale,
      messages,
      watcher
    });
    let t2 = (key, values) => {
      if (typeof getApp !== "function") {
        t2 = function(key2, values2) {
          return i18n.t(key2, values2);
        };
      } else {
        let isWatchedAppLocale = false;
        t2 = function(key2, values2) {
          const appVm = getApp().$vm;
          if (appVm) {
            appVm.$locale;
            if (!isWatchedAppLocale) {
              isWatchedAppLocale = true;
              watchAppLocale(appVm, i18n);
            }
          }
          return i18n.t(key2, values2);
        };
      }
      return t2(key, values);
    };
    return {
      i18n,
      f(message, values, delimiters) {
        return i18n.f(message, values, delimiters);
      },
      t(key, values) {
        return t2(key, values);
      },
      add(locale2, message, override = true) {
        return i18n.add(locale2, message, override);
      },
      watch(fn) {
        return i18n.watchLocale(fn);
      },
      getLocale() {
        return i18n.getLocale();
      },
      setLocale(newLocale) {
        return i18n.setLocale(newLocale);
      }
    };
  }
  const en = {
    "uni-calender.ok": "ok",
    "uni-calender.cancel": "cancel",
    "uni-calender.today": "today",
    "uni-calender.MON": "MON",
    "uni-calender.TUE": "TUE",
    "uni-calender.WED": "WED",
    "uni-calender.THU": "THU",
    "uni-calender.FRI": "FRI",
    "uni-calender.SAT": "SAT",
    "uni-calender.SUN": "SUN"
  };
  const zhHans = {
    "uni-calender.ok": "确定",
    "uni-calender.cancel": "取消",
    "uni-calender.today": "今日",
    "uni-calender.SUN": "日",
    "uni-calender.MON": "一",
    "uni-calender.TUE": "二",
    "uni-calender.WED": "三",
    "uni-calender.THU": "四",
    "uni-calender.FRI": "五",
    "uni-calender.SAT": "六"
  };
  const zhHant = {
    "uni-calender.ok": "確定",
    "uni-calender.cancel": "取消",
    "uni-calender.today": "今日",
    "uni-calender.SUN": "日",
    "uni-calender.MON": "一",
    "uni-calender.TUE": "二",
    "uni-calender.WED": "三",
    "uni-calender.THU": "四",
    "uni-calender.FRI": "五",
    "uni-calender.SAT": "六"
  };
  const i18nMessages = {
    en,
    "zh-Hans": zhHans,
    "zh-Hant": zhHant
  };
  const { t: t$2 } = initVueI18n(i18nMessages);
  const _sfc_main$8 = {
    emits: ["change"],
    props: {
      weeks: {
        type: Object,
        default() {
          return {};
        }
      },
      calendar: {
        type: Object,
        default: () => {
          return {};
        }
      },
      selected: {
        type: Array,
        default: () => {
          return [];
        }
      },
      lunar: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      todayText() {
        return t$2("uni-calender.today");
      }
    },
    methods: {
      choiceDate(weeks) {
        this.$emit("change", weeks);
      }
    }
  };
  function _sfc_render$7(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: vue.normalizeClass(["uni-calendar-item__weeks-box", {
          "uni-calendar-item--disable": $props.weeks.disable,
          "uni-calendar-item--isDay": $props.calendar.fullDate === $props.weeks.fullDate && $props.weeks.isDay,
          "uni-calendar-item--checked": $props.calendar.fullDate === $props.weeks.fullDate && !$props.weeks.isDay,
          "uni-calendar-item--before-checked": $props.weeks.beforeMultiple,
          "uni-calendar-item--multiple": $props.weeks.multiple,
          "uni-calendar-item--after-checked": $props.weeks.afterMultiple
        }]),
        onClick: _cache[0] || (_cache[0] = ($event) => $options.choiceDate($props.weeks))
      },
      [
        vue.createElementVNode("view", { class: "uni-calendar-item__weeks-box-item" }, [
          $props.selected && $props.weeks.extraInfo ? (vue.openBlock(), vue.createElementBlock("text", {
            key: 0,
            class: "uni-calendar-item__weeks-box-circle"
          })) : vue.createCommentVNode("v-if", true),
          vue.createElementVNode(
            "text",
            {
              class: vue.normalizeClass(["uni-calendar-item__weeks-box-text", {
                "uni-calendar-item--isDay-text": $props.weeks.isDay,
                "uni-calendar-item--isDay": $props.calendar.fullDate === $props.weeks.fullDate && $props.weeks.isDay,
                "uni-calendar-item--checked": $props.calendar.fullDate === $props.weeks.fullDate && !$props.weeks.isDay,
                "uni-calendar-item--before-checked": $props.weeks.beforeMultiple,
                "uni-calendar-item--multiple": $props.weeks.multiple,
                "uni-calendar-item--after-checked": $props.weeks.afterMultiple,
                "uni-calendar-item--disable": $props.weeks.disable
              }])
            },
            vue.toDisplayString($props.weeks.date),
            3
            /* TEXT, CLASS */
          ),
          !$props.lunar && !$props.weeks.extraInfo && $props.weeks.isDay ? (vue.openBlock(), vue.createElementBlock(
            "text",
            {
              key: 1,
              class: vue.normalizeClass(["uni-calendar-item__weeks-lunar-text", {
                "uni-calendar-item--isDay-text": $props.weeks.isDay,
                "uni-calendar-item--isDay": $props.calendar.fullDate === $props.weeks.fullDate && $props.weeks.isDay,
                "uni-calendar-item--checked": $props.calendar.fullDate === $props.weeks.fullDate && !$props.weeks.isDay,
                "uni-calendar-item--before-checked": $props.weeks.beforeMultiple,
                "uni-calendar-item--multiple": $props.weeks.multiple,
                "uni-calendar-item--after-checked": $props.weeks.afterMultiple
              }])
            },
            vue.toDisplayString($options.todayText),
            3
            /* TEXT, CLASS */
          )) : vue.createCommentVNode("v-if", true),
          $props.lunar && !$props.weeks.extraInfo ? (vue.openBlock(), vue.createElementBlock(
            "text",
            {
              key: 2,
              class: vue.normalizeClass(["uni-calendar-item__weeks-lunar-text", {
                "uni-calendar-item--isDay-text": $props.weeks.isDay,
                "uni-calendar-item--isDay": $props.calendar.fullDate === $props.weeks.fullDate && $props.weeks.isDay,
                "uni-calendar-item--checked": $props.calendar.fullDate === $props.weeks.fullDate && !$props.weeks.isDay,
                "uni-calendar-item--before-checked": $props.weeks.beforeMultiple,
                "uni-calendar-item--multiple": $props.weeks.multiple,
                "uni-calendar-item--after-checked": $props.weeks.afterMultiple,
                "uni-calendar-item--disable": $props.weeks.disable
              }])
            },
            vue.toDisplayString($props.weeks.isDay ? $options.todayText : $props.weeks.lunar.IDayCn === "初一" ? $props.weeks.lunar.IMonthCn : $props.weeks.lunar.IDayCn),
            3
            /* TEXT, CLASS */
          )) : vue.createCommentVNode("v-if", true),
          $props.weeks.extraInfo && $props.weeks.extraInfo.info ? (vue.openBlock(), vue.createElementBlock(
            "text",
            {
              key: 3,
              class: vue.normalizeClass(["uni-calendar-item__weeks-lunar-text", {
                "uni-calendar-item--extra": $props.weeks.extraInfo.info,
                "uni-calendar-item--isDay-text": $props.weeks.isDay,
                "uni-calendar-item--isDay": $props.calendar.fullDate === $props.weeks.fullDate && $props.weeks.isDay,
                "uni-calendar-item--checked": $props.calendar.fullDate === $props.weeks.fullDate && !$props.weeks.isDay,
                "uni-calendar-item--before-checked": $props.weeks.beforeMultiple,
                "uni-calendar-item--multiple": $props.weeks.multiple,
                "uni-calendar-item--after-checked": $props.weeks.afterMultiple,
                "uni-calendar-item--disable": $props.weeks.disable
              }])
            },
            vue.toDisplayString($props.weeks.extraInfo.info),
            3
            /* TEXT, CLASS */
          )) : vue.createCommentVNode("v-if", true)
        ])
      ],
      2
      /* CLASS */
    );
  }
  const CalendarItem = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["render", _sfc_render$7], ["__scopeId", "data-v-65626c58"], ["__file", "D:/coding/sf_enginering/Squad/Squad/uni_modules/uni-calendar/components/uni-calendar/uni-calendar-item.vue"]]);
  const { t: t$1 } = initVueI18n(i18nMessages);
  const _sfc_main$7 = {
    components: {
      CalendarItem
    },
    emits: ["close", "confirm", "change", "monthSwitch"],
    props: {
      date: {
        type: String,
        default: ""
      },
      selected: {
        type: Array,
        default() {
          return [];
        }
      },
      lunar: {
        type: Boolean,
        default: false
      },
      startDate: {
        type: String,
        default: ""
      },
      endDate: {
        type: String,
        default: ""
      },
      range: {
        type: Boolean,
        default: false
      },
      insert: {
        type: Boolean,
        default: true
      },
      showMonth: {
        type: Boolean,
        default: true
      },
      clearDate: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {
        show: false,
        weeks: [],
        calendar: {},
        nowDate: "",
        aniMaskShow: false
      };
    },
    computed: {
      /**
       * for i18n
       */
      okText() {
        return t$1("uni-calender.ok");
      },
      cancelText() {
        return t$1("uni-calender.cancel");
      },
      todayText() {
        return t$1("uni-calender.today");
      },
      monText() {
        return t$1("uni-calender.MON");
      },
      TUEText() {
        return t$1("uni-calender.TUE");
      },
      WEDText() {
        return t$1("uni-calender.WED");
      },
      THUText() {
        return t$1("uni-calender.THU");
      },
      FRIText() {
        return t$1("uni-calender.FRI");
      },
      SATText() {
        return t$1("uni-calender.SAT");
      },
      SUNText() {
        return t$1("uni-calender.SUN");
      }
    },
    watch: {
      date(newVal) {
        this.init(newVal);
      },
      startDate(val) {
        this.cale.resetSatrtDate(val);
        this.cale.setDate(this.nowDate.fullDate);
        this.weeks = this.cale.weeks;
      },
      endDate(val) {
        this.cale.resetEndDate(val);
        this.cale.setDate(this.nowDate.fullDate);
        this.weeks = this.cale.weeks;
      },
      selected(newVal) {
        this.cale.setSelectInfo(this.nowDate.fullDate, newVal);
        this.weeks = this.cale.weeks;
      }
    },
    created() {
      this.cale = new Calendar({
        selected: this.selected,
        startDate: this.startDate,
        endDate: this.endDate,
        range: this.range
      });
      this.init(this.date);
    },
    methods: {
      // 取消穿透
      clean() {
      },
      bindDateChange(e2) {
        const value = e2.detail.value + "-1";
        this.setDate(value);
        const { year, month } = this.cale.getDate(value);
        this.$emit("monthSwitch", {
          year,
          month
        });
      },
      /**
       * 初始化日期显示
       * @param {Object} date
       */
      init(date) {
        this.cale.setDate(date);
        this.weeks = this.cale.weeks;
        this.nowDate = this.calendar = this.cale.getInfo(date);
      },
      /**
       * 打开日历弹窗
       */
      open() {
        if (this.clearDate && !this.insert) {
          this.cale.cleanMultipleStatus();
          this.init(this.date);
        }
        this.show = true;
        this.$nextTick(() => {
          setTimeout(() => {
            this.aniMaskShow = true;
          }, 50);
        });
      },
      /**
       * 关闭日历弹窗
       */
      close() {
        this.aniMaskShow = false;
        this.$nextTick(() => {
          setTimeout(() => {
            this.show = false;
            this.$emit("close");
          }, 300);
        });
      },
      /**
       * 确认按钮
       */
      confirm() {
        this.setEmit("confirm");
        this.close();
      },
      /**
       * 变化触发
       */
      change() {
        if (!this.insert)
          return;
        this.setEmit("change");
      },
      /**
       * 选择月份触发
       */
      monthSwitch() {
        let {
          year,
          month
        } = this.nowDate;
        this.$emit("monthSwitch", {
          year,
          month: Number(month)
        });
      },
      /**
       * 派发事件
       * @param {Object} name
       */
      setEmit(name) {
        let {
          year,
          month,
          date,
          fullDate,
          lunar,
          extraInfo
        } = this.calendar;
        this.$emit(name, {
          range: this.cale.multipleStatus,
          year,
          month,
          date,
          fulldate: fullDate,
          lunar,
          extraInfo: extraInfo || {}
        });
      },
      /**
       * 选择天触发
       * @param {Object} weeks
       */
      choiceDate(weeks) {
        if (weeks.disable)
          return;
        this.calendar = weeks;
        this.cale.setMultiple(this.calendar.fullDate);
        this.weeks = this.cale.weeks;
        this.change();
      },
      /**
       * 回到今天
       */
      backToday() {
        const nowYearMonth = `${this.nowDate.year}-${this.nowDate.month}`;
        const date = this.cale.getDate(/* @__PURE__ */ new Date());
        const todayYearMonth = `${date.year}-${date.month}`;
        this.init(date.fullDate);
        if (nowYearMonth !== todayYearMonth) {
          this.monthSwitch();
        }
        this.change();
      },
      /**
       * 上个月
       */
      pre() {
        const preDate = this.cale.getDate(this.nowDate.fullDate, -1, "month").fullDate;
        this.setDate(preDate);
        this.monthSwitch();
      },
      /**
       * 下个月
       */
      next() {
        const nextDate = this.cale.getDate(this.nowDate.fullDate, 1, "month").fullDate;
        this.setDate(nextDate);
        this.monthSwitch();
      },
      /**
       * 设置日期
       * @param {Object} date
       */
      setDate(date) {
        this.cale.setDate(date);
        this.weeks = this.cale.weeks;
        this.nowDate = this.cale.getInfo(date);
      }
    }
  };
  function _sfc_render$6(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_calendar_item = vue.resolveComponent("calendar-item");
    return vue.openBlock(), vue.createElementBlock("view", { class: "uni-calendar" }, [
      !$props.insert && $data.show ? (vue.openBlock(), vue.createElementBlock(
        "view",
        {
          key: 0,
          class: vue.normalizeClass(["uni-calendar__mask", { "uni-calendar--mask-show": $data.aniMaskShow }]),
          onClick: _cache[0] || (_cache[0] = (...args) => $options.clean && $options.clean(...args))
        },
        null,
        2
        /* CLASS */
      )) : vue.createCommentVNode("v-if", true),
      $props.insert || $data.show ? (vue.openBlock(), vue.createElementBlock(
        "view",
        {
          key: 1,
          class: vue.normalizeClass(["uni-calendar__content", { "uni-calendar--fixed": !$props.insert, "uni-calendar--ani-show": $data.aniMaskShow }])
        },
        [
          !$props.insert ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "uni-calendar__header uni-calendar--fixed-top"
          }, [
            vue.createElementVNode("view", {
              class: "uni-calendar__header-btn-box",
              onClick: _cache[1] || (_cache[1] = (...args) => $options.close && $options.close(...args))
            }, [
              vue.createElementVNode(
                "text",
                { class: "uni-calendar__header-text uni-calendar--fixed-width" },
                vue.toDisplayString($options.cancelText),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", {
              class: "uni-calendar__header-btn-box",
              onClick: _cache[2] || (_cache[2] = (...args) => $options.confirm && $options.confirm(...args))
            }, [
              vue.createElementVNode(
                "text",
                { class: "uni-calendar__header-text uni-calendar--fixed-width" },
                vue.toDisplayString($options.okText),
                1
                /* TEXT */
              )
            ])
          ])) : vue.createCommentVNode("v-if", true),
          vue.createElementVNode("view", { class: "uni-calendar__header" }, [
            vue.createElementVNode("view", {
              class: "uni-calendar__header-btn-box",
              onClick: _cache[3] || (_cache[3] = vue.withModifiers((...args) => $options.pre && $options.pre(...args), ["stop"]))
            }, [
              vue.createElementVNode("view", { class: "uni-calendar__header-btn uni-calendar--left" })
            ]),
            vue.createElementVNode("picker", {
              mode: "date",
              value: $props.date,
              fields: "month",
              onChange: _cache[4] || (_cache[4] = (...args) => $options.bindDateChange && $options.bindDateChange(...args))
            }, [
              vue.createElementVNode(
                "text",
                { class: "uni-calendar__header-text" },
                vue.toDisplayString(($data.nowDate.year || "") + " / " + ($data.nowDate.month || "")),
                1
                /* TEXT */
              )
            ], 40, ["value"]),
            vue.createElementVNode("view", {
              class: "uni-calendar__header-btn-box",
              onClick: _cache[5] || (_cache[5] = vue.withModifiers((...args) => $options.next && $options.next(...args), ["stop"]))
            }, [
              vue.createElementVNode("view", { class: "uni-calendar__header-btn uni-calendar--right" })
            ]),
            vue.createElementVNode(
              "text",
              {
                class: "uni-calendar__backtoday",
                onClick: _cache[6] || (_cache[6] = (...args) => $options.backToday && $options.backToday(...args))
              },
              vue.toDisplayString($options.todayText),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "uni-calendar__box" }, [
            $props.showMonth ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "uni-calendar__box-bg"
            }, [
              vue.createElementVNode(
                "text",
                { class: "uni-calendar__box-bg-text" },
                vue.toDisplayString($data.nowDate.month),
                1
                /* TEXT */
              )
            ])) : vue.createCommentVNode("v-if", true),
            vue.createElementVNode("view", { class: "uni-calendar__weeks" }, [
              vue.createElementVNode("view", { class: "uni-calendar__weeks-day" }, [
                vue.createElementVNode(
                  "text",
                  { class: "uni-calendar__weeks-day-text" },
                  vue.toDisplayString($options.SUNText),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "uni-calendar__weeks-day" }, [
                vue.createElementVNode(
                  "text",
                  { class: "uni-calendar__weeks-day-text" },
                  vue.toDisplayString($options.monText),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "uni-calendar__weeks-day" }, [
                vue.createElementVNode(
                  "text",
                  { class: "uni-calendar__weeks-day-text" },
                  vue.toDisplayString($options.TUEText),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "uni-calendar__weeks-day" }, [
                vue.createElementVNode(
                  "text",
                  { class: "uni-calendar__weeks-day-text" },
                  vue.toDisplayString($options.WEDText),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "uni-calendar__weeks-day" }, [
                vue.createElementVNode(
                  "text",
                  { class: "uni-calendar__weeks-day-text" },
                  vue.toDisplayString($options.THUText),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "uni-calendar__weeks-day" }, [
                vue.createElementVNode(
                  "text",
                  { class: "uni-calendar__weeks-day-text" },
                  vue.toDisplayString($options.FRIText),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "uni-calendar__weeks-day" }, [
                vue.createElementVNode(
                  "text",
                  { class: "uni-calendar__weeks-day-text" },
                  vue.toDisplayString($options.SATText),
                  1
                  /* TEXT */
                )
              ])
            ]),
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($data.weeks, (item, weekIndex) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  class: "uni-calendar__weeks",
                  key: weekIndex
                }, [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList(item, (weeks, weeksIndex) => {
                      return vue.openBlock(), vue.createElementBlock("view", {
                        class: "uni-calendar__weeks-item",
                        key: weeksIndex
                      }, [
                        vue.createVNode(_component_calendar_item, {
                          class: "uni-calendar-item--hook",
                          weeks,
                          calendar: $data.calendar,
                          selected: $props.selected,
                          lunar: $props.lunar,
                          onChange: $options.choiceDate
                        }, null, 8, ["weeks", "calendar", "selected", "lunar", "onChange"])
                      ]);
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ],
        2
        /* CLASS */
      )) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const __easycom_1 = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["render", _sfc_render$6], ["__scopeId", "data-v-b6ab2cfb"], ["__file", "D:/coding/sf_enginering/Squad/Squad/uni_modules/uni-calendar/components/uni-calendar/uni-calendar.vue"]]);
  const CircleProps = {
    percent: {
      type: Number,
      default: 0
    },
    size: {
      type: String,
      default: "120px"
    },
    lineCap: {
      type: String,
      default: "round"
    },
    strokeWidth: {
      type: [String, Number],
      default: 6
    },
    strokeColor: {
      type: [String, Array],
      default: "#2db7f5"
    },
    trailWidth: {
      type: [String, Number],
      default: 6
    },
    trailColor: {
      type: String,
      default: "#ddd"
    },
    dashboard: Boolean,
    clockwise: {
      type: Boolean,
      default: true
    },
    duration: {
      type: Number,
      default: 300
    },
    max: {
      type: Number,
      default: 100
    },
    gapDegree: {
      type: Number,
      default: 90
    },
    gapPosition: {
      type: String,
      default: "bottom"
    },
    /**成功配置 暂未实现*/
    // success: {
    // 	type: Object
    // },
    canvas: Boolean
  };
  function getRect(selector, context, node = false) {
    if (context == null) {
      return Promise.reject("context is null");
    }
    if (context.context) {
      context = context.context;
    }
    return new Promise((resolve, reject) => {
      const dom = uni.createSelectorQuery().in(context).select(selector);
      const result = (rect) => {
        if (rect) {
          resolve(rect);
        } else {
          reject("no rect");
        }
      };
      if (!node) {
        dom.boundingClientRect(result).exec();
      } else {
        dom.fields({
          node: true,
          size: true,
          rect: true
        }, result).exec();
      }
    });
  }
  function canIUseCanvas2d() {
    return false;
  }
  let isCanvas2d = canIUseCanvas2d();
  async function getCanvas(canvasId, options) {
    let { context } = options;
    return getRect("#" + canvasId, context, isCanvas2d).then(({ node }) => {
      if (node) {
        return node;
      } else {
        isCanvas2d = false;
        const ctx = uni.createCanvasContext(canvasId, context);
        return {
          getContext(type) {
            if (type == "2d") {
              return ctx;
            }
          }
        };
      }
    });
  }
  function t(t2, e2) {
    if (!(t2 instanceof e2))
      throw new TypeError("Cannot call a class as a function");
  }
  function e(t2, e2) {
    for (var i2 = 0; e2.length > i2; i2++) {
      var n2 = e2[i2];
      n2.enumerable = n2.enumerable || false, n2.configurable = true, "value" in n2 && (n2.writable = true), Object.defineProperty(t2, n2.key, n2);
    }
  }
  function i(t2, i2, n2) {
    return i2 && e(t2.prototype, i2), n2 && e(t2, n2), Object.defineProperty(t2, "prototype", { writable: false }), t2;
  }
  function n(t2, e2) {
    return function(t3) {
      if (Array.isArray(t3))
        return t3;
    }(t2) || function(t3, e3) {
      var i2 = null == t3 ? null : "undefined" != typeof Symbol && t3[Symbol.iterator] || t3["@@iterator"];
      if (null == i2)
        return;
      var n2, r2, a2 = [], o2 = true, s2 = false;
      try {
        for (i2 = i2.call(t3); !(o2 = (n2 = i2.next()).done) && (a2.push(n2.value), !e3 || a2.length !== e3); o2 = true)
          ;
      } catch (t4) {
        s2 = true, r2 = t4;
      } finally {
        try {
          o2 || null == i2.return || i2.return();
        } finally {
          if (s2)
            throw r2;
        }
      }
      return a2;
    }(t2, e2) || r(t2, e2) || function() {
      throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }();
  }
  function r(t2, e2) {
    if (t2) {
      if ("string" == typeof t2)
        return a(t2, e2);
      var i2 = Object.prototype.toString.call(t2).slice(8, -1);
      return "Object" === i2 && t2.constructor && (i2 = t2.constructor.name), "Map" === i2 || "Set" === i2 ? Array.from(t2) : "Arguments" === i2 || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(i2) ? a(t2, e2) : void 0;
    }
  }
  function a(t2, e2) {
    (null == e2 || e2 > t2.length) && (e2 = t2.length);
    for (var i2 = 0, n2 = Array(e2); e2 > i2; i2++)
      n2[i2] = t2[i2];
    return n2;
  }
  var o = function(t2) {
    return /^#.{3,6}$/.test(t2) ? 4 === t2.length ? t2.substring(1).split("").map(function(t3) {
      return 17 * parseInt(t3, 16);
    }) : [t2.substring(1, 3), t2.substring(3, 5), t2.substring(5, 7)].map(function(t3) {
      return parseInt(t3, 16);
    }) : (formatAppLog("error", "at uni_modules/lime-circle/components/l-circle/circle.esm.js:1", "lime-circle: 渐变仅支持hex值"), [0, 0, 0]);
  }, s = function(t2) {
    return 1 === t2.length ? "0" + t2 : t2;
  }, u = function(t2, e2, i2) {
    var n2, r2, a2, u2, h2 = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : 1, c2 = [], l2 = [], f2 = function(t3) {
      return Math.pow(t3 / 255, h2);
    };
    for (t2 = o(t2).map(f2), e2 = o(e2).map(f2), n2 = 0; i2 > n2; n2++) {
      for (u2 = 1 - (a2 = n2 / (i2 - 1)), r2 = 0; 3 > r2; r2++)
        l2[r2] = s(Math.round(255 * Math.pow(t2[r2] * u2 + e2[r2] * a2, 1 / h2)).toString(16));
      c2.push("#" + l2.join(""));
    }
    return c2;
  };
  var h = function(t2, e2, i2, n2) {
    var r2 = 1e-6, a2 = 3 * t2 - 3 * i2 + 1, o2 = 3 * i2 - 6 * t2, s2 = 3 * t2, u2 = 3 * e2 - 3 * n2 + 1, h2 = 3 * n2 - 6 * e2, c2 = 3 * e2;
    function l2(t3) {
      return ((a2 * t3 + o2) * t3 + s2) * t3;
    }
    return function(t3) {
      return e3 = function(t4) {
        for (var e4, i3, n3, u3 = t4, h3 = 0; 8 > h3; h3++) {
          if (i3 = l2(u3) - t4, r2 > Math.abs(i3))
            return u3;
          if (r2 > Math.abs(e4 = (3 * a2 * (n3 = u3) + 2 * o2) * n3 + s2))
            break;
          u3 -= i3 / e4;
        }
        var c3 = 1, f2 = 0;
        for (u3 = t4; c3 > f2; ) {
          if (i3 = l2(u3) - t4, r2 > Math.abs(i3))
            return u3;
          i3 > 0 ? c3 = u3 : f2 = u3, u3 = (c3 + f2) / 2;
        }
        return u3;
      }(t3), ((u2 * e3 + h2) * e3 + c2) * e3;
      var e3;
    };
  }(0.25, 0.1, 0.25, 1), c = Symbol("tick"), l = Symbol("tick-handler"), f = Symbol("animations"), d = Symbol("start-times"), v = Symbol("pause-start"), m = Symbol("pause-time"), y = "undefined" != typeof requestAnimationFrame ? requestAnimationFrame : function(t2) {
    return setTimeout(t2, 1e3 / 60);
  }, g = "undefined" != typeof cancelAnimationFrame ? cancelAnimationFrame : function(t2) {
    clearTimeout(t2);
  }, p = function() {
    function e2() {
      t(this, e2), this.state = void 0, this.state = "Initiated", this[f] = /* @__PURE__ */ new Set(), this[d] = /* @__PURE__ */ new Map();
    }
    return i(e2, [{ key: "start", value: function() {
      var t2 = this;
      if ("Initiated" === this.state) {
        this.state = "Started";
        var e3 = Date.now();
        this[m] = 0, this[c] = function() {
          var i2, n2 = Date.now(), a2 = function(t3, e4) {
            var i3 = "undefined" != typeof Symbol && t3[Symbol.iterator] || t3["@@iterator"];
            if (!i3) {
              if (Array.isArray(t3) || (i3 = r(t3)) || e4 && t3 && "number" == typeof t3.length) {
                i3 && (t3 = i3);
                var n3 = 0, a3 = function() {
                };
                return { s: a3, n: function() {
                  return t3.length > n3 ? { done: false, value: t3[n3++] } : { done: true };
                }, e: function(t4) {
                  throw t4;
                }, f: a3 };
              }
              throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
            }
            var o3, s3 = true, u2 = false;
            return { s: function() {
              i3 = i3.call(t3);
            }, n: function() {
              var t4 = i3.next();
              return s3 = t4.done, t4;
            }, e: function(t4) {
              u2 = true, o3 = t4;
            }, f: function() {
              try {
                s3 || null == i3.return || i3.return();
              } finally {
                if (u2)
                  throw o3;
              }
            } };
          }(t2[f]);
          try {
            for (a2.s(); !(i2 = a2.n()).done; ) {
              var o2 = i2.value, s2 = void 0;
              (s2 = t2[d].get(o2) < e3 ? n2 - e3 - o2.delay - t2[m] : n2 - t2[d].get(o2) - o2.delay - t2[m]) > o2.duration && (t2[f].delete(o2), s2 = o2.duration), s2 > 0 && o2.run(s2);
            }
          } catch (t3) {
            a2.e(t3);
          } finally {
            a2.f();
          }
          t2[l] = y(t2[c]);
        }, this[c]();
      }
    } }, { key: "pause", value: function() {
      "Started" === this.state && (this.state = "Paused", this[v] = Date.now(), g(this[l]));
    } }, { key: "resume", value: function() {
      "Paused" === this.state && (this.state = "Started", this[m] += Date.now() - this[v], this[c]());
    } }, { key: "reset", value: function() {
      this.pause(), this.state = "Initiated", this[m] = 0, this[v] = 0, this[f] = /* @__PURE__ */ new Set(), this[d] = /* @__PURE__ */ new Map(), this[l] = null;
    } }, { key: "add", value: function(t2, e3) {
      2 > arguments.length && (e3 = Date.now()), this[f].add(t2), this[d].set(t2, e3);
    } }]), e2;
  }(), w = function() {
    function e2(i2, n2, r2, a2, o2, s2) {
      t(this, e2), this.startValue = void 0, this.endValue = void 0, this.duration = void 0, this.timingFunction = void 0, this.delay = void 0, this.template = void 0, o2 = o2 || function(t2) {
        return t2;
      }, s2 = s2 || function(t2) {
        return t2;
      }, this.startValue = i2, this.endValue = n2, this.duration = r2, this.timingFunction = o2, this.delay = a2, this.template = s2;
    }
    return i(e2, [{ key: "run", value: function(t2) {
      var e3 = this.endValue - this.startValue, i2 = this.timingFunction(t2 / this.duration);
      this.template(this.startValue + e3 * i2);
    } }]), e2;
  }(), b = Math.PI / 180, A = function() {
    function e2(i2, n2) {
      t(this, e2), this.canvas = void 0, this.context = void 0, this.current = 0, this.size = 0, this.pixelRatio = 1, this._isConicGradient = false, this._attrs = { percent: 0, size: 120, lineCap: "round", strokeWidth: 6, strokeColor: "#2db7f5", trailWidth: 6, trailColor: "#ddd", dashboard: false, clockwise: true, duration: 300, max: 100, beforeAnimate: true, animate: true, formatter: "{d}{d}.{d}{d}%", fontSize: "16px", showText: false, gapDegree: 90, gapPosition: "bottom" }, this._timer = void 0, this.startTime = 0, this.target = 0, this._colors = [], this._gradientColors = [], this._rAF = function(t2) {
      }, this._cAf = function(t2) {
      }, this.timeline = void 0, this.run = void 0, this.canvas = i2, this.run = n2.run, this.size = n2.size || 120, this.pixelRatio = n2.pixelRatio || 1, this.init(), this.initRaf(), this.timeline = new p();
    }
    return i(e2, [{ key: "init", value: function() {
      var t2 = this.size, e3 = this.pixelRatio;
      if (this.canvas) {
        this.canvas.width = t2 * e3, this.canvas.height = t2 * e3;
        var i2 = this.canvas.getContext("2d");
        this._isConicGradient = !!i2.createConicGradient, this.context = i2;
      }
    } }, { key: "initRaf", value: function() {
      var t2 = this.canvas;
      "undefined" != typeof window ? (this._rAF = window.requestAnimationFrame || function(t3) {
        return window.setTimeout(t3, 1e3 / 60);
      }, this._cAf = window.cancelAnimationFrame || function(t3) {
        window.clearTimeout(t3);
      }) : t2 && t2.requestAnimationFrame ? (this._rAF = t2.requestAnimationFrame, this._cAf = t2.cancelAnimationFrame) : (this._rAF = function(t3) {
        return setTimeout(t3, 16.7);
      }, this._cAf = function(t3) {
        clearTimeout(t3);
      });
    } }, { key: "setOption", value: function(t2) {
      Object.assign(this._attrs, t2);
    } }, { key: "set", value: function(t2, e3) {
      this._attrs[t2] = e3;
    } }, { key: "get", value: function(t2) {
      return this._attrs[t2] || this.canvas[t2];
    } }, { key: "play", value: function() {
      var t2 = this, e3 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : this.get("percent");
      this.target = Math.max(Math.min(e3, this.get("max") || 100), 0), this.createConicGradient(), this.timeline.start(), this.timeline.add(new w(this.current, e3, this.get("duration"), 0, h, function(e4) {
        t2.current = 1e-4 > e4 ? 0 : e4, t2.render(t2.current), t2.run(t2.current);
      }));
    } }, { key: "createConicGradient", value: function() {
      if (!this._isConicGradient) {
        var t2 = this._attrs.strokeColor;
        if ("string" != typeof t2 && this._colors != t2 && Array.isArray(t2)) {
          var e3 = n(this.getDeg(), 2), i2 = e3[0], r2 = e3[1];
          this._colors = t2, this._gradientColors = [];
          for (var a2 = r2 - i2, o2 = t2.length - 1, s2 = Math.floor(a2 / o2), h2 = 0; o2 > h2; h2++) {
            a2 -= s2, this._gradientColors = this._gradientColors.concat(u(t2[h2], t2[h2 + 1], h2 + 1 === o2 ? s2 + a2 : s2, 1));
          }
        }
      }
    } }, { key: "render", value: function() {
      var t2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0, e3 = this.context, i2 = this.size, n2 = this.pixelRatio, r2 = this.getSalce(), a2 = i2 / 2;
      e3.setTransform(1, 0, 0, 1, 0, 0), e3.clearRect(2 * -a2, 2 * -a2, 4 * i2, 4 * i2), e3.setTransform(r2 * n2, 0, 0, n2, a2 * n2, a2 * n2), this.drawTrail(a2), this.drawStroke(a2, t2), e3.draw && e3.draw();
    } }, { key: "drawArc", value: function(t2, e3, i2, n2, r2) {
      var a2 = arguments.length > 5 && void 0 !== arguments[5] ? arguments[5] : this._attrs.lineCap, o2 = this.context;
      o2.beginPath(), o2.lineCap = a2, o2.strokeStyle = e3, o2.lineWidth = i2, o2.arc(0, 0, t2, n2, r2), o2.stroke();
    } }, { key: "getSalce", value: function() {
      return this.get("clockwise") ? 1 : -1;
    } }, { key: "getDeg", value: function() {
      var t2 = this._attrs, e3 = t2.gapDegree;
      t2.dashboard || (e3 = 0);
      var i2 = (0 === e3 ? 0 : { bottom: 0, top: 180, left: 90, right: -90 }[t2.gapPosition]) + (e3 > 0 ? 90 + e3 / 2 : -90) + 0;
      return [i2, i2 + 360 * ((360 - e3) / 360)];
    } }, { key: "drawTrail", value: function(t2) {
      var e3 = this._attrs, i2 = e3.trailWidth, r2 = e3.trailColor, a2 = t2 - i2 / 2, o2 = n(this.getDeg(), 2);
      this.drawArc(a2, r2, i2, o2[0] * b, o2[1] * b);
    } }, { key: "drawStroke", value: function(t2) {
      var e3 = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0;
      if (e3) {
        var i2 = this._attrs, r2 = i2.strokeWidth, a2 = i2.strokeColor, o2 = i2.max, s2 = i2.dashboard, u2 = i2.lineCap, h2 = this.getDeg(), c2 = n(h2, 2), l2 = c2[0], f2 = c2[1], d2 = t2 - r2 / 2, v2 = Math.round((f2 - l2) / o2 * e3);
        if ("string" == typeof a2 || this._isConicGradient)
          if (Array.isArray(a2) && this._isConicGradient) {
            var m2 = this.context, y2 = m2.createConicGradient(l2, 0, 0);
            a2.forEach(function(t3, e4) {
              y2.addColorStop(e4 / (a2.length - 1), t3);
            }), this.drawArc(d2, y2, r2, l2 * b, (v2 + l2) * b);
          } else
            this.drawArc(d2, a2, r2, l2 * b, (v2 + l2) * b);
        else
          for (var g2 = 0; v2 > g2; g2++)
            this.drawArc(d2, this._gradientColors[g2], r2, (g2 + l2) * b, (g2 + 1 + l2) * b, s2 || f2 != v2 + l2 ? u2 : "butt");
      }
    } }]), e2;
  }();
  function cubicBezier(p1x, p1y, p2x, p2y) {
    const ZERO_LIMIT = 1e-6;
    const ax = 3 * p1x - 3 * p2x + 1;
    const bx = 3 * p2x - 6 * p1x;
    const cx = 3 * p1x;
    const ay = 3 * p1y - 3 * p2y + 1;
    const by = 3 * p2y - 6 * p1y;
    const cy = 3 * p1y;
    function sampleCurveDerivativeX(t2) {
      return (3 * ax * t2 + 2 * bx) * t2 + cx;
    }
    function sampleCurveX(t2) {
      return ((ax * t2 + bx) * t2 + cx) * t2;
    }
    function sampleCurveY(t2) {
      return ((ay * t2 + by) * t2 + cy) * t2;
    }
    function solveCurveX(x) {
      let t2 = x;
      let derivative;
      let x2;
      for (let i2 = 0; i2 < 8; i2++) {
        x2 = sampleCurveX(t2) - x;
        if (Math.abs(x2) < ZERO_LIMIT) {
          return t2;
        }
        derivative = sampleCurveDerivativeX(t2);
        if (Math.abs(derivative) < ZERO_LIMIT) {
          break;
        }
        t2 -= x2 / derivative;
      }
      let t1 = 1;
      let t0 = 0;
      t2 = x;
      while (t1 > t0) {
        x2 = sampleCurveX(t2) - x;
        if (Math.abs(x2) < ZERO_LIMIT) {
          return t2;
        }
        if (x2 > 0) {
          t1 = t2;
        } else {
          t0 = t2;
        }
        t2 = (t1 + t0) / 2;
      }
      return t2;
    }
    return function(x) {
      return sampleCurveY(solveCurveX(x));
    };
  }
  let ease = cubicBezier(0.25, 0.1, 0.25, 1);
  const TICK = Symbol("tick");
  const TICK_HANDLER = Symbol("tick-handler");
  const ANIMATIONS = Symbol("animations");
  const START_TIMES = Symbol("start-times");
  const PAUSE_START = Symbol("pause-start");
  const PAUSE_TIME = Symbol("pause-time");
  const _raf = typeof requestAnimationFrame !== "undefined" ? requestAnimationFrame : function(cb) {
    return setTimeout(cb, 1e3 / 60);
  };
  const _caf = typeof cancelAnimationFrame !== "undefined" ? cancelAnimationFrame : function(id) {
    clearTimeout(id);
  };
  class Timeline {
    constructor() {
      this.state = "Initiated";
      this[ANIMATIONS] = /* @__PURE__ */ new Set();
      this[START_TIMES] = /* @__PURE__ */ new Map();
    }
    start() {
      if (!(this.state === "Initiated"))
        return;
      this.state = "Started";
      let startTime = Date.now();
      this[PAUSE_TIME] = 0;
      this[TICK] = () => {
        let now = Date.now();
        this[ANIMATIONS].forEach((animation) => {
          let t2;
          if (this[START_TIMES].get(animation) < startTime) {
            t2 = now - startTime - animation.delay - this[PAUSE_TIME];
          } else {
            t2 = now - this[START_TIMES].get(animation) - animation.delay - this[PAUSE_TIME];
          }
          if (t2 > animation.duration) {
            this[ANIMATIONS].delete(animation);
            t2 = animation.duration;
          }
          if (t2 > 0)
            animation.run(t2);
        });
        this[TICK_HANDLER] = _raf(this[TICK]);
      };
      this[TICK]();
    }
    pause() {
      if (!(this.state === "Started"))
        return;
      this.state = "Paused";
      this[PAUSE_START] = Date.now();
      _caf(this[TICK_HANDLER]);
    }
    resume() {
      if (!(this.state === "Paused"))
        return;
      this.state = "Started";
      this[PAUSE_TIME] += Date.now() - this[PAUSE_START];
      this[TICK]();
    }
    reset() {
      this.pause();
      this.state = "Initiated";
      this[PAUSE_TIME] = 0;
      this[PAUSE_START] = 0;
      this[ANIMATIONS] = /* @__PURE__ */ new Set();
      this[START_TIMES] = /* @__PURE__ */ new Map();
      this[TICK_HANDLER] = null;
    }
    add(animation, startTime) {
      if (arguments.length < 2)
        startTime = Date.now();
      this[ANIMATIONS].add(animation);
      this[START_TIMES].set(animation, startTime);
    }
  }
  class Animation {
    constructor(startValue, endValue, duration, delay, timingFunction, template) {
      timingFunction = timingFunction || ((v2) => v2);
      template = template || ((v2) => v2);
      this.startValue = startValue;
      this.endValue = endValue;
      this.duration = duration;
      this.timingFunction = timingFunction;
      this.delay = delay;
      this.template = template;
    }
    run(time) {
      let range = this.endValue - this.startValue;
      let progress = time / this.duration;
      if (progress != 1)
        progress = this.timingFunction(progress);
      this.template(this.startValue + range * progress);
    }
  }
  function useTransition(percent, options) {
    const current = vue.ref(0);
    const { immediate, duration = 300 } = options;
    let tl = null;
    let timer = -1;
    const isFunction = typeof percent === "function";
    vue.watch(isFunction ? percent : () => percent.value, (v2) => {
      if (tl == null) {
        tl = new Timeline();
      }
      tl.start();
      tl.add(
        new Animation(
          current.value,
          v2,
          duration,
          0,
          ease,
          (nowValue) => {
            current.value = nowValue;
            clearTimeout(timer);
            if (current.value == v2) {
              timer = setTimeout(() => {
                tl == null ? void 0 : tl.pause();
                tl = null;
              }, duration);
            }
          }
        )
      );
    }, { immediate });
    return current;
  }
  function isNumeric(value) {
    return /^(-)?\d+(\.\d+)?$/.test(value);
  }
  function isDef(value) {
    return value !== void 0 && value !== null;
  }
  function addUnit(value) {
    if (!isDef(value)) {
      return null;
    }
    value = String(value);
    return isNumeric(value) ? `${value}px` : value;
  }
  function isString(str) {
    return typeof str == "string";
  }
  function unitConvert(value, base = 0) {
    if (isNumeric(value)) {
      return Number(value);
    }
    if (isString(value)) {
      const reg = /^-?([0-9]+)?([.]{1}[0-9]+){0,1}(em|rpx|px|%)$/g;
      const results = reg.exec(value);
      if (!value || !results) {
        return 0;
      }
      const unit = results[3];
      const _value = parseFloat(value);
      if (unit === "rpx") {
        return uni.upx2px(_value);
      }
      if (unit === "px") {
        return _value * 1;
      }
      if (unit == "%") {
        return _value / 100 * base;
      }
    }
    return 0;
  }
  function getCircle(size, lineWidth) {
    const s2 = unitConvert(size);
    const w2 = unitConvert(lineWidth);
    const c2 = (s2 - w2) / 2;
    const r2 = s2 / 2 - w2;
    return {
      s: s2,
      w: w2,
      c: c2,
      r: r2
    };
  }
  function getMaskStyle(radius = 0) {
    return `radial-gradient(transparent ${radius - 0.5}px, #000 ${radius}px)`;
  }
  function getCircleStyle(name, size, percent, gapDegree, gapPosition, strokeColor, strokeWidth) {
    const positionDeg = gapDegree === 0 ? 0 : {
      bottom: 0,
      top: 180,
      left: 90,
      right: -90
    }[gapPosition];
    const rotateDeg = gapDegree > 0 ? 90 + gapDegree / 2 : -90;
    const offsetDeg = 90;
    const circle = getCircle(size, strokeWidth);
    const perimeter = (360 - gapDegree) / 360 * percent * 100;
    const startDeg = positionDeg + rotateDeg + offsetDeg;
    const mask = getMaskStyle(circle.r);
    let background = "";
    let startColor = "";
    let endColor = "";
    if (isString(strokeColor)) {
      startColor = strokeColor;
      endColor = strokeColor;
      background = `conic-gradient(from ${startDeg}deg, ${startColor} 0%, ${startColor} ${perimeter}%, transparent ${perimeter}%, transparent 100%)`;
    } else if (Array.isArray(strokeColor)) {
      background = `conic-gradient(from ${startDeg}deg, transparent 0%,`;
      const len = strokeColor.length;
      for (let i2 = 0; i2 < len; i2++) {
        const color = strokeColor[i2];
        if (i2 === 0) {
          background += `${color} 0%,`;
          startColor = color;
        } else {
          background += `${color} ${perimeter * (i2 + 1) / len}%,`;
        }
        if (i2 == len - 1) {
          endColor = color;
        }
      }
      background += `transparent ${perimeter}%, transparent 100%)`;
    }
    return {
      color: startColor,
      [`--l-circle-${name}-cap-start`]: `${startDeg}deg`,
      [`--l-circle-${name}-cap-color-end`]: endColor,
      // [`--l-circle-${name}-cap-end`]: `calc(var(--l-circle-percent2) * ${perimeter} * 360deg + ${startDeg}deg)`,
      [`--l-circle-${name}-cap-end`]: `${perimeter / 100 * 360 + startDeg}deg`,
      [`--l-circle-${name}-cap-size`]: `${strokeWidth / 2}px`,
      mask,
      "-webkit-mask": mask,
      "--l-background": background
    };
  }
  const _sfc_main$6 = vue.defineComponent({
    name: "l-circle",
    props: CircleProps,
    emits: ["update:current"],
    setup(props, { emit }) {
      const context = vue.getCurrentInstance().proxy;
      const useCanvas = vue.ref(props.canvas);
      const canvasId = `l-circle-${context.uid}`;
      let circleCanvas = null;
      const percent = vue.ref(0);
      const offsetTop = vue.ref(0);
      const current = useTransition(percent, {
        duration: props.duration
      });
      const styles = vue.computed(() => ({
        width: addUnit(props.size),
        height: addUnit(props.size),
        "--l-circle-offset-top": !useCanvas.value && offsetTop.value
        // '--l-circle-percent': `${Math.min(props.percent, props.max) * ratio.value}%`,
        // '--l-circle-percent2': `${Math.min(props.percent, props.max) * ratio.value / 100}`,
      }));
      const classes = vue.computed(() => {
        const { clockwise, lineCap } = props;
        return lineCap ? `is-${lineCap} ` : " " + !clockwise && !useCanvas.value && `clockwise`;
      });
      const widths = vue.computed(() => {
        return [
          unitConvert(props.trailWidth),
          unitConvert(props.strokeWidth)
        ];
      });
      const trailStyles = vue.computed(() => {
        const { size, trailColor, dashboard, gapDegree, gapPosition } = props;
        return getCircleStyle("trail", size, 1, dashboard ? gapDegree : 0, gapPosition, trailColor, widths.value[0]);
      });
      const strokeStyles = vue.computed(() => {
        const { size, strokeColor, dashboard, max, gapDegree, gapPosition } = props;
        return getCircleStyle("stroke", size, Math.min(current.value / props.max, 1), dashboard ? gapDegree : 0, gapPosition, strokeColor, widths.value[1]);
      });
      const stopPercent = vue.watch(() => props.percent, (v2) => {
        percent.value = Math.min(v2, props.max);
        circleCanvas && circleCanvas.play(v2);
      });
      const stopCurrent = vue.watch(current, (v2) => {
        emit("update:current", v2.toFixed(2));
      });
      const getProps = () => {
        return Object.assign({}, props, { trailWidth: widths.value[0], strokeWidth: widths.value[1] });
      };
      vue.onMounted(() => {
        getRect(".check", context).then((res) => {
          useCanvas.value = !(res.height > 0 && !props.canvas);
          if (useCanvas.value) {
            setTimeout(() => {
              getCanvas(canvasId, { context }).then((res2) => {
                circleCanvas = new A(res2, {
                  size: unitConvert(props.size),
                  run: (v2) => current.value = v2,
                  pixelRatio: isCanvas2d ? uni.getSystemInfoSync().pixelRatio : 1
                });
                circleCanvas.setOption(getProps());
                circleCanvas.play(props.percent);
              });
            }, 50);
          }
          percent.value = props.percent;
        });
      });
      vue.onUnmounted(() => {
        stopPercent();
        stopCurrent();
      });
      return {
        useCanvas,
        canvasId,
        classes,
        styles,
        trailStyles,
        strokeStyles,
        current
      };
    }
  });
  function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      "view",
      {
        class: vue.normalizeClass(["l-circle", [{ clockwise: !_ctx.clockwise && !_ctx.useCanvas }, ["is-" + _ctx.lineCap]]]),
        style: vue.normalizeStyle([_ctx.styles])
      },
      [
        vue.createElementVNode("view", { class: "check" }),
        !_ctx.useCanvas ? (vue.openBlock(), vue.createElementBlock(
          "view",
          {
            key: 0,
            class: "l-circle__trail",
            style: vue.normalizeStyle([_ctx.trailStyles])
          },
          [
            vue.createElementVNode("text", { class: "cap start" }),
            vue.createElementVNode("text", { class: "cap end" })
          ],
          4
          /* STYLE */
        )) : vue.createCommentVNode("v-if", true),
        !_ctx.useCanvas ? (vue.openBlock(), vue.createElementBlock(
          "view",
          {
            key: 1,
            class: "l-circle__stroke",
            style: vue.normalizeStyle([_ctx.strokeStyles])
          },
          [
            vue.createElementVNode("view", { class: "l-circle__stroke-line" }),
            _ctx.current ? (vue.openBlock(), vue.createElementBlock("text", {
              key: 0,
              class: "cap start"
            })) : vue.createCommentVNode("v-if", true),
            _ctx.current ? (vue.openBlock(), vue.createElementBlock("text", {
              key: 1,
              class: "cap end"
            })) : vue.createCommentVNode("v-if", true)
          ],
          4
          /* STYLE */
        )) : vue.createCommentVNode("v-if", true),
        _ctx.useCanvas ? (vue.openBlock(), vue.createElementBlock("canvas", {
          key: 2,
          type: "2d",
          "canvas-id": _ctx.canvasId,
          id: _ctx.canvasId,
          class: "l-circle__canvas"
        }, null, 8, ["canvas-id", "id"])) : vue.createCommentVNode("v-if", true),
        vue.createElementVNode("view", { class: "l-circle__inner" }, [
          vue.renderSlot(_ctx.$slots, "default", {}, void 0, true)
        ])
      ],
      6
      /* CLASS, STYLE */
    );
  }
  const LCircle = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$5], ["__scopeId", "data-v-a96e7be9"], ["__file", "D:/coding/sf_enginering/Squad/Squad/uni_modules/lime-circle/components/l-circle/l-circle.vue"]]);
  const _imports_0 = "/static/icon/shot_sport.png";
  const _imports_1 = "/static/icon/dropdown.png";
  const add_icon = "/static/icon/add.png";
  const delete_icon = "/static/icon/delete.png";
  const column_bar = "/static/icon/columnbar.png";
  const _sfc_main$5 = {
    __name: "Home",
    setup(__props, { expose: __expose }) {
      __expose();
      const target = vue.ref(50);
      const modelVale = vue.ref(0);
      const target_eat_percent = vue.ref(50);
      const tab = vue.ref("plan");
      const activeButton = vue.ref("all");
      const selectedGoal = vue.ref("");
      const selectedType = vue.ref("");
      const selectedDifficulty = vue.ref("");
      const showMyplan = vue.ref(true);
      const showMyeat = vue.ref(false);
      const today_left_eat = vue.ref(2e3);
      const goals = vue.ref([
        { value: "减脂", text: "减脂" },
        { value: "增肌", text: "增肌" },
        { value: "塑形", text: "塑形" }
      ]);
      const types = vue.ref([
        { value: "有氧", text: "有氧" },
        { value: "力量", text: "力量" },
        { value: "徒手", text: "徒手" }
      ]);
      const difficulties = vue.ref([
        { value: "初级", text: "初级" },
        { value: "中级", text: "中级" },
        { value: "高级", text: "高级" }
      ]);
      const plans = vue.ref([
        {
          title: "训练计划1",
          duration: "15min",
          imageUrl: "/static/face1.png",
          times: "3次/周",
          difficulties: "初级",
          calorie: "100"
        }
        // 其他计划数据...
      ]);
      const aiInput = vue.ref("");
      const customPlan = vue.ref("");
      const exerciseProgress = vue.ref(50);
      const currentExercise = vue.ref(30);
      const planExercise = vue.ref(60);
      const weekDays = vue.ref([
        { date: "周一", progress: 70 },
        { date: "周二", progress: 50 },
        { date: "周三", progress: 80 },
        { date: "周四", progress: 60 },
        { date: "周五", progress: 90 },
        { date: "周六", progress: 40 },
        { date: "周日", progress: 100 }
      ]);
      const showCalendar_bar = vue.ref(false);
      const switchTab = (selectedTab) => {
        tab.value = selectedTab;
      };
      const selectButton = (buttonType) => {
        activeButton.value = buttonType;
      };
      const selectGoal = (value) => {
        selectedGoal.value = selectedGoal.value === value ? "" : value;
      };
      const selectType = (value) => {
        selectedType.value = selectedType.value === value ? "" : value;
      };
      const selectDifficulty = (value) => {
        selectedDifficulty.value = selectedDifficulty.value === value ? "" : value;
      };
      const openPlanDetail = (plan) => {
      };
      const goToSearchPage = () => {
        uni.navigateTo({
          url: "/pages/Search/Search"
        });
      };
      const getCustomPlan = () => {
        customPlan.value = `根据您的需求 "${aiInput.value}"，我们为您定制了以下运动计划：...`;
      };
      const openDaySchedule = (day) => {
        formatAppLog("log", "at pages/Home/Home.vue:376", `打开${day.date}的日程`);
      };
      const toggleCalendar = () => {
        showCalendar_bar.value = !showCalendar_bar.value;
      };
      const To_myplan = () => {
        showMyplan.value = true;
        showMyeat.value = false;
      };
      const To_myeat = () => {
        showMyplan.value = false;
        showMyeat.value = true;
      };
      function getDate(date, AddDayCount = 0) {
        if (!date) {
          date = /* @__PURE__ */ new Date();
        }
        if (typeof date !== "object") {
          date = date.replace(/-/g, "/");
        }
        const dd = new Date(date);
        dd.setDate(dd.getDate() + AddDayCount);
        const y2 = dd.getFullYear();
        const m2 = dd.getMonth() + 1 < 10 ? "0" + (dd.getMonth() + 1) : dd.getMonth() + 1;
        const d2 = dd.getDate() < 10 ? "0" + dd.getDate() : dd.getDate();
        return {
          fullDate: `${y2}-${m2}-${d2}`,
          year: y2,
          month: m2,
          date: d2,
          day: dd.getDay()
        };
      }
      const showCalendar = vue.ref(false);
      const currentday = vue.ref(getDate(/* @__PURE__ */ new Date()).fullDate);
      const info = vue.ref({
        lunar: true,
        range: true,
        insert: false,
        selected: []
      });
      const change = (info2) => {
        formatAppLog("log", "at pages/Home/Home.vue:427", "change 返回:", info2);
        currentday.value = info2.fulldate;
        formatAppLog("log", "at pages/Home/Home.vue:430", currentday.value);
      };
      const addCheckIn = () => {
        const newDate = currentday.value;
        info.value.selected.push({
          date: newDate,
          info: "打卡"
        });
        refreshCalendar();
      };
      const addSignIn = () => {
        const newDate = currentday.value;
        info.value.selected.push({
          date: newDate,
          info: "签到"
        });
        refreshCalendar();
      };
      const removeSelected = (index) => {
        info.value.selected.splice(index, 1);
        refreshCalendar();
      };
      const refreshCalendar = () => {
        showCalendar.value = false;
        vue.nextTick(() => {
          showCalendar.value = true;
        });
      };
      vue.onMounted(() => {
        showCalendar.value = true;
        setTimeout(() => {
          info.value.date = getDate(/* @__PURE__ */ new Date(), -30).fullDate;
          info.value.startDate = getDate(/* @__PURE__ */ new Date(), -60).fullDate;
          info.value.endDate = getDate(/* @__PURE__ */ new Date(), 30).fullDate;
          info.value.selected = [
            {
              date: getDate(/* @__PURE__ */ new Date(), -3).fullDate,
              info: "打卡"
            },
            {
              date: getDate(/* @__PURE__ */ new Date(), -2).fullDate,
              info: "签到",
              data: {
                custom: "自定义信息",
                name: "自定义消息头"
              }
            },
            {
              date: getDate(/* @__PURE__ */ new Date(), -1).fullDate,
              info: "已打卡"
            }
          ];
        }, 2e3);
      });
      const __returned__ = { target, modelVale, target_eat_percent, tab, activeButton, selectedGoal, selectedType, selectedDifficulty, showMyplan, showMyeat, today_left_eat, add_icon, delete_icon, column_bar, goals, types, difficulties, plans, aiInput, customPlan, exerciseProgress, currentExercise, planExercise, weekDays, showCalendar_bar, switchTab, selectButton, selectGoal, selectType, selectDifficulty, openPlanDetail, goToSearchPage, getCustomPlan, openDaySchedule, toggleCalendar, To_myplan, To_myeat, getDate, showCalendar, currentday, info, change, addCheckIn, addSignIn, removeSelected, refreshCalendar, ref: vue.ref, computed: vue.computed, onMounted: vue.onMounted, nextTick: vue.nextTick, LCircle };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_uni_section = resolveEasycom(vue.resolveDynamicComponent("uni-section"), __easycom_0);
    const _component_uni_calendar = resolveEasycom(vue.resolveDynamicComponent("uni-calendar"), __easycom_1);
    return vue.openBlock(), vue.createElementBlock("div", { class: "container" }, [
      vue.createCommentVNode(" 搜索栏 "),
      vue.createElementVNode("div", {
        class: "search-bar",
        onClick: $setup.goToSearchPage
      }, [
        vue.createElementVNode("span", { class: "search-placeholder" }, "请输入搜索内容")
      ]),
      vue.createCommentVNode(" 计划和日程切换 "),
      vue.createElementVNode("div", { class: "tab-container" }, [
        vue.createElementVNode(
          "span",
          {
            class: vue.normalizeClass({ active: $setup.tab === "plan" }),
            onClick: _cache[0] || (_cache[0] = ($event) => $setup.switchTab("plan"))
          },
          "计划",
          2
          /* CLASS */
        ),
        vue.createElementVNode(
          "span",
          {
            class: vue.normalizeClass({ active: $setup.tab === "schedule" }),
            onClick: _cache[1] || (_cache[1] = ($event) => $setup.switchTab("schedule"))
          },
          "日程",
          2
          /* CLASS */
        )
      ]),
      vue.createCommentVNode(" 计划内容 "),
      $setup.tab === "plan" ? (vue.openBlock(), vue.createElementBlock("div", {
        key: 0,
        class: "plan-section"
      }, [
        vue.createCommentVNode(" 使用Vue的导航栏进行全部和智能定制的切换 "),
        vue.createElementVNode("div", { class: "nav-bar" }, [
          vue.createElementVNode(
            "button",
            {
              onClick: _cache[2] || (_cache[2] = ($event) => $setup.selectButton("all")),
              class: vue.normalizeClass({ active: $setup.activeButton === "all" })
            },
            " 全部 ",
            2
            /* CLASS */
          ),
          vue.createElementVNode(
            "button",
            {
              onClick: _cache[3] || (_cache[3] = ($event) => $setup.selectButton("custom")),
              class: vue.normalizeClass({ active: $setup.activeButton === "custom" })
            },
            " 智能定制 ",
            2
            /* CLASS */
          )
        ]),
        vue.createCommentVNode(" Vue的下拉筛选菜单 "),
        $setup.activeButton === "all" ? (vue.openBlock(), vue.createElementBlock("view", { key: 0 }, [
          vue.createElementVNode("div", { class: "filter-bar" }, [
            vue.createElementVNode("div", { class: "filter" }, [
              vue.createElementVNode("label", null, "目标"),
              vue.withDirectives(vue.createElementVNode(
                "select",
                {
                  "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => $setup.selectedGoal = $event)
                },
                [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList($setup.goals, (goal) => {
                      return vue.openBlock(), vue.createElementBlock("option", {
                        key: goal.value,
                        value: goal.value
                      }, vue.toDisplayString(goal.text), 9, ["value"]);
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ],
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelSelect, $setup.selectedGoal]
              ])
            ]),
            vue.createElementVNode("div", { class: "filter" }, [
              vue.createElementVNode("label", null, "类型"),
              vue.withDirectives(vue.createElementVNode(
                "select",
                {
                  "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => $setup.selectedType = $event)
                },
                [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList($setup.types, (type) => {
                      return vue.openBlock(), vue.createElementBlock("option", {
                        key: type.value,
                        value: type.value
                      }, vue.toDisplayString(type.text), 9, ["value"]);
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ],
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelSelect, $setup.selectedType]
              ])
            ]),
            vue.createElementVNode("div", { class: "filter" }, [
              vue.createElementVNode("label", null, "难度"),
              vue.withDirectives(vue.createElementVNode(
                "select",
                {
                  "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => $setup.selectedDifficulty = $event)
                },
                [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList($setup.difficulties, (difficulty) => {
                      return vue.openBlock(), vue.createElementBlock("option", {
                        key: difficulty.value,
                        value: difficulty.value
                      }, vue.toDisplayString(difficulty.text), 9, ["value"]);
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ],
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelSelect, $setup.selectedDifficulty]
              ])
            ])
          ]),
          vue.createCommentVNode(" 滚动计划列表 "),
          vue.createElementVNode("div", { class: "plan-list" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.plans, (item, index) => {
                return vue.openBlock(), vue.createElementBlock("div", {
                  key: index,
                  class: "plan-item",
                  onClick: ($event) => $setup.openPlanDetail(item)
                }, [
                  vue.createElementVNode("image", {
                    src: item.imageUrl,
                    class: "plan-image"
                  }, null, 8, ["src"]),
                  vue.createElementVNode("div", { class: "plan-info" }, [
                    vue.createElementVNode(
                      "span",
                      { class: "plan-title" },
                      vue.toDisplayString(item.title),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "span",
                      { class: "plan-times" },
                      "运动次数：" + vue.toDisplayString(item.times),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "span",
                      { class: "plan-duration" },
                      "时间：" + vue.toDisplayString(item.duration),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "span",
                      { class: "plan-difficulties" },
                      "难度：" + vue.toDisplayString(item.difficulties),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "span",
                      { class: "plan-calorie" },
                      "卡路里：" + vue.toDisplayString(item.calorie),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createCommentVNode(" 竖线分割 "),
                  vue.createElementVNode("div", { class: "vertical-line" }),
                  vue.createElementVNode("view", { class: "op_bar" }, [
                    vue.createElementVNode("image", {
                      src: $setup.add_icon,
                      class: "add_icon"
                    }),
                    vue.createElementVNode("image", {
                      src: $setup.delete_icon,
                      class: "delete_icon"
                    })
                  ])
                ], 8, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ])) : vue.createCommentVNode("v-if", true),
        $setup.activeButton === "custom" ? (vue.openBlock(), vue.createElementBlock("view", { key: 1 }, [
          vue.createCommentVNode(" 智能定制内容 "),
          vue.createElementVNode("div", { class: "ai-customization" }, [
            vue.withDirectives(vue.createElementVNode(
              "textarea",
              {
                "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => $setup.aiInput = $event),
                placeholder: "请输入您的需求...",
                class: "ai-input"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $setup.aiInput]
            ]),
            vue.createElementVNode("button", {
              onClick: $setup.getCustomPlan,
              class: "ai-button"
            }, "获取定制计划"),
            $setup.customPlan ? (vue.openBlock(), vue.createElementBlock("div", {
              key: 0,
              class: "custom-plan"
            }, [
              vue.createElementVNode("h3", null, "定制计划"),
              vue.createElementVNode(
                "p",
                null,
                vue.toDisplayString($setup.customPlan),
                1
                /* TEXT */
              )
            ])) : vue.createCommentVNode("v-if", true)
          ])
        ])) : vue.createCommentVNode("v-if", true)
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 日程内容 "),
      $setup.tab === "schedule" ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "schedule-section"
      }, [
        vue.createElementVNode("view", { class: "top_bar_sport" }, [
          vue.createElementVNode("view", { class: "sportbar" }, [
            vue.createVNode($setup["LCircle"], {
              current: $setup.modelVale,
              "onUpdate:current": _cache[8] || (_cache[8] = ($event) => $setup.modelVale = $event),
              percent: $setup.target,
              size: 50,
              class: "circle_process",
              strokeColor: "#69c27d",
              trailWidth: "12",
              strokeWidth: "12",
              lineCap: "butt"
            }, {
              default: vue.withCtx(() => [
                vue.createCommentVNode(" <text>{{ modelVale }}%</text> ")
              ]),
              _: 1
              /* STABLE */
            }, 8, ["current", "percent"]),
            vue.createElementVNode("div", { class: "exercise-duration" }, [
              vue.createElementVNode("span", null, "今日运动时长"),
              vue.createElementVNode(
                "span",
                null,
                vue.toDisplayString($setup.currentExercise) + " / " + vue.toDisplayString($setup.planExercise) + " 分钟",
                1
                /* TEXT */
              )
            ])
          ]),
          vue.createElementVNode("view", null, [
            vue.createElementVNode("image", {
              src: _imports_0,
              class: "shot_icon"
            })
          ])
        ]),
        $setup.showCalendar_bar === false ? (vue.openBlock(), vue.createElementBlock("view", { key: 0 }, [
          vue.createElementVNode("view", { class: "week_sport_bar" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($setup.weekDays, (day, index) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: index,
                  onClick: ($event) => $setup.openDaySchedule(day)
                }, [
                  vue.createElementVNode(
                    "text",
                    null,
                    vue.toDisplayString(day.date),
                    1
                    /* TEXT */
                  ),
                  vue.createVNode($setup["LCircle"], {
                    current: $setup.modelVale,
                    "onUpdate:current": _cache[9] || (_cache[9] = ($event) => $setup.modelVale = $event),
                    percent: day.progress,
                    size: 30,
                    class: "circle_process",
                    strokeColor: "#69c27d",
                    trailWidth: "8",
                    strokeWidth: "8",
                    lineCap: "butt"
                  }, {
                    default: vue.withCtx(() => [
                      vue.createCommentVNode(" <text>{{ modelVale }}%</text> ")
                    ]),
                    _: 2
                    /* DYNAMIC */
                  }, 1032, ["current", "percent"])
                ], 8, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          vue.createElementVNode("view", null, [
            vue.createCommentVNode(" 日历下拉条 "),
            vue.createElementVNode("view", { class: "calendar_dropbar" }, [
              vue.createElementVNode("text", null, "查看月历"),
              vue.createElementVNode("image", {
                class: "dropbar",
                src: _imports_1,
                onClick: $setup.toggleCalendar
              })
            ])
          ]),
          vue.createElementVNode("view", { class: "plat_bar" }, [
            vue.createElementVNode("view", { class: "func_set" }, [
              vue.createElementVNode("view", { class: "my_plan" }, [
                vue.createElementVNode(
                  "button",
                  {
                    onClick: $setup.To_myplan,
                    class: vue.normalizeClass({ swcbt: true, active: $setup.showMyplan })
                  },
                  [
                    vue.createElementVNode("text", null, "我的计划")
                  ],
                  2
                  /* CLASS */
                )
              ]),
              vue.createElementVNode("view", { class: "my_eat" }, [
                vue.createElementVNode(
                  "button",
                  {
                    onClick: $setup.To_myeat,
                    class: vue.normalizeClass({ swcbt: true, active: $setup.showMyeat })
                  },
                  [
                    vue.createElementVNode("text", null, "我的饮食")
                  ],
                  2
                  /* CLASS */
                )
              ])
            ]),
            $setup.showMyplan === true ? (vue.openBlock(), vue.createElementBlock("view", { key: 0 }, [
              vue.createElementVNode("view", null, [
                vue.createElementVNode("text", null, "我的计划")
              ])
            ])) : vue.createCommentVNode("v-if", true),
            $setup.showMyeat === true ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 1,
              class: "eat_page"
            }, [
              vue.createElementVNode("view", null, [
                vue.createVNode($setup["LCircle"], {
                  current: $setup.modelVale,
                  "onUpdate:current": _cache[10] || (_cache[10] = ($event) => $setup.modelVale = $event),
                  percent: $setup.target_eat_percent,
                  size: 120,
                  class: "circle_process_eat",
                  trailWidth: "20",
                  strokeWidth: "20",
                  lineCap: "butt",
                  strokeColor: "#7F83F7"
                }, {
                  default: vue.withCtx(() => [
                    vue.createElementVNode("view", { class: "eat_left" }, [
                      vue.createElementVNode("text", { class: "b1_highlight" }, "还可摄入"),
                      vue.createElementVNode(
                        "text",
                        { class: "b_highlight" },
                        vue.toDisplayString($setup.today_left_eat),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode("text", { class: "gray_color" }, "千卡")
                    ]),
                    vue.createCommentVNode(" <text>{{ modelVale }}%</text> ")
                  ]),
                  _: 1
                  /* STABLE */
                }, 8, ["current", "percent"]),
                vue.createElementVNode("button", { class: "take_picture" }, [
                  vue.createElementVNode("text", null, "拍照识别")
                ]),
                vue.createElementVNode("view", { class: "picture_return" }, [
                  vue.createElementVNode("text", null, "识别结果")
                ])
              ])
            ])) : vue.createCommentVNode("v-if", true)
          ])
        ])) : vue.createCommentVNode("v-if", true),
        $setup.showCalendar_bar === true ? (vue.openBlock(), vue.createElementBlock("view", { key: 1 }, [
          vue.createCommentVNode(" 日历下拉条 "),
          vue.createElementVNode("view", { class: "calendar_dropbar" }, [
            $setup.showCalendar ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "calendar-content"
            }, [
              vue.createVNode(_component_uni_section, {
                title: "日历",
                type: "line"
              }),
              vue.createElementVNode("view", null, [
                vue.createCommentVNode(" 插入模式 "),
                vue.createVNode(_component_uni_calendar, {
                  class: "uni-calendar--hook",
                  selected: $setup.info.selected,
                  showMonth: false,
                  onChange: $setup.change,
                  onMonthSwitch: _ctx.monthSwitch
                }, null, 8, ["selected", "onMonthSwitch"])
              ])
            ])) : vue.createCommentVNode("v-if", true),
            vue.createCommentVNode(" 打卡和签到按钮 "),
            vue.createElementVNode("div", { class: "action-buttons" }, [
              vue.createElementVNode("button", { onClick: $setup.addCheckIn }, "打卡"),
              vue.createElementVNode("button", { onClick: $setup.addSignIn }, "签到")
            ]),
            vue.createCommentVNode(" 显示 selected 的内容 "),
            vue.createElementVNode("div", { class: "selected-list" }, [
              vue.createElementVNode("h3", null, "已选日期"),
              vue.createElementVNode("ul", null, [
                (vue.openBlock(true), vue.createElementBlock(
                  vue.Fragment,
                  null,
                  vue.renderList($setup.info.selected, (item, index) => {
                    return vue.openBlock(), vue.createElementBlock("li", { key: index }, [
                      vue.createTextVNode(
                        vue.toDisplayString(item.date) + " - " + vue.toDisplayString(item.info) + " ",
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode("button", {
                        onClick: ($event) => $setup.removeSelected(index)
                      }, "删除", 8, ["onClick"])
                    ]);
                  }),
                  128
                  /* KEYED_FRAGMENT */
                ))
              ])
            ]),
            vue.createElementVNode("image", {
              class: "dropbar",
              src: _imports_1,
              onClick: $setup.toggleCalendar
            })
          ])
        ])) : vue.createCommentVNode("v-if", true)
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesHomeHome = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$4], ["__scopeId", "data-v-7ffebbf4"], ["__file", "D:/coding/sf_enginering/Squad/Squad/pages/Home/Home.vue"]]);
  const _sfc_main$4 = {};
  function _sfc_render$3(_ctx, _cache) {
    return vue.openBlock(), vue.createElementBlock("view");
  }
  const PagesFriendsFriends = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$3], ["__file", "D:/coding/sf_enginering/Squad/Squad/pages/Friends/Friends.vue"]]);
  const _sfc_main$3 = {
    data() {
      return {};
    },
    methods: {}
  };
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view");
  }
  const PagesSportsSports = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$2], ["__file", "D:/coding/sf_enginering/Squad/Squad/pages/Sports/Sports.vue"]]);
  const _sfc_main$2 = {};
  function _sfc_render$1(_ctx, _cache) {
    return vue.openBlock(), vue.createElementBlock("view");
  }
  const PagesMyInfoMyInfo = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__file", "D:/coding/sf_enginering/Squad/Squad/pages/My_info/My_info.vue"]]);
  const _sfc_main$1 = {
    data() {
      return {
        searchQuery: "",
        recommendations: []
      };
    },
    created() {
      this.loadRecommendations();
    },
    methods: {
      loadRecommendations() {
        this.recommendations = [
          "推荐内容1",
          "推荐内容2",
          "推荐内容3"
          // 可以通过脚本增加更多内容
        ];
      },
      onSearchInput() {
      },
      selectRecommendation(item) {
        this.searchQuery = item;
      },
      cancelSearch() {
        this.$router.back();
      }
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("div", { class: "search-page" }, [
      vue.createCommentVNode(" 搜索输入框 "),
      vue.createElementVNode("div", { class: "search-header" }, [
        vue.withDirectives(vue.createElementVNode(
          "input",
          {
            type: "text",
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.searchQuery = $event),
            placeholder: "搜索",
            class: "search-input",
            onInput: _cache[1] || (_cache[1] = (...args) => $options.onSearchInput && $options.onSearchInput(...args))
          },
          null,
          544
          /* NEED_HYDRATION, NEED_PATCH */
        ), [
          [vue.vModelText, $data.searchQuery]
        ]),
        vue.createElementVNode("button", {
          class: "cancel-button",
          onClick: _cache[2] || (_cache[2] = (...args) => $options.cancelSearch && $options.cancelSearch(...args))
        }, "取消")
      ]),
      vue.createCommentVNode(" 推荐内容 "),
      !$data.searchQuery ? (vue.openBlock(), vue.createElementBlock("div", {
        key: 0,
        class: "recommendations"
      }, [
        vue.createElementVNode("h3", null, "推荐内容"),
        vue.createElementVNode("ul", null, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.recommendations, (item, index) => {
              return vue.openBlock(), vue.createElementBlock("li", {
                key: index,
                onClick: ($event) => $options.selectRecommendation(item)
              }, vue.toDisplayString(item), 9, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ])) : (vue.openBlock(), vue.createElementBlock(
        vue.Fragment,
        { key: 1 },
        [
          vue.createCommentVNode(" 搜索结果 "),
          vue.createElementVNode("div", { class: "search-results" }, [
            vue.createElementVNode("h3", null, "搜索结果"),
            vue.createCommentVNode(" 在这里显示搜索结果 ")
          ])
        ],
        2112
        /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
      ))
    ]);
  }
  const PagesSearchSearch = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__scopeId", "data-v-a9e5e983"], ["__file", "D:/coding/sf_enginering/Squad/Squad/pages/Search/Search.vue"]]);
  __definePage("pages/Login/Login", PagesLoginLogin);
  __definePage("pages/index/index", PagesIndexIndex);
  __definePage("pages/Register/Register", PagesRegisterRegister);
  __definePage("pages/FirstLogin/FirstLogin", PagesFirstLoginFirstLogin);
  __definePage("pages/Home/Home", PagesHomeHome);
  __definePage("pages/Friends/Friends", PagesFriendsFriends);
  __definePage("pages/Sports/Sports", PagesSportsSports);
  __definePage("pages/My_info/My_info", PagesMyInfoMyInfo);
  __definePage("pages/Search/Search", PagesSearchSearch);
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
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "D:/coding/sf_enginering/Squad/Squad/App.vue"]]);
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
