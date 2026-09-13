<script setup lang="ts">
const localePath = useLocalePath();
await navigateTo(localePath("/admin"), { redirectCode: 302 });
</script>

<template>
  <div />
</template>
