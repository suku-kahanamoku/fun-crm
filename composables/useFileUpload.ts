export type UploadStatus = "pending" | "uploading" | "uploaded" | "error";

export interface UploadedFileItem {
  file: File;
  path: string;
  progress: number;
  status: UploadStatus;
  error?: string;
}

async function uploadToTemp(
  file: File,
  onProgress: (progress: number) => void,
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  return await new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onProgress(Math.max(1, Math.round((event.loaded / event.total) * 95)));
      }
    });
    xhr.addEventListener("load", () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new Error(`Upload selhal (${xhr.status})`));
        return;
      }
      try {
        const response = JSON.parse(xhr.responseText || "{}");
        const path = response?.data?.path;
        path
          ? resolve(path)
          : reject(new Error("Upload nevrátil dočasnou cestu"));
      } catch {
        reject(new Error("Upload vrátil neplatnou odpověď"));
      }
    });
    xhr.addEventListener("error", () => reject(new Error("Upload selhal")));
    xhr.open("POST", "/api/files/upload");
    xhr.send(formData);
  });
}

export function useFileUpload() {
  const uploadedFiles = ref<UploadedFileItem[]>([]);
  const uploading = computed(() =>
    uploadedFiles.value.some((file) => file.status === "uploading"),
  );
  const tempPaths = computed(() =>
    uploadedFiles.value
      .filter((file) => file.status === "uploaded" && file.path)
      .map((file) => file.path),
  );

  async function addFiles(files: File[]) {
    for (const file of files) {
      const item: UploadedFileItem = {
        file,
        path: "",
        progress: 1,
        status: "uploading",
      };
      uploadedFiles.value.push(item);
      try {
        item.path = await uploadToTemp(file, (progress) => {
          item.progress = progress;
        });
        item.progress = 100;
        item.status = "uploaded";
      } catch (error: any) {
        item.progress = 0;
        item.status = "error";
        item.error = error?.message || "Upload selhal";
      }
    }
  }

  function removeFile(index: number) {
    uploadedFiles.value.splice(index, 1);
  }

  function clearFiles() {
    uploadedFiles.value = [];
  }

  return {
    uploadedFiles,
    uploading,
    tempPaths,
    addFiles,
    removeFile,
    clearFiles,
  };
}
