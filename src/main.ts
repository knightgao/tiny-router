import { createApp } from 'vue';
import APP from './App.vue';
import router from './router';


// 创建并挂载 Vue 应用
createApp(APP).use(router).mount('#app');
