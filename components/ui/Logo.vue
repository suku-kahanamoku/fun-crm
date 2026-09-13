<script setup lang="ts">
const localePath = useLocalePath();
const { t } = useLang();
</script>

<template>
  <NuxtLink
    :to="localePath('/admin')"
    class="group flex items-center gap-3"
    aria-label="FAnn CRM"
  >
    <span
      class="relative grid size-11 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500 to-primary-800 text-white shadow-lg shadow-primary/25 transition group-hover:-rotate-3 group-hover:scale-105"
    >
      <span class="absolute inset-x-1 top-0 h-px bg-white/70" />
      <UIcon name="i-lucide-sparkles" class="size-6" />
    </span>
    <span class="leading-tight">
      <span
        class="block text-lg font-extrabold tracking-tight text-slate-900 dark:text-white"
      >
        FAnn CRM
      </span>
      <span
        class="block text-[10px] font-bold uppercase tracking-[0.2em] text-primary-600"
      >
        {{ t("$.base.smart_profiles") }}
      </span>
    </span>
  </NuxtLink>
</template>
