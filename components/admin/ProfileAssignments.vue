<script setup lang="ts">
import type { ICustomerProfile } from "@/types/crm";
type Assignment = { customer_profile_id: number; position: number };
const model = defineModel<Assignment[]>({ default: () => [] });
const { data, status } = await useAsyncData("customer-profile-options", () =>
  useApi("/api/admin/profile?limit=100"),
);
const profiles = computed(() => (((data.value as any)?.data || []) as ICustomerProfile[]));
const selected = (id: number) => model.value.some((v) => Number(v.customer_profile_id) === Number(id));
function toggle(id: number, checked: boolean) {
  if (checked) model.value = [...model.value, { customer_profile_id: id, position: model.value.length + 1 }];
  else model.value = model.value.filter((v) => Number(v.customer_profile_id) !== Number(id));
  normalize();
}
function position(id: number) { return model.value.find((v) => Number(v.customer_profile_id) === Number(id))?.position || 1; }
function setPosition(id: number, value: string) {
  model.value = model.value.map((v) => Number(v.customer_profile_id) === Number(id) ? { ...v, position: Math.max(1, Number(value) || 1) } : v);
  normalize();
}
function normalize() {
  const sorted = [...model.value].sort((a,b) => a.position - b.position);
  model.value = sorted.map((v,i) => ({ ...v, position: i + 1 }));
}
</script>
<template>
  <section class="rounded-2xl border border-default p-5">
    <div class="mb-4">
      <h2 class="font-bold">Profily zákazníka</h2>
      <p class="text-sm text-muted">Zákazník může mít více profilů. Nižší číslo znamená dřívější pořadí.</p>
    </div>
    <p v-if="status === 'pending'" class="text-sm text-muted">Načítám profily…</p>
    <div v-else class="grid gap-2 md:grid-cols-2">
      <label v-for="profile in profiles" :key="profile.id" class="flex items-center gap-3 rounded-xl bg-elevated px-4 py-3">
        <input type="checkbox" :checked="selected(Number(profile.id))" @change="toggle(Number(profile.id), ($event.target as HTMLInputElement).checked)" />
        <span class="min-w-0 flex-1 font-medium">{{ profile.name }}</span>
        <input v-if="selected(Number(profile.id))" type="number" min="1" class="w-16 rounded-md border border-default bg-default px-2 py-1" :value="position(Number(profile.id))" aria-label="Pořadí profilu" @change="setPosition(Number(profile.id), ($event.target as HTMLInputElement).value)" />
      </label>
    </div>
  </section>
</template>
