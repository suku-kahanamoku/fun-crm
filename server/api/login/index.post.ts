import { setUserSessionFromPhp } from "@/server/utils/session";

export default defineEventHandler(async (event) => {
  const baseUrl = String(useRuntimeConfig().phpApiBaseUrl);
  const frontendHost = String(useRuntimeConfig().public.frontendHost || "");
  const host = frontendHost ? new URL(frontendHost).hostname : "";
  const body = await readBody(event);
  let response: any;
  let statusCode = 401;

  try {
    response = await $fetch<any>(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(host ? { "X-Forwarded-Host": host } : {}),
      },
      body: { email: body.email, password: body.password },
    });
  } catch (error: any) {
    statusCode = error.statusCode ?? error.response?.status ?? 401;
    response = error.data;
  }

  if (!response?.success || !response?.data?.token) {
    throw createError({
      statusCode,
      statusMessage: response?.message || "Neplatné přihlašovací údaje",
    });
  }

  await setUserSessionFromPhp(
    event,
    baseUrl,
    response.data.token,
    Number(response.data.id),
  );
  return { success: true };
});
