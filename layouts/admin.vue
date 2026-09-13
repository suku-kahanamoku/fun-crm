<script setup lang="ts">
const { loggedIn } = useUserSession();
const { t } = useLang();
const localePath = useLocalePath();
const open = ref(true);
const colorMode = useColorMode();

const navigation = computed(() => [
  {
    label: t("$.admin.title"),
    to: localePath("/admin"),
    icon: "i-heroicons-squares-2x2",
  },
  {
    label: t("$.admin.profiles"),
    to: localePath("/admin/profiles"),
    icon: "i-lucide-contact-round",
  },
  {
    label: t("$.admin.products"),
    to: localePath("/admin/products"),
    icon: "i-heroicons-shopping-bag",
  },
  {
    label: t("$.admin.clients"),
    to: localePath("/admin/clients"),
    icon: "i-heroicons-users",
  },
  {
    label: t("$.admin.categories"),
    to: localePath("/admin/categories"),
    icon: "i-lucide-tags",
  },
]);

function toggleColorMode(): void {
  colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
}

useSeoMeta({ robots: "noindex, nofollow" });
</script>

<template>
  <div class="crm-admin-shell min-h-screen">
    <UHeader
      mode="slideover"
      :toggle="{ size: 'xl' }"
      :ui="{
        root: 'sticky top-0 z-40 border-b border-default/70 bg-default/75 backdrop-blur-xl',
        container: 'max-w-full px-4 sm:px-6',
      }"
    >
      <template #title>
        <UiLogo />
      </template>
      <template #right>
        <div
          class="hidden items-center gap-2 rounded-full border border-default bg-elevated/70 px-3 py-1.5 text-xs font-bold text-muted lg:flex"
        >
          <span
            class="size-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgb(16_185_129_/_12%)]"
          />
          {{ t("$.layout.crm_online") }}
        </div>
        <UiLanguageSwitcher />
        <UButton
          :icon="
            colorMode.value === 'dark' ? 'i-heroicons-sun' : 'i-heroicons-moon'
          "
          color="neutral"
          variant="ghost"
          :aria-label="t('$.layout.toggle_color_mode')"
          @click="toggleColorMode"
        />
        <UiProfileDropdownMenu v-if="loggedIn" />
      </template>
      <template #body>
        <UNavigationMenu :items="navigation" orientation="vertical" />
      </template>
    </UHeader>

    <div
      class="flex min-h-[calc(100vh-var(--ui-header-height))] gap-4 p-3 sm:p-4"
    >
      <USidebar
        v-model:open="open"
        collapsible="icon"
        rail
        class="overflow-hidden rounded-2xl border border-default/70 bg-default/80 shadow-xl shadow-slate-900/5 backdrop-blur-xl dark:shadow-black/20"
      >
        <template #default>
          <UNavigationMenu
            :items="navigation"
            orientation="vertical"
            :ui="{
              list: 'space-y-1.5 p-2',
              link: 'w-full rounded-xl px-3.5 py-3 text-sm font-bold transition-all data-[active]:bg-primary data-[active]:text-white data-[active]:shadow-lg data-[active]:shadow-primary/20',
              linkLeadingIcon: 'size-5',
            }"
          />
        </template>
        <template #footer>
          <div class="m-2 rounded-xl bg-primary/8 p-3 text-xs text-muted">
            <div
              class="mb-2 flex items-center gap-2 font-extrabold text-highlighted"
            >
              <UIcon name="i-lucide-sparkles" class="size-4 text-primary" />
              {{ t("$.layout.smarter_offers") }}
            </div>
            <p class="group-data-[collapsed=true]:hidden">
              {{ t("$.layout.smarter_offers_description") }}
            </p>
          </div>
        </template>
      </USidebar>
      <main
        class="min-w-0 flex-1 overflow-auto rounded-2xl border border-white/50 bg-white/35 shadow-sm backdrop-blur-[2px] dark:border-white/5 dark:bg-slate-950/25"
      >
        <div class="mx-auto w-full max-w-7xl px-5 pt-5 sm:px-7">
          <UiBreadcrumb />
        </div>
        <slot />
      </main>
    </div>
  </div>
</template>
