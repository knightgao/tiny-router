<template>
  <a :href="to" @click.prevent="navigate">{{ text }}</a>
</template>

<script setup>
import { defineProps, inject } from 'vue';

// 定义组件的 props
const props = defineProps({
  to: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
});

// 注入路由器实例
const router = inject('router');

// 导航方法
const navigate = () => {
  if (router) {
    router.push(props.to);
  } else {
    console.error('Router instance not found.');
  }
};
</script>