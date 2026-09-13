/**
 * Extracts a numeric resource ID from plain IDs and generated slugs such as
 * `Ivana-Horakova--34` or legacy links such as `product-name--$34`.
 */
export function parseResourceId(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  let decoded = String(raw || "");

  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    // Vue Router normally provides a decoded value already.
  }

  const match = decoded.match(/(?:--)?\$?(\d+)$/);
  const id = match ? Number(match[1]) : Number.NaN;

  if (!Number.isSafeInteger(id) || id < 1) {
    throw createError({
      statusCode: 404,
      statusMessage: "Záznam nebyl nalezen",
    });
  }

  return id;
}

export function useResourceId() {
  const route = useRoute();
  return computed(() => parseResourceId(route.params.id));
}
