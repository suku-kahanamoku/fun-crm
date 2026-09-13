<script setup lang="ts">
import configSource from "@/assets/configs/category-create.json";
import type { IAnimalCategory } from "@/types/crm";

definePageMeta({
  layout: "admin",
  syscode: "admin_categories_create",
  title: "$.admin.new_category",
});
const { t } = useLang();
const localePath = useLocalePath();
const { config, loading, onSave, goToList } = useAdminResource<IAnimalCategory>(
  configSource,
  "admin_categories",
);
async function submit(body: Record<string, any>) {
  if ((await onSave(body))?.data) goToList();
}
useHead({ title: computed(() => t("$.admin.new_category")) });
</script>

<template>
  <div v-if="config" class="mx-auto w-full max-w-4xl px-5 pb-10">
    <div class="crm-page-heading">
      <div>
        <p class="crm-eyebrow">{{ t("$.section.catalogue_taxonomy") }}</p>
        <h1 class="crm-page-title">{{ t("$.admin.new_category") }}</h1>
        <p class="mt-2 text-sm text-muted">
          {{ t("$.section.create_category_description") }}
        </p>
      </div>
    </div>
    <div class="crm-form-shell p-2">
      <CmpForm
        :fields="config.fields"
        :loading="loading"
        :actions="{ no: { link: localePath('/admin/categories') } }"
        :ui="{
          root: 'border-0 bg-transparent shadow-none',
          body: 'grid gap-5',
        }"
        @submit="submit"
      />
    </div>
  </div>
</template>
