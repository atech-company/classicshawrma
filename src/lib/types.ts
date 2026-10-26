export type Restaurant = {
  id: number;
  public_uuid: string;
  name_en: string;
  name_ar: string;
  intro_en: string | null;
  intro_ar: string | null;
  phone: string | null;
  phone_secondary: string | null;
  address_en: string | null;
  address_ar: string | null;
  hours: Record<string, string> | null;
  facebook_url: string | null;
  instagram_url: string | null;
  delivery_enabled: boolean;
  takeaway_enabled: boolean;
  delivery_fee: number;
  currency: string;
  currency_decimals: number;
  default_locale: string;
  hero_image_url: string | null;
};

export type Category = {
  id: number;
  name_en: string;
  name_ar: string;
  slug: string;
  description_en: string | null;
  description_ar: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  items_count?: number;
};

export type Variant = {
  id: number;
  name_en: string;
  name_ar: string;
  price_adjustment: number;
  is_active: boolean;
};

export type ModifierOption = {
  id: number;
  name_en: string;
  name_ar: string;
  price_adjustment: number;
  is_active: boolean;
};

export type ModifierGroup = {
  id: number;
  name_en: string;
  name_ar: string;
  is_required: boolean;
  min_selections: number;
  max_selections: number;
  options: ModifierOption[];
};

export type MenuItem = {
  id: number;
  category_id: number;
  name_en: string;
  name_ar: string;
  slug: string;
  description_en: string | null;
  description_ar: string | null;
  image_url: string | null;
  price: number;
  is_available: boolean;
  is_featured: boolean;
  is_visible: boolean;
  sort_order?: number;
  variants?: Variant[];
  modifier_groups?: ModifierGroup[];
  category?: Category;
};

export type OrderItem = {
  id: number;
  menu_item_id: number | null;
  item_name_en: string;
  item_name_ar: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  selected_options_snapshot: unknown;
  notes: string | null;
};

export type Order = {
  id?: number;
  public_reference: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  order_type: "takeaway" | "delivery";
  delivery_address: string | null;
  delivery_instructions: string | null;
  customer_notes: string | null;
  subtotal: number;
  fees: number;
  discount_total: number;
  total: number;
  payment_method: string;
  payment_status: string;
  status: string;
  cancel_reason: string | null;
  created_at?: string;
  items?: OrderItem[];
  status_histories?: OrderStatusHistory[];
};

export type OrderStatusHistory = {
  id: number;
  from_status: string | null;
  to_status: string;
  note: string | null;
  created_at: string | null;
};

export type CartLine = {
  key: string;
  menu_item_id: number;
  slug: string;
  name_en: string;
  name_ar: string;
  image_url: string | null;
  unit_price: number;
  quantity: number;
  variant_id?: number;
  variant_label_en?: string;
  variant_label_ar?: string;
  modifier_option_ids: number[];
  modifier_labels_en: string[];
  modifier_labels_ar: string[];
  notes?: string;
};
