"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
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
      console.log("change:" + JSON.stringify(e.detail.value));
    }
  }
};
if (!Array) {
  const _easycom_fui_checkbox2 = common_vendor.resolveComponent("fui-checkbox");
  const _easycom_fui_list_cell2 = common_vendor.resolveComponent("fui-list-cell");
  const _easycom_fui_label2 = common_vendor.resolveComponent("fui-label");
  const _easycom_fui_checkbox_group2 = common_vendor.resolveComponent("fui-checkbox-group");
  (_easycom_fui_checkbox2 + _easycom_fui_list_cell2 + _easycom_fui_label2 + _easycom_fui_checkbox_group2)();
}
const _easycom_fui_checkbox = () => "../../node-modules/firstui-uni/firstui/fui-checkbox/fui-checkbox.js";
const _easycom_fui_list_cell = () => "../../node-modules/firstui-uni/firstui/fui-list-cell/fui-list-cell.js";
const _easycom_fui_label = () => "../../node-modules/firstui-uni/firstui/fui-label/fui-label.js";
const _easycom_fui_checkbox_group = () => "../../node-modules/firstui-uni/firstui/fui-checkbox-group/fui-checkbox-group.js";
if (!Math) {
  (_easycom_fui_checkbox + _easycom_fui_list_cell + _easycom_fui_label + _easycom_fui_checkbox_group)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($data.checkboxItems, (item, index, i0) => {
      return {
        a: "7fc77965-3-" + i0 + "," + ("7fc77965-2-" + i0),
        b: common_vendor.p({
          checked: item.checked,
          value: item.value,
          color: "#777CFF",
          borderColor: "#B2B2B2",
          borderRadius: "8rpx"
        }),
        c: common_vendor.t(item.name),
        d: "7fc77965-2-" + i0 + "," + ("7fc77965-1-" + i0),
        e: index,
        f: "7fc77965-1-" + i0 + ",7fc77965-0"
      };
    }),
    b: common_vendor.f($data.items, (item, k0, i0) => {
      return {
        a: item.value,
        b: item.checked,
        c: common_vendor.t(item.name),
        d: item.value
      };
    }),
    c: common_vendor.o((...args) => $options.checkboxChange && $options.checkboxChange(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
