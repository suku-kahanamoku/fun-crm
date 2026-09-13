<script setup lang="ts">
const route = useRoute();
const localePath = useLocalePath();
const { t, locale } = useLang();

const labels = computed<Record<string, string>>(() => ({
  admin: t("$.admin.title"),
  clients: t("$.admin.clients"),
  profiles: t("$.admin.profiles"),
  products: t("$.admin.products"),
  categories: t("$.admin.categories"),
  create: t("$.breadcrumb.create"),
  edit: t("$.breadcrumb.edit"),
}));

const items = computed(() => {
  const segments = route.path.split("/").filter(Boolean);
  if (segments[0] === locale.value) segments.shift();
  return [
    { label: "", icon: "i-heroicons-home", to: localePath("/admin") },
    ...segments.slice(1).map((segment, index) => {
      const decoded = decodeURIComponent(segment).replace(/--\$\d+$/, "");
      return {
        label: labels.value[decoded] || decoded,
        to: localePath(`/admin/${segments.slice(1, index + 2).join("/")}`),
      };
    }),
  ];
});
</script>

<template>
  <UBreadcrumb
    :items="items"
    class="w-fit rounded-full border border-default/70 bg-default/75 px-3 py-1.5 shadow-sm backdrop-blur"
    :ui="{ link: 'text-xs font-semibold', separatorIcon: 'size-3.5' }"
  />
</template>
