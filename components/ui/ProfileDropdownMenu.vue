<script setup lang="ts">
const { t } = useLang();
const { user, clear } = useUserSession();
const localePath = useLocalePath();

const items = computed(() => [
  {
    avatar: {
      alt:
        [user.value?.first_name, user.value?.last_name]
          .filter(Boolean)
          .join(" ") || "Admin",
      icon: "i-heroicons-user",
    },
    children: [
      {
        label: t("$.navbar.logout"),
        icon: "i-heroicons-arrow-right-start-on-rectangle",
        onSelect: async () => {
          await clear();
          await navigateTo(localePath("/login"));
        },
      },
    ],
  },
]);
</script>

<template>
  <UNavigationMenu
    :items="items"
    arrow
    content-orientation="vertical"
    variant="link"
    :ui="{ viewportWrapper: 'left-auto right-0 w-44', viewport: 'left-0' }"
  />
</template>
