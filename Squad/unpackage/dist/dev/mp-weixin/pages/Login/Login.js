"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Array) {
  const _easycom_fui_input2 = common_vendor.resolveComponent("fui-input");
  const _easycom_fui_icon2 = common_vendor.resolveComponent("fui-icon");
  (_easycom_fui_input2 + _easycom_fui_icon2)();
}
const _easycom_fui_input = () => "../../node-modules/firstui-uni/firstui/fui-input/fui-input.js";
const _easycom_fui_icon = () => "../../node-modules/firstui-uni/firstui/fui-icon/fui-icon.js";
if (!Math) {
  (_easycom_fui_input + _easycom_fui_icon)();
}
const logo = "/static/Squad1.png";
const _sfc_main = {
  __name: "Login",
  setup(__props) {
    const isPressed = common_vendor.ref(false);
    const password = common_vendor.ref(true);
    const inputpwd = (e) => {
      console.log(e);
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
    const form = common_vendor.ref({
      account: "",
      password: ""
    });
    const submitLogin = () => {
      if (!form.value.account || !form.value.password) {
        common_vendor.index.showToast({
          title: "请输入账号和密码",
          icon: "none"
        });
        return;
      }
      console.log("提交登录表单", form.value);
    };
    const goRegister = () => {
      console.log("前往注册页面");
      common_vendor.index.navigateTo({ url: "/pages/Register/Register" });
    };
    return (_ctx, _cache) => {
      return {
        a: logo,
        b: common_vendor.o(($event) => form.value.account = $event),
        c: common_vendor.p({
          placeholder: "请输入账号",
          borderTop: true,
          padding: ["20rpx", "32rpx"],
          isFillet: true,
          clearable: true,
          modelValue: form.value.account
        }),
        d: common_vendor.o(changepwd_vis),
        e: common_vendor.p({
          name: password.value ? "invisible" : "visible",
          color: "#B2B2B2",
          size: 50
        }),
        f: common_vendor.o(inputpwd),
        g: common_vendor.o(($event) => form.value.password = $event),
        h: common_vendor.p({
          borderTop: true,
          padding: ["20rpx", "32rpx"],
          placeholder: "请输入密码",
          password: password.value,
          clearable: true,
          isFillet: true,
          modelValue: form.value.password
        }),
        i: common_vendor.n({
          active: isPressed.value
        }),
        j: common_vendor.o(onButtonPress),
        k: common_vendor.o(onButtonRelease),
        l: common_vendor.o(submitLogin),
        m: common_vendor.o(goRegister)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-461d1d79"]]);
wx.createPage(MiniProgramPage);
