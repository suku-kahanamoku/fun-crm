<script setup lang="ts">
import config from "@/assets/configs/client-list.json";
definePageMeta({
  layout: "admin",
  syscode: "admin_clients",
  title: "$.admin.clients",
});
const { t } = useLang();
useHead({ title: computed(() => t("$.admin.clients")) });
</script>

<template>
  <AdminResourceList
    :title="t('$.admin.clients')"
    :config="config"
    list-route-syscode="admin_clients"
    create-path="/admin/clients/create"
    name-field="email"
    resource="client"
  />
</template>
