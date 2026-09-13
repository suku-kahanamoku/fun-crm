<script setup lang="ts">
import config from "@/assets/configs/category-list.json";
definePageMeta({
  layout: "admin",
  syscode: "admin_categories",
  title: "$.admin.categories",
});
const { t } = useLang();
useHead({ title: computed(() => t("$.admin.categories")) });
</script>

<template>
  <div>
    <div class="mx-auto max-w-7xl px-5 pt-4">
      <UAlert
        color="primary"
        variant="subtle"
        icon="i-lucide-tags"
        :description="t('$.category.examples')"
      />
    </div>
    <AdminResourceList
      :title="t('$.admin.categories')"
      :config="config"
      list-route-syscode="admin_categories"
      create-path="/admin/categories/create"
      resource="category"
    />
  </div>
</template>
