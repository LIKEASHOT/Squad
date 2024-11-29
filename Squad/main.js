import { createSSRApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";

export function createApp() {
  // 加载 .env 文件中的环境变量
  const app = createSSRApp(App);
  const pinia = createPinia();
  app.use(pinia);

  return {
    app,
    pinia,
  };
}
