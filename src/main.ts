import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// 1. 基础 UI 样式
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 2. Windi CSS
import 'virtual:windi.css'

// 3. 强行注入全局 CSS 变量 (解决按钮不显色的终极手段)
const style = document.createElement('style')
style.innerHTML = `
  :root {
    --brand-color: #4b4b4b;
    --brand-light: #ecf5ff;
    --el-color-primary: #4b4b4b !important;
  }
  .el-button--primary {
    background-color: var(--brand-color) !important;
    border-color: var(--brand-color) !important;
  }
  .bg-brand { background-color: var(--brand-color) !important; }
  .text-brand { color: var(--brand-color) !important; }
`
document.head.appendChild(style)

import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(ElementPlus)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')