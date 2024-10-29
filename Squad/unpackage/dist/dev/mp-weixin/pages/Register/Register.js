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
  __name: "Register",
  setup(__props) {
    const password = common_vendor.ref(true);
    const password_confirm = common_vendor.ref(true);
    const inputpwd = (e) => {
      console.log(e);
    };
    const changepwd_vis = () => {
      password.value = !password.value;
    };
    const inputpwd_confirm = (e) => {
      console.log(e);
    };
    const changepwd_vis_confirm = () => {
      password_confirm.value = !password_confirm.value;
    };
    const form = common_vendor.ref({
      username: "",
      password: "",
      confirmPassword: ""
    });
    const submitRegister = () => {
      if (!form.value.username || !form.value.password || !form.value.confirmPassword) {
        common_vendor.index.showToast({
          title: "请填写完整信息",
          icon: "none"
        });
        return;
      }
      if (form.value.password !== form.value.confirmPassword) {
        common_vendor.index.showToast({
          title: "两次密码输入不一致",
          icon: "none"
        });
        return;
      }
      console.log("提交注册表单", form.value);
      common_vendor.index.request({
        url: "http://localhost:3000/register",
        method: "POST",
        data: {
          username: form.value.username,
          password: form.value.password,
          confirmPassword: form.value.confirmPassword
        },
        success: (res) => {
          console.log("注册请求返回：", res);
          if (res.statusCode === 201 && res.data.success) {
            common_vendor.index.showToast({
              title: "注册成功",
              icon: "success"
            });
            common_vendor.index.setStorage({
              key: "username",
              data: form.value.username,
              success: function() {
                console.log("success");
              }
            });
            common_vendor.index.navigateTo({ url: "/pages/FirstLogin/FirstLogin" }).then(() => {
              console.log("跳转成功");
            }).catch((err) => {
              console.error("跳转失败：", err);
            });
          } else {
            common_vendor.index.showToast({
              title: res.data.message || "注册失败",
              icon: "none"
            });
          }
        },
        fail: (err) => {
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
          console.error("注册请求失败：", err);
        }
      });
    };
    return (_ctx, _cache) => {
      return {
        a: logo,
        b: common_vendor.o(($event) => form.value.username = $event),
        c: common_vendor.p({
          placeholder: "请输入账号",
          borderTop: true,
          padding: ["20rpx", "32rpx"],
          isFillet: true,
          clearable: true,
          modelValue: form.value.username
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
        i: common_vendor.o(changepwd_vis_confirm),
        j: common_vendor.p({
          name: password_confirm.value ? "invisible" : "visible",
          color: "#B2B2B2",
          size: 50
        }),
        k: common_vendor.o(inputpwd_confirm),
        l: common_vendor.o(($event) => form.value.confirmPassword = $event),
        m: common_vendor.p({
          borderTop: true,
          padding: ["20rpx", "32rpx"],
          placeholder: "请再次输入密码",
          password: password_confirm.value,
          clearable: true,
          isFillet: true,
          modelValue: form.value.confirmPassword
        }),
        n: common_vendor.o(submitRegister)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-6b0433d4"]]);
wx.createPage(MiniProgramPage);
