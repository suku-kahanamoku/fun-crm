<script setup lang="ts">
import configSource from "@/assets/configs/client-create.json";
import type { IClient } from "@/types/crm";

definePageMeta({
  layout: "admin",
  syscode: "admin_clients_create",
  title: "$.admin.new_client",
});
const { t } = useLang();
const localePath = useLocalePath();
const { config, loading, onSave, goToList } = useAdminResource<IClient>(
  configSource,
  "admin_clients",
);
const profiles = ref<Array<{ customer_profile_id: number; position: number }>>([]);
async function submit(body: Record<string, any>) {
  if ((await onSave({ ...body, profiles: profiles.value }))?.data) goToList();
}
useHead({ title: computed(() => t("$.admin.new_client")) });
</script>

<template>
  <div v-if="config" class="mx-auto w-full max-w-5xl px-5 pb-10">
    <div class="crm-page-heading">
      <div>
        <p class="crm-eyebrow">{{ t("$.section.customer_profiles") }}</p>
        <h1 class="crm-page-title">{{ t("$.admin.new_client") }}</h1>
        <p class="mt-2 text-sm text-muted">
          {{ t("$.section.create_customer_description") }}
        </p>
      </div>
    </div>
    <div class="crm-form-shell p-2">
      <AdminProfileAssignments v-model="profiles" class="m-4 mb-0" />
      <CmpForm
        :fields="config.fields"
        :loading="loading"
        :actions="{ no: { link: localePath('/admin/clients') } }"
        :ui="{
          root: 'border-0 bg-transparent shadow-none',
          body: 'grid gap-5 md:grid-cols-2',
        }"
        @submit="submit"
      />
    </div>
  </div>
</template>
