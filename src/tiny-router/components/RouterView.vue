<script setup>
import { inject, computed } from 'vue';

// 获取注入的路由器实例
const router = inject('router');

// 使用计算属性获取当前组件
const currentComponent = computed(() => router.getCurrentComponent().value);
</script>

<template>
  <component :is="currentComponent"></component>
</template>