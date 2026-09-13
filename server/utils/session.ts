import type { H3Event } from "h3";

export async function setUserSessionFromPhp(
  event: H3Event,
  baseUrl: string,
  token: string,
  userId: number,
): Promise<void> {
  const frontendHost = String(useRuntimeConfig().public.frontendHost || "");
  const host = frontendHost ? new URL(frontendHost).hostname : "";
  const response = await $fetch<any>(`${baseUrl}/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(host ? { "X-Forwarded-Host": host } : {}),
    },
  }).catch(() => null);

  await setUserSession(event, {
    token,
    user: response?.data ?? { id: userId },
  });
}
