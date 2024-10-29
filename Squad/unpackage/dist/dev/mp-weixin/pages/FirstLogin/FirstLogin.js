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
    const username = common_vendor.index.getStorageSync("username");
    const form = common_vendor.ref({
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
        common_vendor.index.showToast({
          title: "请输入身高和体重",
          icon: "none"
        });
        return;
      }
      console.log("用户名", username);
      console.log("提交身高和体重", form.value);
      common_vendor.index.request({
        url: "http://localhost:3000/updateHealthInfo",
        // 后端 API 地址
        method: "POST",
        data: {
          height: form.value.height,
          weight: form.value.weight,
          username
        },
        success: (res) => {
          console.log("身高体重更新成功", res);
          if (res.statusCode === 200) {
            common_vendor.index.showToast({
              title: `更新成功，BMI: ${res.data.bmi}`,
              icon: "success"
            });
          } else {
            common_vendor.index.showToast({
              title: res.data.error || "更新失败",
              icon: "none"
            });
          }
          if (step.value < 4) {
            step.value++;
          }
        },
        fail: (err) => {
          console.error("请求失败：", err);
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        }
      });
    };
    const submitGenderAge = () => {
      if (!form.value.gender || !form.value.age) {
        common_vendor.index.showToast({
          title: "请输入性别和年龄",
          icon: "none"
        });
        return;
      }
      console.log("提交性别和年龄", form.value);
      common_vendor.index.request({
        url: "http://localhost:3000/updateGenderAge",
        // 后端 API 地址
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
          console.log("性别和年龄更新成功", res);
          if (res.statusCode === 200) {
            common_vendor.index.showToast({
              title: "更新成功",
              icon: "success"
            });
          } else {
            common_vendor.index.showToast({
              title: res.data.error || "更新失败",
              icon: "none"
            });
          }
          if (step.value < 4) {
            step.value++;
          }
        },
        fail: (err) => {
          console.error("请求失败：", err);
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        }
      });
    };
    const submitFitnessGoal = () => {
      const selectedGoals = form.value.goals;
      if (selectedGoals.length === 0) {
        common_vendor.index.showToast({
          title: "请选择至少一个运动目标",
          icon: "none"
        });
        return;
      }
      console.log("提交运动目标", selectedGoals.join(","));
      common_vendor.index.request({
        url: "http://localhost:3000/updateFitnessGoal",
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
          console.log("运动目标更新成功", res);
          if (res.statusCode === 200) {
            common_vendor.index.showToast({
              title: "更新成功",
              icon: "success"
            });
          } else {
            common_vendor.index.showToast({
              title: res.data.error || "更新失败",
              icon: "none"
            });
          }
          if (step.value < 4) {
            step.value++;
          }
        },
        fail: (err) => {
          console.error("请求失败：", err);
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        }
      });
    };
    const submitExerciseType = () => {
      const selectedTypes = form.value.sportTypes;
      if (selectedTypes.length === 0) {
        common_vendor.index.showToast({
          title: "请选择至少一种运动方式",
          icon: "none"
        });
        return;
      }
      console.log("提交运动方式", selectedTypes.join(","));
      common_vendor.index.request({
        url: "http://localhost:3000/updateExerciseType",
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
          console.log("运动方式更新成功", res);
          if (res.statusCode === 200) {
            common_vendor.index.showToast({
              title: "更新成功",
              icon: "success"
            });
          } else {
            common_vendor.index.showToast({
              title: res.data.error || "更新失败",
              icon: "none"
            });
          }
          if (step.value < 4) {
            step.value++;
          }
        },
        fail: (err) => {
          console.error("请求失败：", err);
          common_vendor.index.showToast({
            title: "网络请求失败",
            icon: "none"
          });
        }
      });
    };
    const submitForm = () => {
      common_vendor.index.navigateTo({ url: "/pages/Home/Home" }).then(() => {
        console.log("跳转成功");
      }).catch((err) => {
        console.error("跳转失败：", err);
      });
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
          placeholder: "请输入身高/cm",
          clearable: true,
          modelValue: form.value.height
        }),
        h: common_vendor.o(($event) => form.value.weight = $event),
        i: common_vendor.p({
          placeholder: "请输入体重/kg",
          clearable: true,
          modelValue: form.value.weight
        }),
        j: common_vendor.o(nextStep),
        k: common_vendor.o(submitHealthInfo),
        l: common_vendor.o(submitForm)
      } : {}, {
        m: step.value === 2
      }, step.value === 2 ? {
        n: common_vendor.o(($event) => form.value.gender = $event),
        o: common_vendor.p({
          placeholder: "请输入性别(男/女)",
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
        s: common_vendor.o(submitGenderAge),
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
        A: common_vendor.o(submitFitnessGoal),
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
        H: common_vendor.o(submitExerciseType),
        I: common_vendor.o(submitForm)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-e8fa868b"]]);
wx.createPage(MiniProgramPage);
