"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
if (!Array) {
  const _easycom_uni_easyinput2 = common_vendor.resolveComponent("uni-easyinput");
  const _easycom_fui_checkbox2 = common_vendor.resolveComponent("fui-checkbox");
  const _easycom_fui_list_cell2 = common_vendor.resolveComponent("fui-list-cell");
  const _easycom_fui_label2 = common_vendor.resolveComponent("fui-label");
  const _easycom_fui_checkbox_group2 = common_vendor.resolveComponent("fui-checkbox-group");
  (_easycom_uni_easyinput2 + _easycom_fui_checkbox2 + _easycom_fui_list_cell2 + _easycom_fui_label2 + _easycom_fui_checkbox_group2)();
}
const _easycom_uni_easyinput = () => "../../uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.js";
const _easycom_fui_checkbox = () => "../../node-modules/firstui-uni/firstui/fui-checkbox/fui-checkbox.js";
const _easycom_fui_list_cell = () => "../../node-modules/firstui-uni/firstui/fui-list-cell/fui-list-cell.js";
const _easycom_fui_label = () => "../../node-modules/firstui-uni/firstui/fui-label/fui-label.js";
const _easycom_fui_checkbox_group = () => "../../node-modules/firstui-uni/firstui/fui-checkbox-group/fui-checkbox-group.js";
if (!Math) {
  (_easycom_uni_easyinput + _easycom_fui_checkbox + _easycom_fui_list_cell + _easycom_fui_label + _easycom_fui_checkbox_group)();
}
const logo = "/static/Squad1.png";
const _sfc_main = {
  __name: "FirstLogin",
  setup(__props) {
    const step = common_vendor.ref(1);
    const form = common_vendor.ref({
      height: "",
      weight: "",
      gender: "",
      age: "",
      goals: [],
      sportTypes: []
    });
    const goalOptions = [
      { value: "weight_loss", name: "减肥", checked: false },
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
    const submitForm = () => {
      console.log("表单提交", form.value);
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: step.value > 1
      }, step.value > 1 ? {
        b: common_assets._imports_0,
        c: common_vendor.o(prevStep)
      } : {}, {
        d: logo,
        e: step.value === 1
      }, step.value === 1 ? {
        f: common_vendor.o(($event) => form.value.height = $event),
        g: common_vendor.p({
          placeholder: "请输入身高",
          clearable: true,
          modelValue: form.value.height
        }),
        h: common_vendor.o(($event) => form.value.weight = $event),
        i: common_vendor.p({
          placeholder: "请输入体重",
          clearable: true,
          modelValue: form.value.weight
        }),
        j: common_vendor.o(nextStep),
        k: common_vendor.o(nextStep),
        l: common_vendor.o(submitForm)
      } : {}, {
        m: step.value === 2
      }, step.value === 2 ? {
        n: common_vendor.o(($event) => form.value.gender = $event),
        o: common_vendor.p({
          placeholder: "请输入性别",
          clearable: true,
          modelValue: form.value.gender
        }),
        p: common_vendor.o(($event) => form.value.age = $event),
        q: common_vendor.p({
          placeholder: "请输入年龄",
          clearable: true,
          modelValue: form.value.age
        }),
        r: common_vendor.o(nextStep),
        s: common_vendor.o(nextStep),
        t: common_vendor.o(submitForm)
      } : {}, {
        v: step.value === 3
      }, step.value === 3 ? {
        w: common_vendor.f(goalOptions, (item, index, i0) => {
          return {
            a: "e8fa868b-7-" + i0 + "," + ("e8fa868b-6-" + i0),
            b: common_vendor.p({
              checked: item.checked,
              value: item.value,
              color: "#777CFF",
              borderColor: "#B2B2B2",
              borderRadius: "8rpx"
            }),
            c: common_vendor.t(item.name),
            d: "e8fa868b-6-" + i0 + "," + ("e8fa868b-5-" + i0),
            e: index,
            f: "e8fa868b-5-" + i0 + ",e8fa868b-4"
          };
        }),
        x: common_vendor.o(($event) => form.value.goals = $event),
        y: common_vendor.p({
          modelValue: form.value.goals
        }),
        z: common_vendor.o(nextStep),
        A: common_vendor.o(nextStep),
        B: common_vendor.o(submitForm)
      } : {}, {
        C: step.value === 4
      }, step.value === 4 ? {
        D: common_vendor.f(sportTypeOptions, (item, index, i0) => {
          return {
            a: "e8fa868b-11-" + i0 + "," + ("e8fa868b-10-" + i0),
            b: common_vendor.p({
              checked: item.checked,
              value: item.value,
              color: "#777CFF",
              borderColor: "#B2B2B2",
              borderRadius: "8rpx"
            }),
            c: common_vendor.t(item.text),
            d: "e8fa868b-10-" + i0 + "," + ("e8fa868b-9-" + i0),
            e: index,
            f: "e8fa868b-9-" + i0 + ",e8fa868b-8"
          };
        }),
        E: common_vendor.o(($event) => form.value.sportTypes = $event),
        F: common_vendor.p({
          modelValue: form.value.sportTypes
        }),
        G: common_vendor.o(submitForm),
        H: common_vendor.o(submitForm),
        I: common_vendor.o(submitForm)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-e8fa868b"]]);
wx.createPage(MiniProgramPage);
