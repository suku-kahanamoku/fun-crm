<script setup lang="ts">
import type { IProduct, IProductAlternative } from "@/types/crm";

const props = defineProps<{ currentProductId?: number }>();
const model = defineModel<IProductAlternative[]>({ default: () => [] });
const { t } = useLang();
const { data, status } = await useAsyncData("product-alternative-options", () =>
  useApi("/api/admin/product?limit=100"),
);
const products = computed(() =>
  (((data.value as any)?.data || []) as IProduct[])
    .filter((product) => Number(product.id) !== Number(props.currentProductId || 0))
    .sort((a, b) => a.name.localeCompare(b.name)),
);
const selectedIds = computed(() => new Set(model.value.map((row) => Number(row.alternative_product_id))));

function toggle(productId: number, checked: boolean) {
  if (checked) {
    model.value = [...model.value, { alternative_product_id: productId, position: model.value.length + 1 }];
  } else {
    model.value = model.value
      .filter((row) => Number(row.alternative_product_id) !== productId)
      .map((row, index) => ({ ...row, position: index + 1 }));
  }
}

function move(index: number, offset: number) {
  const target = index + offset;
  if (target < 0 || target >= model.value.length) return;
  const next = [...model.value];
  [next[index], next[target]] = [next[target], next[index]];
  model.value = next.map((row, rowIndex) => ({ ...row, position: rowIndex + 1 }));
}

const productById = computed(() => Object.fromEntries(products.value.map((product) => [Number(product.id), product])));
</script>

<template>
  <section class="rounded-2xl border border-default p-5">
    <div class="mb-4">
      <h2 class="font-bold">{{ t("$.product.alternatives") }}</h2>
      <p class="text-sm text-muted">{{ t("$.product.alternatives_help") }}</p>
    </div>
    <p v-if="status === 'pending'" class="text-sm text-muted">{{ t("$.view.loading") }}</p>
    <div v-else class="grid gap-5 lg:grid-cols-2">
      <div class="max-h-72 space-y-1 overflow-y-auto rounded-xl border border-default p-2">
        <label v-for="product in products" :key="product.id" class="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 hover:bg-elevated">
          <input type="checkbox" :checked="selectedIds.has(Number(product.id))" @change="toggle(Number(product.id), ($event.target as HTMLInputElement).checked)" />
          <span class="min-w-0"><span class="block truncate font-medium">{{ product.name }}</span><span class="block text-xs text-muted">{{ product.sku }}</span></span>
        </label>
      </div>
      <div>
        <p v-if="!model.length" class="text-sm text-muted">{{ t("$.product.no_alternatives") }}</p>
        <ol v-else class="space-y-2">
          <li v-for="(alternative, index) in model" :key="alternative.alternative_product_id" class="flex items-center gap-2 rounded-xl border border-default p-3">
            <span class="grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-black text-primary">{{ index + 1 }}</span>
            <span class="min-w-0 flex-1 truncate font-medium">{{ productById[alternative.alternative_product_id]?.name || alternative.name }}</span>
            <UButton size="xs" color="neutral" variant="ghost" icon="i-heroicons-arrow-up" :disabled="index === 0" @click="move(index, -1)" />
            <UButton size="xs" color="neutral" variant="ghost" icon="i-heroicons-arrow-down" :disabled="index === model.length - 1" @click="move(index, 1)" />
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>
