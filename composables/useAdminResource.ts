import type { IFormConfig } from "@suku-kahanamoku/form-module/types";
import { CLONE } from "@suku-kahanamoku/common-module/utils";

export function useAdminResource<T extends { id?: number | string }>(
  resourceConfig: Record<string, any>,
  listRouteSyscode: string,
) {
  const { t } = useLang();
  const { routes, route } = useMenuItems();
  const { success, error: toastError } = useToastify();
  const { onSubmit, navigate, onPageChange, onFilterChange } =
    useFormNavigable();
  const { updateConfig } = useUrlResolver();

  const selected = ref<T[]>([]);
  const deleteDialogOpen = ref(false);
  const resourceId = computed(() =>
    route.params?.id
      ? parseResourceId(route.params.id as string | string[])
      : undefined,
  );
  const resolvedRoute = computed(() =>
    resourceId.value
      ? { ...route, meta: { ...route.meta, id: resourceId.value } }
      : route,
  );

  const config = computed<IFormConfig>(() => {
    const result = CLONE(resourceConfig);
    updateConfig(resolvedRoute.value as any, result);
    return result as IFormConfig;
  });

  const {
    data: response,
    pending: loading,
    refresh,
  } = useAsyncData(
    () =>
      `${config.value?.syscode || listRouteSyscode}-${resourceId.value || "root"}-data`,
    async () => {
      if (!config.value?.restUrl) return {};

      let url = useCompleteUrl(config.value.restUrl, {
        config: config.value,
        route: resolvedRoute.value,
      });
      const listPath = (routes as Record<string, any>)[listRouteSyscode]?.path;
      url = useFactory(url, config.value.factory, listPath);
      return await useApi(url);
    },
    { watch: [config, resourceId], immediate: true },
  );

  async function onDelete(confirmed: boolean) {
    if (!confirmed || !config.value?.deleteUrl || !selected.value.length)
      return;

    try {
      await Promise.all(
        selected.value.map((item) => {
          const url = useUrl(config.value!.deleteUrl!, {
            config: config.value!,
            route: resolvedRoute.value,
            item,
          });
          return useApi(url, { method: "DELETE" });
        }),
      );
      success(t("$.form.delete_success_msg"));
      selected.value = [];
      deleteDialogOpen.value = false;
      await refresh();
    } catch (error: any) {
      toastError(error);
    }
  }

  async function onSave(body: Record<string, any>, item?: T) {
    loading.value = true;
    try {
      const result = await onSubmit(config.value!, body, item);
      if (result?.data) {
        document
          .querySelectorAll(".field-warning")
          .forEach((element) => element.classList.remove("field-warning"));
      }
      return result;
    } finally {
      loading.value = false;
    }
  }

  function goToList() {
    const path = (routes as Record<string, any>)[listRouteSyscode]?.path;
    if (path) navigateTo(path);
  }

  function handleSort(sort: Record<string, number>[]) {
    if (!config.value?.syscode) return;
    (config.value as any).sort = sort;
    navigate(config.value as any);
  }

  function handlePage(page: number) {
    onPageChange(config.value as any, page);
  }

  function handleFilter(data: Record<string, string>) {
    onFilterChange(config.value as any, data);
  }

  return {
    config,
    resourceId,
    response,
    meta: computed(() => (response.value as any)?.meta),
    loading,
    selected,
    deleteDialogOpen,
    refresh,
    onDelete,
    onSave,
    goToList,
    handleSort,
    handlePage,
    handleFilter,
  };
}
