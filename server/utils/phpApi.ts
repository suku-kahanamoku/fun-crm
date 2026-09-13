import type { H3Event } from "h3";

export interface PhpApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string> | null;
}

function normalizeQuery(query: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(query)) {
    if (key === "skip") continue;
    if (key === "factory") {
      if (value !== undefined && value !== null) {
        result[key] = typeof value === "string" ? value : JSON.stringify(value);
      }
      continue;
    }
    if (key === "projection") {
      let projection = value;
      if (typeof projection === "string") {
        try {
          projection = JSON.parse(projection);
        } catch {
          result[key] = projection;
          continue;
        }
      }
      result[key] = Array.isArray(projection)
        ? projection.join(",")
        : projection && typeof projection === "object"
          ? Object.keys(projection).join(",")
          : projection;
      continue;
    }
    result[key] = value;
  }

  if ("skip" in query && "limit" in query) {
    const skip = Number(query.skip) || 0;
    const limit = Number(query.limit) || 20;
    result.page = Math.floor(skip / limit) + 1;
  }

  return result;
}

async function getSessionToken(event: H3Event): Promise<string | null> {
  try {
    const session = await getUserSession(event);
    return (
      (session as any)?.token || (session as any)?.tokens?.access_token || null
    );
  } catch {
    return null;
  }
}

export async function phpApiFetch<T = any>(
  event: H3Event,
  path: string,
  options: { method?: string; body?: any; query?: Record<string, any> } = {},
): Promise<PhpApiResponse<T>> {
  const config = useRuntimeConfig();
  const method = (options.method || "GET").toUpperCase();
  const token = await getSessionToken(event);
  const frontendHost = String(config.public.frontendHost || "");
  const hostHeader = frontendHost
    ? new URL(frontendHost).hostname
    : event.headers.get("host")?.split(":")[0] || "";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(hostHeader ? { "X-Forwarded-Host": hostHeader } : {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return await $fetch<PhpApiResponse<T>>(String(config.phpApiBaseUrl) + path, {
    method: method as any,
    headers,
    ...(options.body !== undefined ? { body: options.body } : {}),
    ...(options.query ? { query: normalizeQuery(options.query) } : {}),
  });
}
