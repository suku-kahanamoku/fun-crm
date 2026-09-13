<script setup lang="ts">
import configSource from "@/assets/configs/client-detail.json";
import type { IClient, ICustomerProfile, IProduct } from "@/types/crm";

definePageMeta({ layout: "admin", syscode: "admin_clients_detail", title: "$.admin.client_detail" });
const { t, locale } = useLang();
const route = useRoute();
const localePath = useLocalePath();
const { priceRange } = useFanProduct();
const { config, response, loading: pending } = useAdminResource<IClient>(configSource, "admin_clients");
const { data: productsResponse } = useAsyncData("client-detail-products", () => useApi("/api/admin/product?limit=100"));
const client = computed(() => (response.value as any)?.data as IClient | undefined);
const assignedProfile = computed(() => [...(client.value?.profiles || [])].sort((a,b) => a.position-b.position)[0]);
const recommendedProducts = computed(() => {
  const profileIds = new Set((client.value?.profiles || []).map((profile) => Number(profile.id)));
  if (!profileIds.size) return [];
  return (((productsResponse.value as any)?.data || []) as IProduct[])
    .map((product) => ({ ...product, probability: Math.max(0, ...(product.profile_probabilities || []).filter((row) => profileIds.has(Number(row.customer_profile_id))).map((row) => Number(row.probability_percent))) }))
    .filter((product) => product.probability >= 30)
    .sort((a, b) => b.probability - a.probability || a.name.localeCompare(b.name));
});
const fullName = computed(() => client.value ? `${client.value.first_name} ${client.value.last_name}` : t("$.admin.client_detail"));
const editPath = computed(() => {
  const path = route.path.replace(new RegExp(`^/${locale.value}(?=/|$)`), "");
  return localePath(`${path}/edit`);
});
useHead({ title: fullName });
</script>

<template>
  <div class="mx-auto w-full max-w-6xl space-y-5 px-5 pb-10">
    <div class="crm-page-heading flex-wrap">
      <div><p class="crm-eyebrow">{{ t("$.admin.client_detail") }}</p><h1 class="crm-page-title">{{ fullName }}</h1></div>
      <div class="flex gap-2"><UButton :to="localePath('/admin/clients')" color="neutral" variant="outline" icon="i-heroicons-arrow-left">{{ t("$.btn.back_to_list") }}</UButton><UButton :to="editPath" icon="i-heroicons-pencil-square">{{ t("$.btn.edit") }}</UButton></div>
    </div>
    <UCard v-if="pending"><p class="py-8 text-center text-muted">{{ t("$.view.loading") }}</p></UCard>
    <template v-else-if="client">
      <UCard>
        <div class="grid gap-6 md:grid-cols-[1fr_2fr]">
          <div class="rounded-2xl bg-elevated p-5">
            <div class="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-black text-primary">{{ client.first_name.charAt(0) }}{{ client.last_name.charAt(0) }}</div>
            <h2 class="text-xl font-bold">{{ fullName }}</h2><p class="text-muted">{{ client.email }}</p><p v-if="client.phone" class="mt-1 text-muted">{{ client.phone }}</p>
            <UBadge class="mt-4" color="neutral" variant="subtle">{{ t(`$.status.${client.status || 'active'}`) }}</UBadge>
          </div>
          <div v-if="assignedProfile">
            <div class="flex items-center gap-3"><span class="grid size-11 place-items-center rounded-xl bg-primary text-lg font-black text-white">{{ assignedProfile.profile_number }}</span><div><p class="text-xs font-bold uppercase tracking-wide text-muted">{{ t("$.client.type") }} · pořadí {{ assignedProfile.position }}</p><NuxtLink :to="localePath(`/admin/profiles/${assignedProfile.id}`)" class="text-xl font-extrabold hover:text-primary">{{ assignedProfile.name }}</NuxtLink></div></div>
            <p class="mt-5 text-lg leading-8">{{ assignedProfile.selection_need }}</p>
            <div class="mt-4 flex flex-wrap gap-2"><UBadge v-for="profile in client.profiles" :key="profile.id" color="neutral" variant="subtle">{{ profile.position }}. {{ profile.name }}</UBadge></div>
          </div>
          <div v-else class="flex items-center justify-center rounded-2xl border border-dashed border-default p-8 text-center text-muted">{{ t("$.client.type_unassigned") }}</div>
        </div>
      </UCard>

      <div v-if="assignedProfile" class="grid gap-5 lg:grid-cols-2">
        <UCard><template #header><h2 class="text-lg font-bold">{{ t("$.profile.sales_questions") }}</h2></template><ol class="space-y-3"><li v-for="(question, index) in assignedProfile.questions" :key="question" class="flex gap-3"><span class="font-black text-primary">{{ index + 1 }}.</span><span>{{ question }}</span></li></ol></UCard>
        <UCard><template #header><h2 class="text-lg font-bold">{{ t("$.profile.typical_objections") }}</h2></template><ul class="space-y-3"><li v-for="objection in assignedProfile.objections" :key="objection" class="rounded-xl bg-secondary/5 px-4 py-3 italic">„{{ objection }}“</li></ul></UCard>
      </div>

      <UCard>
        <template #header><div class="flex items-center justify-between gap-3"><div><h2 class="text-lg font-bold">{{ t("$.client.recommended_products") }}</h2><p class="mt-1 text-sm text-muted">{{ t("$.client.recommendations_by_probability") }}</p></div><UBadge color="primary" variant="subtle">{{ recommendedProducts.length }}</UBadge></div></template>
        <div v-if="recommendedProducts.length" class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <NuxtLink v-for="product in recommendedProducts" :key="product.id" :to="localePath(`/admin/products/${product.id}`)" class="rounded-xl border border-default p-4 transition hover:border-primary hover:bg-primary/5"><div class="flex items-start justify-between gap-2"><p class="font-bold">{{ product.name }}</p><UBadge color="primary" variant="subtle">{{ product.probability }} %</UBadge></div><p class="mt-2 text-sm text-muted">{{ product.data?.character }}</p><p class="mt-3 font-extrabold text-primary">{{ priceRange(product) }}</p></NuxtLink>
        </div>
        <p v-else class="text-muted">{{ t("$.client.no_recommendations") }}</p>
      </UCard>
    </template>
  </div>
</template>
