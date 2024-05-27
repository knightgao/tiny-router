<script setup>
import RouterLink from './Router/components/RouterLink.vue';
import RouterView from './Router/components/RouterView.vue';
</script>

<template>
  <div id="app">
    <nav>
      <RouterLink to="/" text="Home"></RouterLink>
      <RouterLink to="/about" text="About"></RouterLink>
    </nav>
    <RouterView />
  </div>
</template>



<style>
nav {
  margin-bottom: 20px;
}
nav a {
  margin: 0 10px;
}
</style>