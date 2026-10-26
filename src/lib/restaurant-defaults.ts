import { brand } from "./brand";
import type { Restaurant } from "./types";

export const demoRestaurant: Restaurant = {
  id: 1,
  public_uuid: "54ac0973-bcbf-467a-a7f9-6e29127167c7",
  name_en: brand.name,
  name_ar: "كلاسيك شاورما",
  intro_en: brand.tagline,
  intro_ar: "كلاسيك دائماً، وشهيّ دائماً.",
  phone: "+961 70 886 095",
  phone_secondary: null,
  address_en: "Mar Mkhayel Church, Hazmieh Main Road facing Cheyeh municipality",
  address_ar: "كنيسة مار مخايل، طريق الحازمية الرئيسي مقابل بلدية الشياح",
  hours: null,
  facebook_url: brand.facebook,
  instagram_url: null,
  delivery_enabled: true,
  takeaway_enabled: true,
  delivery_fee: 0,
  currency: "LBP",
  currency_decimals: 0,
  default_locale: "ar",
  hero_image_url: "/images/menu/classic-menu-01.webp",
};

export function withCatalogRestaurant(restaurant: Restaurant | null | undefined): Restaurant {
  return {
    ...demoRestaurant,
    ...(restaurant ?? {}),
    name_en: demoRestaurant.name_en,
    name_ar: demoRestaurant.name_ar,
    intro_en: demoRestaurant.intro_en,
    intro_ar: demoRestaurant.intro_ar,
    phone: demoRestaurant.phone,
    phone_secondary: null,
    address_en: demoRestaurant.address_en,
    address_ar: demoRestaurant.address_ar,
    facebook_url: demoRestaurant.facebook_url,
    instagram_url: null,
    currency: demoRestaurant.currency,
    currency_decimals: 0,
    hero_image_url: demoRestaurant.hero_image_url,
  };
}
