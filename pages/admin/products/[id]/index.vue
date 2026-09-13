<script setup lang="ts">
import configSource from "@/assets/configs/product-detail.json";
import type { IAnimalCategory, IProduct } from "@/types/crm";

definePageMeta({ layout: "admin", syscode: "admin_products_detail", title: "$.admin.product_detail" });
const { t, locale } = useLang();
const route = useRoute();
const localePath = useLocalePath();
const { priceRange } = useFanProduct();
const { config, response, loading: pending } = useAdminResource<IProduct>(configSource, "admin_products");
const categoriesUrl = computed(() => config.value?.relations?.categories?.restUrl as string | undefined);
const { data: categoriesResponse } = useAsyncData(
  () => `${config.value?.syscode || "product-detail"}-categories`,
  () => categoriesUrl.value ? useApi(categoriesUrl.value) : Promise.resolve({}),
  { watch: [categoriesUrl] },
);
const product = computed(() => (response.value as any)?.data as IProduct | undefined);
const categories = computed(() => {
  const ids = product.value?.category_ids || [];
  return (((categoriesResponse.value as any)?.data || []) as IAnimalCategory[])
    .filter((category) => ids.includes(Number(category.id)));
});
const editPath = computed(() => {
  const path = route.path.replace(new RegExp(`^/${locale.value}(?=/|$)`), "");
  return localePath(`${path}/edit`);
});
useHead({ title: computed(() => product.value?.name || t("$.admin.product_detail")) });
</script>

<template>
  <div class="mx-auto w-full max-w-6xl space-y-5 px-5 pb-10">
    <div class="crm-page-heading flex-wrap">
      <div><p class="crm-eyebrow">{{ t("$.admin.product_detail") }}</p><h1 class="crm-page-title">{{ product?.name || t("$.view.loading") }}</h1></div>
      <div class="flex gap-2">
        <UButton :to="localePath('/admin/products')" color="neutral" variant="outline" icon="i-heroicons-arrow-left">{{ t("$.btn.back_to_list") }}</UButton>
        <UButton :to="editPath" icon="i-heroicons-pencil-square">{{ t("$.btn.edit") }}</UButton>
      </div>
    </div>

    <UCard v-if="pending"><p class="py-8 text-center text-muted">{{ t("$.view.loading") }}</p></UCard>
    <template v-else-if="product">
      <UCard>
        <div class="grid gap-6 md:grid-cols-[minmax(220px,0.75fr)_2fr]">
          <div class="overflow-hidden rounded-2xl bg-elevated">
            <img v-if="product.files?.[0]" :src="`/api/${product.files[0].path}`" :alt="product.files[0].name" class="h-72 w-full object-cover" />
            <div v-else class="flex h-72 items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 text-primary"><UIcon name="i-lucide-sparkles" class="size-20" /></div>
          </div>
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <UBadge v-for="category in categories" :key="category.id" color="secondary" variant="subtle">{{ category.name }}</UBadge>
              <span v-if="!categories.length" class="text-sm text-muted">{{ t("$.product.no_categories") }}</span>
              <UBadge :color="product.published ? 'success' : 'neutral'" variant="subtle">{{ product.published ? t("$.product.is_published") : t("$.product.is_hidden") }}</UBadge>
              <UBadge color="neutral" variant="outline">{{ product.sku }}</UBadge>
            </div>
            <p class="mt-5 text-3xl font-extrabold text-primary">{{ priceRange(product) }}</p>
            <div class="mt-5">
              <p class="text-xs font-bold uppercase tracking-wider text-muted">{{ t("$.product.character") }}</p>
              <p class="mt-2 text-lg font-semibold">{{ product.data?.character || "—" }}</p>
            </div>
            <div class="mt-5 rounded-2xl border-l-4 border-primary bg-primary/5 p-5">
              <p class="text-xs font-bold uppercase tracking-wider text-primary">{{ t("$.product.main_sales_argument") }}</p>
              <p class="mt-2 text-lg leading-8">{{ product.data?.main_sales_argument || product.description || "—" }}</p>
            </div>
          </div>
        </div>
      </UCard>

      <div class="grid gap-5 lg:grid-cols-3">
        <UCard>
          <template #header><div class="flex items-center gap-2"><UIcon name="i-lucide-git-compare-arrows" class="size-5 text-primary" /><h2 class="font-bold">{{ t("$.product.alternatives") }}</h2></div></template>
          <div v-if="product.alternatives?.length" class="space-y-3">
            <NuxtLink v-for="alternative in product.alternatives" :key="alternative.alternative_product_id" :to="localePath(`/admin/products/${alternative.alternative_product_id}`)" class="block rounded-xl border border-default p-3 transition hover:border-primary hover:bg-primary/5">
              <div class="flex items-start justify-between gap-3"><span class="font-bold">{{ alternative.name }}</span><span class="font-extrabold text-primary">{{ priceRange(alternative as IProduct) }}</span></div>
              <span class="mt-1 block text-xs text-muted">{{ alternative.sku }}</span>
            </NuxtLink>
          </div>
          <p v-else-if="product.data?.alternative_product_name" class="text-lg font-semibold leading-7">{{ product.data.alternative_product_name }}</p>
          <p v-else class="text-muted">{{ t("$.product.no_alternatives") }}</p>
        </UCard>
        <UCard>
          <template #header><div class="flex items-center gap-2"><UIcon name="i-lucide-trending-up" class="size-5 text-primary" /><h2 class="font-bold">{{ t("$.product.upsell_upgrade") }}</h2></div></template>
          <p class="leading-7">{{ product.data?.upsell_upgrade || "—" }}</p>
        </UCard>
        <UCard>
          <template #header><div class="flex items-center gap-2"><UIcon name="i-lucide-shopping-basket" class="size-5 text-primary" /><h2 class="font-bold">{{ t("$.product.basket_if_declined") }}</h2></div></template>
          <p class="leading-7">{{ product.data?.basket_if_upgrade_declined || "—" }}</p>
        </UCard>
      </div>

      <UCard v-if="product.files?.length">
        <template #header><h2 class="text-lg font-bold">{{ t("$.product.images") }}</h2></template>
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          <a v-for="file in product.files" :key="file.id" :href="`/api/${file.path}`" target="_blank" rel="noopener noreferrer" class="overflow-hidden rounded-xl border border-default"><img :src="`/api/${file.path}`" :alt="file.name" class="h-40 w-full object-cover" /></a>
        </div>
      </UCard>
    </template>
    <UAlert v-else color="error" variant="subtle" icon="i-heroicons-exclamation-triangle" :title="t('$.view.load_error')" />
  </div>
</template>
