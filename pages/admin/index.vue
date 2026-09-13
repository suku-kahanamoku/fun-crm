<script setup lang="ts">
import type { ICustomerProfile, IProduct } from "@/types/crm";

definePageMeta({ layout: "admin", syscode: "admin", title: "$.admin.title" });
const { t } = useLang();
const localePath = useLocalePath();
const { user } = useUserSession();
const { priceRange } = useFanProduct();

const { data: stats, pending } = useAsyncData("dashboard-stats", async () => {
  const [profilesResponse, productsResponse] = await Promise.all([
    useApi("/api/admin/profile?limit=100"),
    useApi("/api/admin/product?limit=100"),
  ]);
  const profiles = (((profilesResponse as any)?.data || []) as ICustomerProfile[]).sort(
    (a, b) => Number(a.position) - Number(b.position),
  );
  const products = ((productsResponse as any)?.data || []) as IProduct[];
  return {
    profiles,
    products,
    simulations: products.reduce(
      (total, product) => total + (product.profile_probabilities || []).length,
      0,
    ),
    strongMatches: products.reduce(
      (total, product) => total + (product.profile_probabilities || []).filter((value) => Number(value.probability_percent) >= 30).length,
      0,
    ),
  };
});

const cards = computed(() => [
  { label: t("$.admin.profiles"), value: stats.value?.profiles.length ?? 0, to: "/admin/profiles", icon: "i-lucide-contact-round", accent: "from-fuchsia-500/15 to-rose-500/5", iconClass: "bg-fuchsia-600 text-white shadow-fuchsia-500/25" },
  { label: t("$.admin.products"), value: stats.value?.products.length ?? 0, to: "/admin/products", icon: "i-heroicons-shopping-bag", accent: "from-amber-500/15 to-orange-500/5", iconClass: "bg-amber-500 text-white shadow-amber-500/25" },
  { label: t("$.dashboard.simulations"), value: stats.value?.simulations ?? 0, to: "/admin/products", icon: "i-lucide-chart-no-axes-column-increasing", accent: "from-violet-500/15 to-indigo-500/5", iconClass: "bg-violet-600 text-white shadow-violet-500/25" },
  { label: t("$.dashboard.strong_matches"), value: stats.value?.strongMatches ?? 0, to: "/admin/profiles", icon: "i-lucide-badge-percent", accent: "from-rose-500/15 to-pink-500/5", iconClass: "bg-rose-600 text-white shadow-rose-500/25" },
]);

const userName = computed(() => user.value?.first_name || t("$.dashboard.administrator"));
useHead({ title: computed(() => t("$.admin.title")) });
</script>

<template>
  <div class="mx-auto w-full max-w-7xl space-y-6 px-5 pb-12 pt-6 sm:px-7">
    <section class="crm-hero-panel p-7 sm:p-9">
      <div class="relative z-10 max-w-3xl">
        <p class="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-rose-100">{{ t("$.dashboard.eyebrow") }}</p>
        <h1 class="text-3xl font-extrabold tracking-tight sm:text-5xl">{{ t("$.dashboard.greeting", { name: userName }) }}</h1>
        <p class="mt-4 max-w-2xl text-base leading-7 text-rose-50/85 sm:text-lg">{{ t("$.dashboard.description") }}</p>
        <div class="mt-7 flex flex-wrap gap-3">
          <UButton :to="localePath('/admin/profiles')" color="secondary" size="lg" icon="i-lucide-contact-round">{{ t("$.dashboard.browse_profiles") }}</UButton>
          <UButton :to="localePath('/admin/products')" color="neutral" variant="soft" size="lg" trailing-icon="i-heroicons-arrow-right">{{ t("$.dashboard.browse_catalogue") }}</UButton>
        </div>
      </div>
    </section>

    <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <NuxtLink v-for="card in cards" :key="card.label" :to="localePath(card.to)" class="group relative overflow-hidden rounded-2xl border border-default/80 bg-default/90 p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div :class="card.accent" class="absolute inset-0 bg-gradient-to-br opacity-80" />
        <div class="relative flex items-start justify-between">
          <span :class="card.iconClass" class="grid size-12 place-items-center rounded-2xl shadow-lg"><UIcon :name="card.icon" class="size-6" /></span>
          <UIcon name="i-heroicons-arrow-up-right" class="size-5 text-muted transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
        </div>
        <USkeleton v-if="pending" class="relative mt-8 h-10 w-24" />
        <p v-else class="relative mt-8 text-4xl font-extrabold tracking-tight text-highlighted">{{ card.value }}</p>
        <p class="relative mt-1 font-bold text-muted">{{ card.label }}</p>
      </NuxtLink>
    </section>

    <section class="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <div><p class="crm-eyebrow">{{ t("$.profile.reference_data") }}</p><h2 class="text-xl font-extrabold">{{ t("$.dashboard.profile_overview") }}</h2></div>
            <UButton :to="localePath('/admin/profiles')" color="neutral" variant="ghost" trailing-icon="i-heroicons-arrow-right">{{ t("$.dashboard.all_profiles") }}</UButton>
          </div>
        </template>
        <div class="grid gap-3 sm:grid-cols-2">
          <NuxtLink v-for="profile in stats?.profiles" :key="profile.id" :to="localePath(`/admin/profiles/${profile.id}`)" class="flex gap-3 rounded-xl border border-default p-3 transition hover:border-primary hover:bg-primary/5">
            <span class="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 font-black text-primary">{{ profile.profile_number }}</span>
            <span class="min-w-0"><span class="block font-bold">{{ profile.name }}</span><span class="mt-1 block line-clamp-2 text-xs leading-5 text-muted">{{ profile.selection_need }}</span></span>
          </NuxtLink>
        </div>
      </UCard>

      <UCard>
        <template #header><div><p class="crm-eyebrow">{{ t("$.dashboard.catalogue") }}</p><h2 class="text-xl font-extrabold">{{ t("$.dashboard.latest_products") }}</h2></div></template>
        <div v-if="stats?.products.length" class="space-y-3">
          <NuxtLink v-for="product in stats.products.slice(0, 6)" :key="product.id" :to="localePath(`/admin/products/${product.id}`)" class="flex items-center gap-3 rounded-xl border border-default p-3 transition hover:border-primary hover:bg-primary/5">
            <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary/10 text-secondary"><UIcon name="i-lucide-sparkles" class="size-5" /></span>
            <span class="min-w-0 flex-1"><span class="block truncate font-bold">{{ product.name }}</span><span class="block truncate text-xs text-muted">{{ product.data?.character }}</span></span>
            <span class="whitespace-nowrap text-sm font-extrabold text-primary">{{ priceRange(product) }}</span>
          </NuxtLink>
        </div>
        <p v-else class="py-6 text-center text-muted">{{ t("$.dashboard.no_products") }}</p>
      </UCard>
    </section>
  </div>
</template>
