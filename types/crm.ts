import type { IItem, IResponse } from "@suku-kahanamoku/common-module/types";

export interface IClient extends IItem {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  status?: "active" | "inactive" | "banned";
  role_id?: number;
  role?: { id: number; name: string; label?: string };
  profiles?: IUserCustomerProfile[];
  last_login_at?: string | null;
  created_at?: string;
}

export interface ICustomerProfile extends IItem {
  profile_number?: number | null;
  syscode: string;
  name: string;
  selection_need?: string | null;
  summary?: string;
  aura?: string;
  visual?: string;
  behavior?: string;
  business_potential?: string;
  typical_quote?: string;
  average_basket?: number;
  marketing_note?: string;
  questions: string[];
  objections: string[];
  preferences: Array<{ type: "animal" | "product_kind"; value: string }>;
  position?: number;
  published?: 0 | 1;
}

export interface IUserCustomerProfile extends ICustomerProfile {
  position: number;
}

export interface IAnimalCategory extends IItem {
  name: string;
  syscode?: string;
  parent_id?: number | null;
  description?: string | null;
  position?: number;
}

export interface IProductData {
  ean?: string;
  brand?: string;
  weight?: number;
  unit?: string;
  approx_price?: {
    min: number;
    max: number;
    currency: "CZK" | string;
  };
  character?: string;
  main_sales_argument?: string;
  /** Legacy fallback retained only for alternatives without a matching product. */
  alternative_product_name?: string;
  upsell_upgrade?: string;
  basket_if_upgrade_declined?: string;
}

export interface IProductFile {
  id: number;
  path: string;
  name: string;
  mime_type?: string;
}

export interface IProduct extends IItem {
  name: string;
  sku?: string;
  description?: string | null;
  price: number;
  stock_quantity: number;
  published?: 0 | 1;
  variant?: string | null;
  data?: IProductData;
  category_ids?: number[];
  categories?: IAnimalCategory[];
  file_ids?: number[];
  files?: IProductFile[];
  profile_probabilities?: IProductProfileProbability[];
  alternatives?: IProductAlternative[];
}

export interface IProductAlternative {
  alternative_product_id: number;
  sku?: string;
  name?: string;
  description?: string | null;
  price?: number;
  stock_quantity?: number;
  published?: 0 | 1;
  position: number;
  data?: IProductData;
}

export interface IProductProfileProbability {
  customer_profile_id: number;
  probability_percent: number;
  syscode?: string;
  name?: string;
}

export interface IItemResponse<T> extends IResponse {
  data?: T;
}

export interface IListResponse<T> extends IResponse {
  data?: T[];
}
