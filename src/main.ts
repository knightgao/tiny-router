// import { createApp } from 'vue'
// import App from './App.vue'

// createApp(App).mount('#app')


import { createApp } from 'vue';
import APP from './App.vue';
import Router from './Router/Router';

// 创建一个 Router 实例
const router: any = new Router({ mode: 'history'});

// 添加路由
router.addRoute('/', { template: '<h1>Home</h1>' });
router.addRoute('/about', { template: '<h1>About</h1>' });

// 导航到初始路径
router.navigate(window.location.pathname);

console.log("hello");

// 创建并挂载 Vue 应用
createApp(APP).mount('#app');
