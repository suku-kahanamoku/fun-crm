<script setup lang="ts">
import configSource from "@/assets/configs/product-create.json";
import type { IProduct } from "@/types/crm";

definePageMeta({
  layout: "admin",
  syscode: "admin_products_create",
  title: "$.admin.new_product",
});
const { t } = useLang();
const localePath = useLocalePath();
const { normalizeProductBody } = useFanProduct();
const { config, loading, onSave, goToList } = useAdminResource<IProduct>(
  configSource,
  "admin_products",
);
const profileProbabilities = ref<IProduct["profile_probabilities"]>([]);
const alternatives = ref<IProduct["alternatives"]>([]);
async function submit(body: Record<string, any>) {
  if ((await onSave({ ...normalizeProductBody(body), alternatives: alternatives.value, profile_probabilities: profileProbabilities.value }))?.data) goToList();
}
useHead({ title: computed(() => t("$.admin.new_product")) });
</script>

<template>
  <div v-if="config" class="mx-auto w-full max-w-5xl px-5 pb-10">
    <div class="crm-page-heading">
      <div>
        <p class="crm-eyebrow">{{ t("$.section.catalogue_management") }}</p>
        <h1 class="crm-page-title">{{ t("$.admin.new_product") }}</h1>
        <p class="mt-2 text-sm text-muted">
          {{ t("$.section.create_product_description") }}
        </p>
      </div>
    </div>
    <UAlert
      class="mb-5"
      color="info"
      variant="subtle"
      icon="i-heroicons-photo"
      :description="t('$.product.images_after_create')"
    />
    <div class="crm-form-shell p-2">
      <AdminProductAlternatives v-model="alternatives" class="m-4 mb-0" />
      <AdminProductProfileProbabilities v-model="profileProbabilities" class="m-4 mb-0" />
      <CmpForm
        :fields="config.fields"
        :loading="loading"
        :actions="{ no: { link: localePath('/admin/products') } }"
        :ui="{
          root: 'border-0 bg-transparent shadow-none',
          body: 'grid gap-5 md:grid-cols-2',
        }"
        @submit="submit"
      />
    </div>
  </div>
</template>
