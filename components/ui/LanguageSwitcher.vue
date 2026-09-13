<script setup lang="ts">
const { lang, filtredLangs, t } = useLang();
const switchLocalePath = useSwitchLocalePath();
const switching = ref(false);
const open = ref(false);

function isLocaleCode(code: string): code is "cs" | "en" {
  return code === "cs" || code === "en";
}

async function changeLanguage(code: string) {
  if (!isLocaleCode(code) || code === lang.value.code || switching.value)
    return;
  const target = switchLocalePath(code);
  if (!target) return;
  open.value = false;
  switching.value = true;
  try {
    await navigateTo(target);
  } finally {
    switching.value = false;
  }
}
</script>

<template>
  <UPopover
    v-model:open="open"
    :content="{ align: 'end', side: 'bottom', sideOffset: 8 }"
    :ui="{ content: 'w-auto min-w-0 p-1.5' }"
  >
    <UButton
      color="neutral"
      variant="ghost"
      :icon="lang.icon || 'i-heroicons-language'"
      :aria-label="t('$.language.change')"
      :loading="switching"
      size="lg"
      square
      :ui="{ leadingIcon: 'size-7' }"
    />

    <template #content>
      <div role="menu" class="flex flex-col gap-1">
        <UButton
          v-for="item in filtredLangs"
          :key="item.code"
          color="neutral"
          variant="ghost"
          :icon="item.icon || 'i-heroicons-language'"
          :aria-label="item.label"
          :data-locale-target="switchLocalePath(item.code)"
          :disabled="switching"
          role="menuitem"
          size="lg"
          square
          :ui="{ leadingIcon: 'size-7' }"
          @click="changeLanguage(item.code)"
        />
      </div>
    </template>
  </UPopover>
</template>
