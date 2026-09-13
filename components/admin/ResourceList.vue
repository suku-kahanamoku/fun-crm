<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title: string;
    config: Record<string, any>;
    listRouteSyscode: string;
    createPath: string;
    nameField?: string;
    resource: "client" | "product" | "category";
  }>(),
  { nameField: "name" },
);

const { t } = useLang();
const localePath = useLocalePath();
const {
  config,
  response,
  meta,
  loading,
  selected,
  deleteDialogOpen,
  onDelete,
  handleSort,
  handlePage,
  handleFilter,
} = useAdminResource<Record<string, any>>(props.config, props.listRouteSyscode);

const viewMode = ref<"table" | "cards">("table");
const cardViewEnabled = computed({
  get: () => viewMode.value === "cards",
  set: (enabled: boolean) => {
    viewMode.value = enabled ? "cards" : "table";
  },
});
const filterDraft = reactive<Record<string, any>>({});
const rows = computed(
  () => ((response.value as any)?.data || []) as Record<string, any>[],
);
const fields = computed(
  () => (config.value?.fields || []) as Record<string, any>[],
);
const filterFields = computed(() =>
  fields.value.filter((field) => field.filterable),
);
const listBasePath = computed(() => props.createPath.replace(/\/create$/, ""));
const allSelected = computed(
  () =>
    rows.value.length > 0 &&
    rows.value.every((row) =>
      selected.value.some((item) => item.id === row.id),
    ),
);
const activeFilterCount = computed(
  () =>
    Object.values(filterDraft).filter(
      (value) => value !== "" && value !== null && value !== undefined,
    ).length,
);
const filterAccordion = computed(() => [
  {
    label: activeFilterCount.value
      ? `${t("$.filter.title")} (${activeFilterCount.value})`
      : t("$.filter.title"),
    icon: "i-heroicons-funnel",
  },
]);

const { data: remoteOptions } = useAsyncData(
  () => `${config.value?.syscode || props.listRouteSyscode}-filter-options`,
  async () => {
    const entries = await Promise.all(
      fields.value
        .filter((field) => field.restOptions?.url)
        .map(async (field) => {
          const result = await useApi(field.restOptions.url);
          return [field.name, (result as any)?.data || []] as const;
        }),
    );
    return Object.fromEntries(entries);
  },
  { watch: [config] },
);
const categoryRelation = computed(
  () => config.value?.relations?.categories as Record<string, any> | undefined,
);
const { data: categoryResponse } = useAsyncData(
  () => `${config.value?.syscode || props.listRouteSyscode}-category-options`,
  () =>
    categoryRelation.value?.restUrl
      ? useApi(categoryRelation.value.restUrl)
      : Promise.resolve({}),
  { watch: [categoryRelation] },
);
const categories = computed(
  () => ((categoryResponse.value as any)?.data || []) as Record<string, any>[],
);
const categoryMap = computed(() => {
  const valueKey = categoryRelation.value?.value || "id";
  const labelKey = categoryRelation.value?.label || "name";
  return Object.fromEntries(
    categories.value.map((category) => [
      Number(category[valueKey]),
      category[labelKey],
    ]),
  );
});

watch(
  fields,
  (currentFields) => {
    for (const field of currentFields) {
      if (field.filterable) filterDraft[field.name] = field.value ?? "";
    }
  },
  { immediate: true, deep: true },
);

function detailUrl(item: Record<string, any>): string {
  return localePath(item.gen_data?.url || `${listBasePath.value}/${item.id}`);
}

function getValue(item: Record<string, any>, path: string): any {
  return path.split(".").reduce((value, key) => value?.[key], item);
}

function formatValue(
  item: Record<string, any>,
  field: Record<string, any>,
): string {
  const value = getValue(item, field.colName || field.name);
  if (field.name === "price_range") {
    const range = item.data?.approx_price;
    if (!range) return "—";
    const formatter = new Intl.NumberFormat("cs-CZ", {
      style: "currency",
      currency: range.currency || "CZK",
      maximumFractionDigits: 0,
    });
    return `${formatter.format(Number(range.min))} – ${formatter.format(Number(range.max))}`;
  }
  if (field.name === "profile_id")
    return (item.profiles || []).map((profile: any) => `${profile.position}. ${profile.name}`).join(", ") || "—";
  if (value === null || value === undefined || value === "") return "—";
  if (field.name === "status") return t(`$.status.${value}`);
  if (field.name === "category.syscode" || field.name === "category_ids")
    return productCategories(item).join(", ") || t("$.product.no_categories");
  if (field.name === "published")
    return value ? t("$.form.yes") : t("$.form.no");
  if (field.name === "price") {
    return new Intl.NumberFormat("cs-CZ", {
      style: "currency",
      currency: "CZK",
    }).format(Number(value));
  }
  return String(value);
}

function filterOptions(field: Record<string, any>): Record<string, any>[] {
  if (field.restOptions) {
    return (
      ((remoteOptions.value as any)?.[field.name] || []) as Record<
        string,
        any
      >[]
    ).map((item) => ({
      label: item[field.restOptions.label || "label"],
      value: item[field.restOptions.value || "value"],
    }));
  }
  return (field.options || []).map((option: Record<string, any>) => ({
    ...option,
    label: String(option.label).startsWith("$.")
      ? t(option.label)
      : option.label,
  }));
}

function isSelected(item: Record<string, any>): boolean {
  return selected.value.some((selectedItem) => selectedItem.id === item.id);
}

function toggleSelected(
  item: Record<string, any>,
  checked: boolean | "indeterminate",
) {
  selected.value = checked
    ? [
        ...selected.value.filter((selectedItem) => selectedItem.id !== item.id),
        item,
      ]
    : selected.value.filter((selectedItem) => selectedItem.id !== item.id);
}

function toggleAll(checked: boolean | "indeterminate") {
  selected.value = checked ? [...rows.value] : [];
}

function sortDirection(fieldName: string): "asc" | "desc" | null {
  const sort = ((config.value as any)?.sort || []) as Record<string, number>[];
  const current = sort.find((item) => fieldName in item);
  return current ? (current[fieldName] === 1 ? "asc" : "desc") : null;
}

function toggleSort(fieldName: string) {
  const field = fields.value.find((item) => item.name === fieldName);
  if (field?.sortable === false) return;
  const direction = sortDirection(fieldName);
  handleSort(
    direction === null
      ? [{ [fieldName]: 1 }]
      : direction === "asc"
        ? [{ [fieldName]: -1 }]
        : [],
  );
}

function applyFilters() {
  handleFilter({ ...filterDraft } as Record<string, string>);
}

function resetFilters() {
  for (const field of filterFields.value) filterDraft[field.name] = "";
  applyFilters();
}

function productCategories(item: Record<string, any>): string[] {
  return (item.category_ids || [])
    .map((id: number) => categoryMap.value[Number(id)])
    .filter(Boolean);
}

async function confirmDelete(confirmed: boolean) {
  await onDelete(confirmed);
}

function openDeleteDialog(): void {
  deleteDialogOpen.value = true;
}

function openDetail(item: Record<string, any>): void {
  void navigateTo(detailUrl(item));
}
</script>

<template>
  <div v-if="config" class="mx-auto w-full max-w-7xl px-5 pb-10">
    <div class="crm-page-heading">
      <div>
        <p class="crm-eyebrow">{{ t("$.base.workspace") }}</p>
        <h1 class="crm-page-title">{{ title }}</h1>
        <p class="mt-2 max-w-2xl text-sm text-muted">
          {{ t(`$.view.${resource}_description`) }}
        </p>
      </div>
      <div class="crm-view-switcher">
        <span
          :class="viewMode === 'table' ? 'text-highlighted' : 'text-muted'"
          class="inline-flex items-center gap-1.5 text-sm font-bold"
        >
          <UIcon name="i-heroicons-table-cells" class="size-4" />
          {{ t("$.view.table") }}
        </span>
        <USwitch
          v-model="cardViewEnabled"
          color="primary"
          :aria-label="t('$.view.switch_aria')"
        />
        <span
          :class="viewMode === 'cards' ? 'text-highlighted' : 'text-muted'"
          class="inline-flex items-center gap-1.5 text-sm font-bold"
        >
          <UIcon name="i-heroicons-squares-2x2" class="size-4" />
          {{ t("$.view.cards") }}
        </span>
      </div>
    </div>

    <UAccordion
      :items="filterAccordion"
      class="mb-4 rounded-xl border border-default bg-default px-4"
    >
      <template #body>
        <form
          class="grid gap-4 pb-4 md:grid-cols-2 xl:grid-cols-4"
          @submit.prevent="applyFilters"
        >
          <UFormField
            v-for="field in filterFields"
            :key="field.name"
            :label="t(field.label)"
          >
            <USelect
              v-if="field.type === 'select'"
              v-model="filterDraft[field.name]"
              :items="filterOptions(field)"
              value-key="value"
              label-key="label"
              :placeholder="t('$.filter.all')"
              class="w-full"
            />
            <UInput
              v-else
              v-model="filterDraft[field.name]"
              :type="field.type === 'number' ? 'number' : 'text'"
              class="w-full"
            />
          </UFormField>
          <div class="flex items-end gap-2">
            <UButton type="submit" icon="i-heroicons-magnifying-glass">{{
              t("$.filter.apply")
            }}</UButton>
            <UButton
              type="button"
              color="neutral"
              variant="outline"
              @click="resetFilters"
            >
              {{ t("$.filter.reset") }}
            </UButton>
          </div>
        </form>
      </template>
    </UAccordion>

    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <p class="text-sm font-semibold text-muted">
        {{ t("$.view.records_count", { count: meta?.total ?? rows.length }) }}
      </p>
      <div class="flex gap-2">
        <UButton
          icon="i-heroicons-trash"
          color="error"
          variant="outline"
          :aria-label="t('$.aria.delete_selected')"
          :disabled="!selected.length"
          :loading="loading"
          @click="openDeleteDialog"
        />
        <UButton
          :to="localePath(createPath)"
          icon="i-heroicons-plus-circle"
          color="secondary"
          variant="outline"
          :aria-label="t('$.aria.create_new')"
        />
      </div>
    </div>

    <div v-if="viewMode === 'table'" class="crm-data-panel overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead
            class="border-b border-default bg-elevated/60 text-xs uppercase tracking-wide text-muted"
          >
            <tr>
              <th class="w-12 px-4 py-3">
                <UCheckbox
                  :model-value="allSelected"
                  @update:model-value="toggleAll"
                />
              </th>
              <th
                v-for="field in fields"
                :key="field.name"
                class="whitespace-nowrap px-4 py-3"
              >
                <button
                  class="inline-flex items-center gap-1 font-bold"
                  :class="field.sortable === false ? 'cursor-default' : ''"
                  @click="toggleSort(field.name)"
                >
                  {{ t(field.label) }}
                  <UIcon
                    v-if="sortDirection(field.name)"
                    :name="
                      sortDirection(field.name) === 'asc'
                        ? 'i-lucide-arrow-up'
                        : 'i-lucide-arrow-down'
                    "
                    class="size-3.5"
                  />
                </button>
              </th>
              <th class="w-12 px-4 py-3">
                <span class="sr-only">{{ t("$.view.actions") }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in rows"
              :key="item.id"
              class="group cursor-pointer border-b border-default transition-colors last:border-b-0 hover:bg-primary/5"
              @click="openDetail(item)"
            >
              <td class="px-4 py-3" @click.stop>
                <UCheckbox
                  :model-value="isSelected(item)"
                  @update:model-value="toggleSelected(item, $event)"
                />
              </td>
              <td
                v-for="(field, index) in fields"
                :key="field.name"
                class="max-w-72 px-4 py-3"
              >
                <NuxtLink
                  v-if="index === 0"
                  :to="detailUrl(item)"
                  class="font-bold text-primary hover:underline"
                  @click.stop
                >
                  {{ formatValue(item, field) }}
                </NuxtLink>
                <UBadge
                  v-else-if="
                    field.name === 'status' || field.name === 'published'
                  "
                  color="neutral"
                  variant="subtle"
                >
                  {{ formatValue(item, field) }}
                </UBadge>
                <span v-else class="line-clamp-2">{{
                  formatValue(item, field)
                }}</span>
              </td>
              <td class="px-4 py-3" @click.stop>
                <UButton
                  icon="i-heroicons-trash"
                  color="error"
                  variant="ghost"
                  :aria-label="t('$.btn.delete')"
                  @click="
                    selected = [item];
                    deleteDialogOpen = true;
                  "
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="loading" class="p-8 text-center text-muted">
        {{ t("$.view.loading") }}
      </div>
      <div v-else-if="!rows.length" class="p-8 text-center text-muted">
        {{ t("$.view.empty") }}
      </div>
    </div>

    <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <UCard
        v-for="item in rows"
        :key="item.id"
        class="crm-record-card cursor-pointer transition duration-300 hover:-translate-y-1 hover:shadow-xl"
        @click="openDetail(item)"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="truncate text-lg font-bold text-highlighted">
              {{
                resource === "client"
                  ? `${item.first_name} ${item.last_name}`
                  : item.name
              }}
            </p>
            <p class="truncate text-sm text-muted">
              {{
                resource === "client" ? item.email : item.syscode || item.sku
              }}
            </p>
          </div>
          <div class="flex items-center gap-1" @click.stop>
            <UCheckbox
              :model-value="isSelected(item)"
              @update:model-value="toggleSelected(item, $event)"
            />
            <UButton
              icon="i-heroicons-trash"
              color="error"
              variant="ghost"
              size="sm"
              @click="
                selected = [item];
                deleteDialogOpen = true;
              "
            />
          </div>
        </div>

        <div v-if="resource === 'client'" class="mt-4 space-y-3 text-sm">
          <div class="flex flex-wrap gap-2">
            <UBadge color="primary" variant="subtle">{{
              item.profiles?.[0]?.name || t("$.client.type_unassigned")
            }}</UBadge>
            <UBadge color="neutral" variant="subtle">{{
              t(`$.status.${item.status || "active"}`)
            }}</UBadge>
          </div>
          <p class="line-clamp-3 text-muted">
            {{ item.profiles?.[0]?.summary || t("$.client.profile_missing") }}
          </p>
          <p v-if="item.profiles?.[0]?.average_basket" class="font-semibold">
            {{ t("$.client.average_basket") }}:
            {{
              new Intl.NumberFormat("cs-CZ", {
                style: "currency",
                currency: "CZK",
              }).format(item.profiles[0].average_basket)
            }}
          </p>
        </div>

        <div v-else-if="resource === 'product'" class="mt-4 space-y-3 text-sm">
          <div class="flex items-start justify-between gap-3">
            <div class="flex flex-wrap gap-1.5">
              <UBadge v-for="category in productCategories(item)" :key="category" color="secondary" variant="subtle">
                {{ category }}
              </UBadge>
              <span v-if="!productCategories(item).length" class="text-muted">{{ t("$.product.no_categories") }}</span>
            </div>
            <span class="text-base font-extrabold text-primary">
              {{ formatValue(item, { name: "price_range" }) }}
            </span>
          </div>
          <p class="line-clamp-2 text-muted">
            {{ item.data?.character || t("$.product.description_missing") }}
          </p>
          <p class="line-clamp-3 leading-6">{{ item.data?.main_sales_argument || item.description }}</p>
        </div>

        <div v-else class="mt-4 space-y-3 text-sm">
          <p class="line-clamp-3 text-muted">
            {{ item.description || t("$.category.description_missing") }}
          </p>
          <p>
            {{ t("$.category.position") }}:
            <strong>{{ item.position ?? "—" }}</strong>
          </p>
        </div>

        <template #footer>
          <div class="flex justify-end">
            <UButton
              :to="detailUrl(item)"
              variant="soft"
              trailing-icon="i-heroicons-arrow-right"
              @click.stop
            >
              {{ t("$.btn.show_detail") }}
            </UButton>
          </div>
        </template>
      </UCard>
      <UCard v-if="loading" class="md:col-span-2 xl:col-span-3">
        <p class="py-6 text-center text-muted">{{ t("$.view.loading") }}</p>
      </UCard>
      <UCard v-else-if="!rows.length" class="md:col-span-2 xl:col-span-3">
        <p class="py-6 text-center text-muted">{{ t("$.view.empty") }}</p>
      </UCard>
    </div>

    <div v-if="meta" class="mt-5 flex justify-center">
      <UPagination
        :page="config.pagination?.page ?? 1"
        :items-per-page="config.pagination?.limit ?? 20"
        :total="meta.total ?? 0"
        show-controls
        show-edges
        @update:page="handlePage"
      />
    </div>

    <CmpConfirmDialog
      v-model="deleteDialogOpen"
      :title="t('$.btn.delete')"
      color="error"
      :btns="{ ok: { icon: 'i-heroicons-trash' } }"
      @confirm="confirmDelete"
    >
      {{
        selected.length > 1
          ? t("$.message.delete_question_multi", { length: selected.length })
          : t("$.message.delete_question", {
              name: selected[0]?.[nameField] || "",
            })
      }}
    </CmpConfirmDialog>
  </div>
</template>
