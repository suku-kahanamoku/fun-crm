<script setup lang="ts">
import type { UploadedFileItem } from "@/composables/useFileUpload";

defineProps<{
  files: UploadedFileItem[];
  uploading?: boolean;
}>();

const emit = defineEmits<{
  add: [files: File[]];
  remove: [index: number];
}>();
const { t } = useLang();

const input = useTemplateRef<HTMLInputElement>("input");
const dragging = ref(false);
const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

function accept(list: FileList | File[]) {
  const files = Array.from(list).filter(
    (file) => allowedTypes.includes(file.type) && file.size <= 10 * 1024 * 1024,
  );
  if (files.length) emit("add", files);
  if (input.value) input.value.value = "";
}

function onDrop(event: DragEvent) {
  dragging.value = false;
  if (event.dataTransfer?.files) accept(event.dataTransfer.files);
}

function formatSize(size: number) {
  return `${Math.max(0.1, size / 1024 / 1024).toFixed(1)} MB`;
}
</script>

<template>
  <div class="space-y-4">
    <input
      ref="input"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      multiple
      class="hidden"
      @change="accept(($event.target as HTMLInputElement).files || [])"
    />
    <button
      type="button"
      class="flex min-h-44 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition"
      :class="
        dragging
          ? 'border-primary-500 bg-primary-50'
          : 'border-slate-300 bg-slate-50 hover:border-primary-400 dark:border-slate-700 dark:bg-slate-900'
      "
      @click="input?.click()"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
    >
      <UIcon name="i-heroicons-photo" class="mb-3 size-10 text-primary-600" />
      <span class="font-semibold">{{ t("$.upload.drop_images") }}</span>
      <span class="mt-1 text-sm text-slate-500">{{
        t("$.upload.image_limits")
      }}</span>
    </button>

    <div v-if="files.length" class="space-y-2">
      <div
        v-for="(file, index) in files"
        :key="`${file.file.name}-${file.file.lastModified}`"
        class="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
      >
        <UIcon name="i-heroicons-photo" class="size-5 text-primary-600" />
        <div class="min-w-0 flex-1">
          <div class="flex justify-between gap-3 text-sm">
            <span class="truncate font-medium">{{ file.file.name }}</span>
            <span class="shrink-0 text-slate-500">{{
              formatSize(file.file.size)
            }}</span>
          </div>
          <UProgress
            class="mt-2"
            :model-value="file.progress"
            :max="100"
            :color="
              file.status === 'error'
                ? 'error'
                : file.status === 'uploaded'
                  ? 'success'
                  : 'primary'
            "
          />
          <p v-if="file.error" class="mt-1 text-xs text-error-600">
            {{ file.error }}
          </p>
        </div>
        <UButton
          icon="i-heroicons-trash"
          color="error"
          variant="ghost"
          :disabled="file.status === 'uploading'"
          :aria-label="t('$.upload.remove_file')"
          @click="emit('remove', index)"
        />
      </div>
    </div>
  </div>
</template>
