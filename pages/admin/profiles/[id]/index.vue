<script setup lang="ts">
import type { IAnimalCategory, ICustomerProfile, IProduct } from "@/types/crm";

definePageMeta({
  layout: "admin",
  syscode: "admin_profiles_detail",
  title: "$.admin.profile_detail",
});

const { t } = useLang();
const localePath = useLocalePath();
const resourceId = useResourceId();
const { priceRange } = useFanProduct();
const { data: profileResponse, pending } = useAsyncData(
  () => `customer-profile-${resourceId.value}`,
  () => useApi(`/api/admin/profile/${resourceId.value}`),
);
const { data: productsResponse } = useAsyncData(
  () => `customer-profile-${resourceId.value}-products`,
  () => useApi("/api/admin/product?limit=100"),
);
const { data: categoriesResponse } = useAsyncData("profile-product-categories", () =>
  useApi("/api/admin/category?limit=100"),
);
const categoryMap = computed(() => Object.fromEntries(
  (((categoriesResponse.value as any)?.data || []) as IAnimalCategory[])
    .map((category) => [Number(category.id), category.name]),
));
const productCategories = (product: IProduct) => (product.category_ids || [])
  .map((id) => categoryMap.value[Number(id)])
  .filter(Boolean);
const profile = computed(() => (profileResponse.value as any)?.data as ICustomerProfile | undefined);
const products = computed(() => {
  if (!profile.value) return [];
  return (((productsResponse.value as any)?.data || []) as IProduct[])
    .map((product) => ({
      ...product,
      probability: Number(product.profile_probabilities?.find((row) => Number(row.customer_profile_id) === Number(profile.value?.id))?.probability_percent || 0),
    }))
    .filter((product) => product.probability >= 30)
    .sort((a, b) => b.probability - a.probability || a.name.localeCompare(b.name));
});

useHead({ title: computed(() => profile.value?.name || t("$.admin.profile_detail")) });
</script>

<template>
  <div class="mx-auto w-full max-w-6xl space-y-5 px-5 pb-10">
    <div class="crm-page-heading flex-wrap">
      <div>
        <p class="crm-eyebrow">{{ t("$.admin.profile_detail") }}</p>
        <h1 class="crm-page-title">{{ profile?.name || t("$.view.loading") }}</h1>
      </div>
      <UButton :to="localePath('/admin/profiles')" color="neutral" variant="outline" icon="i-heroicons-arrow-left">
        {{ t("$.btn.back_to_list") }}
      </UButton>
    </div>

    <UCard v-if="pending"><p class="py-8 text-center text-muted">{{ t("$.view.loading") }}</p></UCard>
    <template v-else-if="profile">
      <UCard>
        <div class="flex flex-col gap-5 sm:flex-row sm:items-start">
          <span class="grid size-20 shrink-0 place-items-center rounded-3xl bg-primary text-3xl font-black text-white shadow-lg shadow-primary/25">
            {{ profile.profile_number }}
          </span>
          <div>
            <p class="text-xs font-bold uppercase tracking-wider text-muted">{{ t("$.profile.selection_need") }}</p>
            <p class="mt-2 text-xl font-semibold leading-8">{{ profile.selection_need }}</p>
          </div>
        </div>
      </UCard>

      <div class="grid gap-5 lg:grid-cols-2">
        <UCard>
          <template #header><h2 class="text-lg font-bold">{{ t("$.profile.sales_questions") }}</h2></template>
          <ol class="space-y-4">
            <li v-for="(question, index) in profile.questions" :key="question" class="flex gap-3">
              <span class="grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-black text-primary">{{ index + 1 }}</span>
              <span class="leading-7">{{ question }}</span>
            </li>
          </ol>
        </UCard>
        <UCard>
          <template #header><h2 class="text-lg font-bold">{{ t("$.profile.typical_objections") }}</h2></template>
          <ul class="space-y-4">
            <li v-for="objection in profile.objections" :key="objection" class="rounded-xl border-l-4 border-secondary bg-secondary/5 px-4 py-3 italic">
              „{{ objection }}“
            </li>
          </ul>
        </UCard>
      </div>

      <UCard>
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <div>
              <h2 class="text-lg font-bold">{{ t("$.profile.product_probabilities") }}</h2>
              <p class="mt-1 text-sm text-muted">{{ t("$.profile.product_probabilities_help") }}</p>
            </div>
            <UBadge color="primary" variant="subtle">{{ products.length }}</UBadge>
          </div>
        </template>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[680px] text-left text-sm">
            <thead class="border-b border-default text-xs uppercase tracking-wide text-muted">
              <tr>
                <th class="px-3 py-3">{{ t("$.product.name") }}</th>
                <th class="px-3 py-3">{{ t("$.product.categories") }}</th>
                <th class="px-3 py-3">{{ t("$.product.approx_price") }}</th>
                <th class="px-3 py-3 text-right">{{ t("$.product.purchase_probability") }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in products" :key="product.id" class="border-b border-default last:border-0">
                <td class="px-3 py-3">
                  <NuxtLink :to="localePath(`/admin/products/${product.id}`)" class="font-bold text-primary hover:underline">{{ product.name }}</NuxtLink>
                </td>
                <td class="px-3 py-3">
                  <div class="flex flex-wrap gap-1">
                    <UBadge v-for="category in productCategories(product)" :key="category" color="neutral" variant="subtle">{{ category }}</UBadge>
                    <span v-if="!productCategories(product).length" class="text-muted">{{ t("$.product.no_categories") }}</span>
                  </div>
                </td>
                <td class="px-3 py-3">{{ priceRange(product) }}</td>
                <td class="px-3 py-3 text-right">
                  <UBadge :color="product.probability >= 30 ? 'primary' : 'neutral'" variant="subtle" size="lg">{{ product.probability }} %</UBadge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UCard>
    </template>
    <UAlert v-else color="error" variant="subtle" icon="i-heroicons-exclamation-triangle" :title="t('$.view.load_error')" />
  </div>
</template>
