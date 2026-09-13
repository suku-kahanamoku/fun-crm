<script setup lang="ts">
import config from "@/assets/configs/product-list.json";
definePageMeta({
  layout: "admin",
  syscode: "admin_products",
  title: "$.admin.products",
});
const { t } = useLang();
useHead({ title: computed(() => t("$.admin.products")) });
</script>

<template>
  <AdminResourceList
    :title="t('$.admin.products')"
    :config="config"
    list-route-syscode="admin_products"
    create-path="/admin/products/create"
    resource="product"
  />
</template>
