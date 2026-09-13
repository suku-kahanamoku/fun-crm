<script setup lang="ts">
import type { ICustomerProfile } from "@/types/crm";

definePageMeta({
  layout: "admin",
  syscode: "admin_profiles",
  title: "$.admin.profiles",
});

const { t } = useLang();
const localePath = useLocalePath();
const viewMode = ref<"table" | "cards">("table");
const { data: response, pending } = useAsyncData("customer-profiles", () =>
  useApi("/api/admin/profile?limit=100"),
);
const profiles = computed(() =>
  (((response.value as any)?.data || []) as ICustomerProfile[]).sort(
    (a, b) => Number(a.position) - Number(b.position),
  ),
);

useHead({ title: computed(() => t("$.admin.profiles")) });
</script>

<template>
  <div class="mx-auto w-full max-w-7xl px-5 pb-10">
    <div class="crm-page-heading">
      <div>
        <p class="crm-eyebrow">{{ t("$.profile.reference_data") }}</p>
        <h1 class="crm-page-title">{{ t("$.admin.profiles") }}</h1>
        <p class="mt-2 max-w-3xl text-sm text-muted">
          {{ t("$.profile.list_description") }}
        </p>
      </div>
      <div class="crm-view-switcher">
        <UButton
          :variant="viewMode === 'table' ? 'soft' : 'ghost'"
          color="neutral"
          icon="i-heroicons-table-cells"
          :aria-label="t('$.view.table')"
          @click="viewMode = 'table'"
        />
        <UButton
          :variant="viewMode === 'cards' ? 'soft' : 'ghost'"
          color="neutral"
          icon="i-heroicons-squares-2x2"
          :aria-label="t('$.view.cards')"
          @click="viewMode = 'cards'"
        />
      </div>
    </div>

    <div v-if="pending" class="crm-data-panel p-10 text-center text-muted">
      {{ t("$.view.loading") }}
    </div>

    <div v-else-if="viewMode === 'table'" class="crm-data-panel overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[980px] text-left text-sm">
          <thead class="border-b border-default bg-elevated/60 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th class="w-20 px-4 py-3">{{ t("$.profile.number") }}</th>
              <th class="px-4 py-3">{{ t("$.profile.name") }}</th>
              <th class="px-4 py-3">{{ t("$.profile.selection_need") }}</th>
              <th class="px-4 py-3">{{ t("$.profile.sales_questions") }}</th>
              <th class="px-4 py-3">{{ t("$.profile.typical_objections") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="profile in profiles"
              :key="profile.id"
              class="cursor-pointer border-b border-default align-top transition last:border-0 hover:bg-primary/5"
              @click="navigateTo(localePath(`/admin/profiles/${profile.id}`))"
            >
              <td class="px-4 py-4">
                <span class="grid size-9 place-items-center rounded-full bg-primary/10 font-extrabold text-primary">
                  {{ profile.profile_number }}
                </span>
              </td>
              <td class="px-4 py-4 font-bold text-highlighted">
                <NuxtLink :to="localePath(`/admin/profiles/${profile.id}`)" class="hover:text-primary" @click.stop>
                  {{ profile.name }}
                </NuxtLink>
              </td>
              <td class="max-w-72 px-4 py-4 leading-6 text-muted">{{ profile.selection_need }}</td>
              <td class="max-w-80 px-4 py-4">
                <ol class="space-y-1.5">
                  <li v-for="(question, index) in profile.questions" :key="question" class="flex gap-2">
                    <span class="font-bold text-primary">{{ index + 1 }}.</span><span>{{ question }}</span>
                  </li>
                </ol>
              </td>
              <td class="max-w-72 px-4 py-4">
                <ul class="space-y-1.5 text-muted">
                  <li v-for="objection in profile.objections" :key="objection">„{{ objection }}“</li>
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <NuxtLink
        v-for="profile in profiles"
        :key="profile.id"
        :to="localePath(`/admin/profiles/${profile.id}`)"
        class="crm-record-card rounded-2xl border border-default p-5 transition hover:-translate-y-1 hover:border-primary hover:shadow-xl"
      >
        <div class="flex items-start gap-3">
          <span class="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary text-lg font-black text-white">
            {{ profile.profile_number }}
          </span>
          <div>
            <h2 class="text-lg font-extrabold text-highlighted">{{ profile.name }}</h2>
            <p class="mt-2 leading-6 text-muted">{{ profile.selection_need }}</p>
          </div>
        </div>
        <div class="mt-5 border-t border-default pt-4 text-sm">
          <p class="font-bold">{{ t("$.profile.first_question") }}</p>
          <p class="mt-1 text-muted">{{ profile.questions[0] }}</p>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
