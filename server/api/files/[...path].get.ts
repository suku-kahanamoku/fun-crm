export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const path = String(
    event.context.params?._ ?? event.context.params?.path ?? "",
  )
    .replace(/\.\./g, "")
    .replace(/^\/+/, "");
  const session = await getUserSession(event).catch(() => null);
  const token =
    (session as any)?.token || (session as any)?.tokens?.access_token;
  const frontendHost = String(config.public.frontendHost || "");
  const host = frontendHost ? new URL(frontendHost).hostname : "";
  const response = await fetch(
    `${String(config.phpApiBaseUrl)}/files/content?path=${encodeURIComponent(`files/${path}`)}`,
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(host ? { "X-Forwarded-Host": host } : {}),
      },
    },
  );
  if (!response.ok) {
    throw createError({
      statusCode: response.status,
      statusMessage: "Soubor nebyl nalezen",
    });
  }
  setResponseHeader(
    event,
    "Content-Type",
    response.headers.get("content-type") || "application/octet-stream",
  );
  setResponseHeader(
    event,
    "Cache-Control",
    response.headers.get("cache-control") || "private, no-store",
  );
  return new Uint8Array(await response.arrayBuffer());
});
