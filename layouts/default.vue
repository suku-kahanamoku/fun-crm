<script setup lang="ts">
useSeoMeta({ robots: "noindex, nofollow" });
</script>

<template>
  <div class="crm-surface min-h-screen bg-slate-50 dark:bg-slate-950">
    <header class="border-b border-default/70 bg-default/75 backdrop-blur-xl">
      <div
        class="mx-auto flex h-20 max-w-7xl items-center justify-between px-5"
      >
        <UiLogo />
        <UiLanguageSwitcher />
      </div>
    </header>
    <main>
      <slot />
    </main>
  </div>
</template>
