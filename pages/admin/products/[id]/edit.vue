<script setup lang="ts">
import configSource from "@/assets/configs/product-update.json";
import { useFileUpload } from "@/composables/useFileUpload";
import type { IProduct } from "@/types/crm";

definePageMeta({
  layout: "admin",
  syscode: "admin_products_edit",
  title: "$.admin.edit_product",
});
const { t } = useLang();
const route = useRoute();
const { normalizeProductBody } = useFanProduct();
const { success, error: toastError } = useToastify();
const { config, response, loading, onSave, refresh } =
  useAdminResource<IProduct>(configSource, "admin_products");
const product = computed(
  () => (response.value as any)?.data as IProduct | undefined,
);
const profileProbabilities = ref<IProduct["profile_probabilities"]>([]);
const alternatives = ref<IProduct["alternatives"]>([]);
watch(product, (value) => { profileProbabilities.value = (value?.profile_probabilities || []).map((row) => ({ ...row })); }, { immediate: true });
watch(product, (value) => { alternatives.value = (value?.alternatives || []).map((row) => ({ ...row })); }, { immediate: true });
const {
  uploadedFiles,
  uploading,
  tempPaths,
  addFiles,
  removeFile,
  clearFiles,
} = useFileUpload();
const savingFiles = ref(false);

async function submit(body: Record<string, any>) {
  if (
    product.value &&
    (await onSave({ ...normalizeProductBody(body), alternatives: alternatives.value, profile_probabilities: profileProbabilities.value }, product.value))?.data
  )
    await navigateTo(route.path.replace(/\/edit$/, ""));
}

async function saveFiles() {
  if (!product.value?.id || !tempPaths.value.length) return;
  savingFiles.value = true;
  try {
    if (!config.value?.fileCommitUrl || !config.value?.filePatchUrl) return;
    const newIds: number[] = [];
    for (const path of tempPaths.value) {
      const result = await useApi(config.value.fileCommitUrl, {
        method: "POST",
        body: {
          path,
          name: path.split("/").pop() || "image.jpg",
          visibility: product.value.published === 1 ? "public" : "private",
          entity_type: "product",
          entity_id: product.value.id,
        },
      });
      const id = Number((result as any)?.data?.id || 0);
      if (id) newIds.push(id);
    }
    if (newIds.length) {
      const patchUrl = useUrl(config.value.filePatchUrl, {
        route,
        item: product.value,
      });
      await useApi(patchUrl, {
        method: "PATCH",
        body: { file_ids: [...(product.value.file_ids || []), ...newIds] },
      });
    }
    clearFiles();
    await refresh();
    success(t("$.product.images_saved"));
  } catch (error: any) {
    toastError(error);
  } finally {
    savingFiles.value = false;
  }
}

useHead({ title: computed(() => t("$.admin.edit_product")) });
</script>

<template>
  <div v-if="config" class="mx-auto w-full max-w-5xl px-5 pb-10">
    <div class="crm-page-heading">
      <div>
        <p class="crm-eyebrow">{{ t("$.section.catalogue_management") }}</p>
        <h1 class="crm-page-title">{{ t("$.admin.edit_product") }}</h1>
      </div>
    </div>
    <USkeleton v-if="loading && !product" class="h-96 w-full rounded-2xl" />
    <UTabs
      v-else-if="product"
      class="crm-form-shell p-4 sm:p-5"
      :items="[
        {
          label: t('$.product.sales_data'),
          slot: 'detail',
          icon: 'i-heroicons-pencil-square',
        },
        {
          label: t('$.product.images'),
          slot: 'images',
          icon: 'i-heroicons-photo',
        },
      ]"
    >
      <template #detail>
        <div class="pt-5">
          <AdminProductAlternatives v-model="alternatives" :current-product-id="Number(product.id)" class="mb-5" />
          <AdminProductProfileProbabilities v-model="profileProbabilities" class="mb-5" />
          <CmpForm
            :fields="config.fields"
            :item="product"
            :loading="loading"
            :actions="{
              no: { link: route.path.replace(/\/edit$/, '') },
            }"
            :ui="{
              root: 'border-0 bg-transparent shadow-none',
              body: 'grid gap-5 md:grid-cols-2',
            }"
            @submit="submit"
          />
        </div>
      </template>
      <template #images>
        <div class="space-y-6 pt-5">
          <UiProductFileUpload
            :files="uploadedFiles"
            :uploading="uploading"
            @add="addFiles"
            @remove="removeFile"
          />
          <div class="flex justify-end">
            <UButton
              icon="i-heroicons-cloud-arrow-up"
              :disabled="!tempPaths.length || uploading"
              :loading="savingFiles"
              @click="saveFiles"
            >
              {{ t("$.product.save_images") }}
            </UButton>
          </div>
          <div v-if="product.files?.length">
            <h3 class="mb-3 font-bold">{{ t("$.product.existing_images") }}</h3>
            <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              <a
                v-for="file in product.files"
                :key="file.id"
                :href="`/api/${file.path}`"
                target="_blank"
                rel="noopener noreferrer"
                class="overflow-hidden rounded-xl border border-default bg-default"
              >
                <img
                  :src="`/api/${file.path}`"
                  :alt="file.name"
                  class="h-36 w-full object-cover"
                />
                <p class="truncate p-2 text-xs text-muted">{{ file.name }}</p>
              </a>
            </div>
          </div>
        </div>
      </template>
    </UTabs>
    <UAlert
      v-else
      color="error"
      variant="subtle"
      icon="i-heroicons-exclamation-triangle"
      :title="t('$.view.load_error')"
    />
  </div>
</template>
