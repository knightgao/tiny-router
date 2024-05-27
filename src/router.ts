import Router from './tiny-router/Router';
import Home from './components/Home.vue';
import About from './components/About.vue';

const routes: { path: string; component: any; }[] = [
  { path: '/', component: Home },
  { path: '/about', component: About },
];

const router = new Router({ mode: 'history', routes});

export default router;