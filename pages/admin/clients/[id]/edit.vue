<script setup lang="ts">
import configSource from "@/assets/configs/client-update.json";
import type { IClient } from "@/types/crm";

definePageMeta({
  layout: "admin",
  syscode: "admin_clients_edit",
  title: "$.admin.edit_client",
});
const { t } = useLang();
const route = useRoute();
const { config, response, loading, onSave } = useAdminResource<IClient>(
  configSource,
  "admin_clients",
);
const client = computed(
  () => (response.value as any)?.data as IClient | undefined,
);
const profiles = ref<Array<{ customer_profile_id: number; position: number }>>([]);
watch(client, (value) => {
  profiles.value = (value?.profiles || []).map((profile) => ({
    customer_profile_id: Number(profile.id),
    position: Number(profile.position),
  }));
}, { immediate: true });
async function submit(body: Record<string, any>) {
  if (client.value && (await onSave({ ...body, profiles: profiles.value }, client.value))?.data)
    await navigateTo(route.path.replace(/\/edit$/, ""));
}
useHead({ title: computed(() => t("$.admin.edit_client")) });
</script>

<template>
  <div v-if="config" class="mx-auto w-full max-w-5xl px-5 pb-10">
    <div class="crm-page-heading">
      <div>
        <p class="crm-eyebrow">{{ t("$.section.customer_profiles") }}</p>
        <h1 class="crm-page-title">{{ t("$.admin.edit_client") }}</h1>
      </div>
    </div>
    <div class="crm-form-shell p-2">
      <AdminProfileAssignments v-if="client" v-model="profiles" class="m-4 mb-0" />
      <CmpForm
        v-if="client"
        :fields="config.fields"
        :item="client"
        :loading="loading"
        :actions="{ no: { link: route.path.replace(/\/edit$/, '') } }"
        :ui="{
          root: 'border-0 bg-transparent shadow-none',
          body: 'grid gap-5 md:grid-cols-2',
        }"
        @submit="submit"
      />
      <USkeleton v-else-if="loading" class="h-96 w-full rounded-2xl" />
      <UAlert
        v-else
        color="error"
        variant="subtle"
        icon="i-heroicons-exclamation-triangle"
        :title="t('$.view.load_error')"
      />
    </div>
  </div>
</template>
