<script setup lang="ts">
import type { IFormField } from "@suku-kahanamoku/form-module/types";

definePageMeta({
  syscode: "login",
  title: "$.login.title",
  label: "$.login.label",
});
const { t } = useLang();
const localePath = useLocalePath();
const { display } = useToastify();
const { fetch: refreshSession } = useUserSession();
const loading = ref(false);
const fields: IFormField[] = [
  {
    name: "email",
    type: "email",
    label: "$.client.email",
    placeholder: "admin@fann.cz",
    required: true,
    clearable: true,
    size: "lg",
  },
  {
    name: "password",
    type: "password",
    label: "$.client.password",
    required: true,
    clearable: true,
    minLength: 5,
    size: "lg",
  },
];

async function submit(body: Record<string, any>) {
  loading.value = true;
  try {
    await $fetch("/api/login", { method: "POST", body });
    await refreshSession();
    await navigateTo(localePath("/admin"));
  } catch (error: any) {
    display({
      type: "error",
      message:
        error?.data?.message ||
        error?.data?.statusMessage ||
        t("$.login.failed"),
    });
  } finally {
    loading.value = false;
  }
}

useHead({ title: computed(() => t("$.login.title")) });
useSeoMeta({ robots: "noindex, nofollow" });
</script>

<template>
  <div
    class="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-10 px-5 py-12 lg:grid-cols-[1.1fr_0.9fr]"
  >
    <section class="hidden lg:block">
      <div class="crm-hero-panel p-10">
        <div class="relative z-10 max-w-xl">
          <span
            class="mb-7 grid size-16 place-items-center rounded-2xl bg-white/15 shadow-xl backdrop-blur"
          >
            <UIcon name="i-lucide-sparkles" class="size-9" />
          </span>
          <p
            class="text-xs font-extrabold uppercase tracking-[0.22em] text-emerald-100"
          >
            {{ t("$.login.hero_eyebrow") }}
          </p>
          <h1 class="mt-4 text-5xl font-extrabold leading-tight tracking-tight">
            {{ t("$.login.hero_title") }}
          </h1>
          <p class="mt-5 text-lg leading-8 text-emerald-50/85">
            {{ t("$.login.hero_description") }}
          </p>
          <div class="mt-9 grid grid-cols-3 gap-3">
            <div class="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <UIcon name="i-heroicons-users" class="mb-3 size-6" />
              <p class="text-sm font-bold">
                {{ t("$.login.feature_profiles") }}
              </p>
            </div>
            <div class="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <UIcon name="i-heroicons-shopping-bag" class="mb-3 size-6" />
              <p class="text-sm font-bold">
                {{ t("$.login.feature_catalogue") }}
              </p>
            </div>
            <div class="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <UIcon name="i-heroicons-sparkles" class="mb-3 size-6" />
              <p class="text-sm font-bold">
                {{ t("$.login.feature_recommendations") }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="mx-auto w-full max-w-md">
      <div class="mb-8">
        <p class="crm-eyebrow">{{ t("$.login.secure_access") }}</p>
        <h1 class="crm-page-title">{{ t("$.login.title") }}</h1>
        <p class="mt-3 text-muted">{{ t("$.login.description") }}</p>
      </div>
      <div class="crm-form-shell p-2">
        <CmpForm
          :fields="fields"
          :loading="loading"
          :ui="{
            root: 'w-full border-0 bg-transparent p-5 shadow-none',
            body: 'grid gap-5',
          }"
          @submit="submit"
        />
      </div>
      <p class="mt-5 text-center text-xs text-muted">
        {{ t("$.login.authorized_only") }}
      </p>
    </section>
  </div>
</template>
