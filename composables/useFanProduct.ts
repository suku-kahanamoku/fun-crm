import type { IProduct, IProductData } from "@/types/crm";

export function useFanProduct() {
  const { locale } = useLang();

  const money = (value: number) =>
    new Intl.NumberFormat(locale.value === "en" ? "en-GB" : "cs-CZ", {
      style: "currency",
      currency: "CZK",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));

  function priceRange(product?: IProduct): string {
    const range = product?.data?.approx_price;
    if (!range) return money(Number(product?.price || 0));
    return `${money(range.min)} – ${money(range.max)}`;
  }

  function normalizeProductBody(body: Record<string, any>) {
    const nestedData = (body.data || {}) as IProductData;
    if (body.data) {
      if (nestedData.approx_price) nestedData.approx_price.currency = "CZK";
      body.price = Number(nestedData.approx_price?.min || body.price || 0);
      body.description = nestedData.main_sales_argument || body.description;
      body.data = nestedData;
    } else {
      body["data.approx_price.currency"] = "CZK";
      body.price = Number(body["data.approx_price.min"] || body.price || 0);
      body.description = body["data.main_sales_argument"] || body.description;
    }
    return body;
  }

  return { money, priceRange, normalizeProductBody };
}
