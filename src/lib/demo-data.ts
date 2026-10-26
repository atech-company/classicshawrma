import catalog from "./classic-shawarma-catalog.json";
import { brand } from "./brand";
import type { Category, MenuItem } from "./types";
export { demoRestaurant, withCatalogRestaurant } from "./restaurant-defaults";

const categoryArabic: Record<string, string> = {
  Offers: "العروض",
  "Hot Mezza": "مقبلات ساخنة",
  "Cold Mezza": "مقبلات باردة",
  Salad: "سلطات",
  Appetizers: "مقبلات",
  Burgers: "برغر",
  Mashewe: "مشاوي",
  Shawarma: "شاورما",
  Crepe: "كريب",
  Breakfast: "فطور",
  Pastries: "معجنات",
  "Hot Drinks": "مشروبات ساخنة",
  "Cold Drinks": "مشروبات باردة",
  Arguile: "أرجيلة",
  Delivery: "التوصيل",
};

const categoryEnglish: Record<string, string> = { معجنات: "Pastries" };
const categorySlugs: Record<string, string> = {
  Offers: "offers", "Hot Mezza": "hot-mezza", "Cold Mezza": "cold-mezza",
  Salad: "salad", Appetizers: "appetizers", Burgers: "burgers",
  "Main Dish": "main-dishes", Mashewe: "grill", Shawarma: "shawarma",
  Crepe: "crepes", Breakfast: "breakfast", معجنات: "pastries",
  "Hot Drinks": "hot-drinks", "Cold Drinks": "cold-drinks",
  "Fresh Juices": "fresh-juices", Arguile: "arguile",
  "Ramadan juice": "ramadan-juice", Delivery: "delivery",
};

const itemEnglish: Record<string, string> = {
  "ساندويش مرقوق دجاج": "Chicken markouk sandwich",
  "ساندويش شاورمة عربي كبير": "Large Arabic shawarma sandwich",
  "سندويش شاورما لحمة": "Beef shawarma sandwich",
  "ساندويش شاورما سجق": "Sujuk shawarma sandwich",
  "سندويش زنغر عدد ٢ مع بطاطا وبيبسي": "Two zinger sandwiches with fries and Pepsi",
  "ساندويتش شاورما سجق": "Sujuk shawarma sandwich",
  "ساندويتش شاورما لحمة": "Beef shawarma sandwich",
  "ساندويتش عربي كبير": "Large Arabic sandwich",
  "ساندويتش مرقوق دجاج": "Chicken markouk sandwich",
  "ساندويش زنغر عدد ٢ مع بطاطا وبيبسي": "Two zinger sandwiches with fries and Pepsi",
  "سندويش مرقوق دجاج": "Chicken markouk sandwich",
  "سندويش عربي كبير": "Large Arabic sandwich",
  "صحن بطاطا": "French fries",
  "علبة بطاطا": "Fries box",
  "بطاطا حرة": "Spicy potatoes",
  "صحن رز": "Rice plate",
  "صحن لبنة مع خضرة": "Labneh with fresh vegetables",
  "صحن سلطة ملفوف ": "Coleslaw",
  "صحن رز عالوج شاورما دجاج": "Rice topped with chicken shawarma",
  "صحن رز عالوج شاورما لحمة": "Rice topped with beef shawarma",
  "صحن سلطة ملفوف": "Coleslaw",
  "لحمة راس عصفور ": "Beef bites",
  "لحمة راس عصفور": "Beef bites",
  "مقانق": "Makanek",
  "سجق": "Sujuk",
  "سجق وجبنة": "Sujuk and cheese",
  "زنغر": "Zinger chicken",
  "شقف": "Shish kebab",
  "طاووق": "Shish tawook",
  "كباب": "Kebab",
  "كفتة": "Kofta",
  "اورفلي": "Orfali",
  "عرايس كفتة": "Kofta arayes",
  "جوانح مشوية": "Grilled wings",
  "قريدس مشوي": "Grilled shrimp",
  "فروج محمر": "Roast chicken",
  "فروج فحم مع بطاطا+توم+كبيس": "Charcoal chicken with fries, garlic, and pickles",
  "فروج فحم و بطاطا توم كبيس": "Charcoal chicken with fries, garlic, and pickles",
  "فروج فحم مع بطاطا+توم+كبيس+": "Charcoal chicken with fries, garlic, and pickles",
  "فروج فحم مع بطاطا+توم+حمص": "Charcoal chicken with fries, garlic, and hummus",
  "فروج غاز+رز+توم+كبيس": "Rotisserie chicken with rice, garlic, and pickles",
  "فروج غاز +رز + بطاطا + توم  و كبيس": "Rotisserie chicken with rice, fries, garlic, and pickles",
  "فروج غاز +رز + بطاطا +فتوش +حمص": "Rotisserie chicken with rice, fries, fattoush, and hummus",
  "فروج عالغاز + رز + توم + كبيس + بطاطا وبيبسي": "Rotisserie chicken meal with fries and Pepsi",
  "فروج بروستد مع بطاطا توم كبيس و بيبسي ليتر وربع ": "Broasted chicken with fries, garlic, pickles, and Pepsi",
  "قطع بروستد4+بطاطا وببسي": "Four broasted chicken pieces with fries and Pepsi",
  "حمص": "Hummus",
  "متبل باذنجان": "Moutabal",
  "باذنجان": "Eggplant",
  "قرنبيط": "Cauliflower",
  "فتوش": "Fattoush",
  "تبولة": "Tabbouleh",
  "كبة": "Kibbeh",
  "سمبوسك": "Sambousek",
  "رقاقات": "Cheese rolls",
  "ورق عنب": "Stuffed grape leaves",
  "كشك": "Kishk",
  "لحم بعجين": "Lahm bi ajin",
  "لبنة متوم": "Garlic labneh",
  "جبنة وزعتر": "Cheese and zaatar",
  "جبنة": "Cheese",
  "زعتر": "Zaatar",
  "قنينة تمر هندي": "Tamarind juice bottle",
  "قنينة جزر": "Carrot juice bottle",
  "قنينة جلاب": "Jallab bottle",
  "قنينة فريز": "Strawberry juice bottle",
  "قنينة كوكتيل": "Cocktail juice bottle",
  "قنينة ليمون": "Lemon juice bottle",
  "قنينة ليموناضة": "Lemonade bottle",
  "اركيلة تفاح": "Apple shisha",
  "اركيلة حامض ونعنع": "Lemon mint shisha",
  "اركيلة+عصيرفريش": "Shisha with fresh juice",
  "ترند البطيخ": "Watermelon trend",
  "كباية بطيج": "Watermelon cup",
  "كباية بطيج وجبنة": "Watermelon and cheese cup",
  "عرض ٥ مرقوق دجاج + صحن بطاطا وبيبسي": "Five chicken markouk sandwiches with fries and Pepsi",
  "عرض ٥ مرقوق دجاج + صحن بطاطا وبيبسي ليتر وربع": "Five chicken markouk sandwiches with fries and 1.25L Pepsi",
  "عرض 5 مرقوق دجاج مع بطاطا وبيبسي": "Five chicken markouk sandwiches with fries and Pepsi",
  "عرض 10 مرقوق دجاج مع بطاطا وبيبسي": "Ten chicken markouk sandwiches with fries and Pepsi",
  "عرض ١٠ مرقوق دجاج + صحن بطاطا + بيبسي ليتر وربع ": "Ten chicken markouk sandwiches with fries and 1.25L Pepsi",
  "عرض ٢ مرقوق دجاج + علبة بطاطا وبيبسي": "Two chicken markouk sandwiches with fries and Pepsi",
  "عرض 2 مرقوق دجاج مع بطاطا و بيبسي": "Two chicken markouk sandwiches with fries and Pepsi",
  "عرض ٢ مرقوق سجق مع بطاطا": "Two sujuk markouk sandwiches with fries",
  "عرض ٢ مرقوق لحمة + علبة بطاطا وبيبسي": "Two beef markouk sandwiches with fries and Pepsi",
  "عرض 2 مرقوق لحمة مع بطاطا وبيبسي": "Two beef markouk sandwiches with fries and Pepsi",
  "عرض ١ مرقوق دجاج + ١مرقوق سجق مع بطاطا": "Chicken and sujuk markouk sandwiches with fries",
  "عرض 1 مرقوق دجاج مع 1 مرقوق لحمة مع بطاطا وبيبسي": "Chicken and beef markouk sandwiches with fries and Pepsi",
  "عرض ١ مرقوق لحمة + ١ مرقوق دجاج + علبة بطاطا وبيبسي": "Beef and chicken markouk sandwiches with fries and Pepsi",
  "عرض ١مرقوق لحمة + ١ مرقوق سجق مع بطاطا": "Beef and sujuk markouk sandwiches with fries",
  "عرض ١ شاورما سجق + ١ لحمة + ١ دجاج مع بطاطا": "Sujuk, beef, and chicken shawarma sandwiches with fries",
  "عرض برغر دجاج عدد 2 مع بطاطا وبيبسي": "Two chicken burgers with fries and Pepsi",
  "عرض برغر لحمة عدد 2 مع بطاطا و بيبسي": "Two beef burgers with fries and Pepsi",
  "عرض برغر لحمة مع برغر دجاج +بطاطا وبيبسي": "Beef and chicken burgers with fries and Pepsi",
  "عرض 1 زنغر و 1 ايطاليين برغر": "Zinger and Italian burger combo",
  "عرض فروج بروستد مع بطاطا توم كبيس و بيبسي ليتر وربع": "Broasted chicken with fries, garlic, pickles, and 1.25L Pepsi",
  "عرض وجبة كريسبي 6 قطع مع بطاطا وبيبسي": "Six crispy chicken pieces with fries and Pepsi",
  "وجبة 2 زنغر مع بطاطا وبيبسي": "Two zinger meals with fries and Pepsi",
  "وجبة فرط شاورما دجاج 250غرام  مع بطاطا": "250g chicken shawarma with fries",
  "وجبة فرط شاورما دجاج 250غرام  مع بطاطا ": "250g chicken shawarma with fries",
  "وجبة فرط شاورما لحمة 250غرام  مع بطاطا": "250g beef shawarma with fries",
  "وجبة فرط شاورما لحمة 250غرام  مع بطاطا ": "250g beef shawarma with fries",
  "فروجين غاز+رز+بطاطا+توم+كبيس+و بيبسي ليتر وربع": "Two rotisserie chickens with rice, fries, garlic, pickles, and 1.25L Pepsi",
  "فروجين غاز +رز+توم+كبيس+ببسي  1.5": "Two rotisserie chickens with rice, garlic, pickles, and Pepsi",
  "ابريق شاي": "Tea pot",
  "برغر دجاج عدد ٢ مع بطاطا وبيبسي": "Two chicken burgers with fries and Pepsi",
  "برغر لحمة + برغر دجاج مع بطاطا وبيبسي": "Beef and chicken burgers with fries and Pepsi",
  "برغر لحمة عدد ٢ مع بطاطا وبيبسي": "Two beef burgers with fries and Pepsi",
  "فروج بروستد مع توم كبيس و بطاطا +بيبسي ليتر وربع ": "Broasted chicken with garlic, pickles, fries, and 1.25L Pepsi",
  "ميكس غريل 4 شيش": "Mixed grill plate, four skewers",
  "وجبة كرسبي ( ٥ ) قطع مع توم تشدر كاتشب وحر و بطاطا وبيبسي": "Five crispy chicken pieces with garlic, cheddar, ketchup, hot sauce, fries, and Pepsi",
  "فروج فحم + فروج غاز + سرفيس + بيبسي ليتر و ربع": "Charcoal and rotisserie chicken combo with 1.25L Pepsi",
  "فروج غاز+رز+بطاطا+توم+كبيس+و بيبسي ليتر وربع": "Rotisserie chicken with rice, fries, garlic, pickles, and 1.25L Pepsi",
};

const itemArabic: Record<string, string> = {
  "Grilled chicken": "دجاج مشوي",
  "Chicken Alfredo": "ألفريدو بالدجاج",
  "Beef Fillet ": "فيليه لحم",
  "Salmon grilled": "سلمون مشوي",
  "Egg Tacos": "تاكو البيض",
  "Egg Omlet": "عجة البيض",
  "Scrambled Egg": "بيض مخفوق",
  "Sunny Side Egg": "بيض عيون",
  "Salmon Tartar": "تارتار السلمون",
  "Halloumi Grilled": "حلوم مشوي",
  Granolla: "غرانولا",
  "French Toast": "فرنش توست",
  "Chicken protein sandwich": "سندويش دجاج بروتين",
  "Rocca Mushroom": "سلطة جرجير وفطر",
  "Salmon Salad": "سلطة سلمون",
  "Cesar Salad": "سلطة سيزر",
  "Crab Salad": "سلطة كراب",
  "Avocado Salad": "سلطة أفوكادو",
  "Mix Green Salad": "سلطة خضار مشكلة",
  "Wings": "أجنحة دجاج",
  "Mozerella Sticks": "أصابع موزاريلا",
  "Italian Chicken burger": "برغر دجاج إيطالي",
  "Italian beef burger": "برغر لحم إيطالي",
  "Miele Senape": "برغر دجاج بالعسل والخردل",
  Fermato: "فيرماتو",
  Badester: "باديستر",
  Basilico: "باسيليكو",
  "Crepe Nutella": "كريب نوتيلا",
  "Crepe White": "كريب شوكولاتة بيضاء",
  "Crepe Pistachio": "كريب فستق",
  "Crepe Kinder ": "كريب كيندر",
  "Crepe Loutus": "كريب لوتس",
  "Pancake 12 pcs": "بانكيك 12 قطعة",
  "Pancake 24 pcs": "بانكيك 24 قطعة",
  "Add Banana": "إضافة موز",
  "Add Strawberry": "إضافة فراولة",
  "Add Strawberry ": "إضافة فراولة",
  "7up T": "سفن أب",
  "Avocado juice": "عصير أفوكادو",
  "Beef Fillet": "فيليه لحم",
  "Crepe Kinder": "كريب كيندر",
  "Flavour Late(vanilla/caramel)": "لاتيه بنكهة الفانيلا أو الكراميل",
  Fracassato: "فراكاساتّو",
  "Miranda T": "ميرندا",
  Mocha: "موكا",
  pepsi: "بيبسي",
  "pepsi D": "بيبسي 1.25 لتر",
  "Pine apple juice": "عصير أناناس",
  "pomegranate juice": "عصير رمان",
  "Shrimp Provincial": "قريدس بروفنسال",
  "Spanish Late": "سبانيش لاتيه",
  "Strawberry Juice": "عصير فراولة",
  "strawberry milk juice": "ميلك شيك بالفراولة",
  Tea: "شاي",
  "Tiramisu Late": "تيراميسو لاتيه",
  "Green tea": "شاي أخضر",
  Espresso: "إسبريسو",
  "double espresso": "إسبريسو دبل",
  Cappucino: "كابتشينو",
  "Cafe Late": "كافيه لاتيه",
  "Caramel Machiato": "كراميل ماكياتو",
  "Hot Chocolate": "شوكولاتة ساخنة",
  "Ice tea": "شاي مثلج",
  "Orange juice": "عصير برتقال",
  "Apple juice": "عصير تفاح",
  "Mango juice": "عصير مانجو",
  "Lemonade juice": "ليموناضة",
  "Pepsi table": "بيبسي عائلي",
  "Evervess sparkling water": "مياه إيفرڤيس غازية",
  "Large water": "مياه كبيرة",
  "Small Water": "مياه صغيرة",
};

const descriptionEnglish: Record<string, string> = {
  "مع بطاطا وبيبسي": "With fries and Pepsi",
};

const descriptionArabic: Record<string, string> = {
  "mashed potato , vegetables , Free Drink": "بطاطا مهروسة، خضار ومشروب مجاني",
  "classic sauce , fries or mashed potato , vegetables , free drink": "صوص كلاسيك، بطاطا مقلية أو مهروسة، خضار ومشروب مجاني",
  "Pepper sauce , fries , vegetable's , free drink": "صوص الفلفل، بطاطا مقلية، خضار ومشروب مجاني",
  "Del sauce , spanish , potato boiled , free drink": "صوص ديل، سبانخ، بطاطا مسلوقة ومشروب مجاني",
  sandwich: "سندويش",
  "8 piece's": "٨ قطع",
  "plate , 2 tawouk 1 kafta , 1 shekaf": "طبق مشاوي: ٢ طاووق، ١ كفتة، ١ شقف",
  "330 ml table": "٣٣٠ مل",
  "330 ml": "٣٣٠ مل",
  "0.5 L": "نصف لتر",
  "1 L": "لتر واحد",
  "1.25 L": "١٫٢٥ لتر",
  "250 ml": "٢٥٠ مل",
  "330 ML": "٣٣٠ مل",
  "مع بطاطا وبيبسي": "مع بطاطا مقلية وبيبسي",
  "Italian Chicken Burger : Grilled chicken breast (150g) , basilico sauce ,  lolo rosso , jalapeno ,  tomato , fondel cheese , cheddar cheese": "برغر دجاج إيطالي: صدر دجاج مشوي (١٥٠ غ)، صوص باسيليكو، خس لولو روسو، هالابينو، بندورة، جبنة فونديل وجبنة شيدر",
  "Italian beef burger : fracassato sauce,tomato,rocca,del pickles, cheddar cheese, onion caramelized": "برغر لحم إيطالي: صوص فراكاساتّو، بندورة، جرجير، مخلل ديل، جبنة شيدر وبصل مكرمل",
  "Italian beef Burger : fermato sauce,rocca,cheddar cheese": "برغر لحم إيطالي: صوص فيرماتو، جرجير وجبنة شيدر",
  "Italian Chicken Burger": "برغر دجاج إيطالي",
  "Italian beef Burger": "برغر لحم إيطالي",
};

const sourceCategories = catalog.categories.map((category, index) => ({
  ...category,
  id: index + 1,
  slug: categorySlugs[category.name] ?? `category-${index + 1}`,
}));
const categoryIdBySourceId = new Map(sourceCategories.map((category) => [category.sourceId, category.id]));

export const demoCategories: Category[] = sourceCategories.map((category) => ({
  id: category.id,
  name_en: categoryEnglish[category.name] ?? category.name,
  name_ar: categoryArabic[category.name] ?? category.name,
  slug: category.slug,
  description_en: category.description,
  description_ar: category.description,
  image_url: null,
  sort_order: category.sortOrder,
  is_active: true,
  items_count: catalog.items.filter((item) => item.categorySourceId === category.sourceId).length,
}));

const categoryNameBySourceId = new Map(sourceCategories.map((category) => [category.sourceId, category.name]));
const featuredSourceIds = new Set(
  catalog.items.filter((item) => item.imageUrl).slice(0, 3).map((item) => item.sourceId),
);

export const demoMenuItems: MenuItem[] = catalog.items.map((item, index) => {
  const categoryId = categoryIdBySourceId.get(item.categorySourceId) ?? 1;
  const name = item.name.trim();
  const arabicName = /[\u0600-\u06ff]/.test(name);
  const nameEn = (arabicName ? itemEnglish[item.name] ?? itemEnglish[name] : name) || name;
  const nameAr = arabicName ? name : itemArabic[name] ?? name;
  const description = item.description?.trim() ?? "";
  const descriptionEn = /[\u0600-\u06ff]/.test(description) ? descriptionEnglish[description] ?? description : description;
  const descriptionAr = /[\u0600-\u06ff]/.test(description) ? description : descriptionArabic[description] ?? description;
  const slug = nameEn.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `menu-item-${index + 1}`;
  const categoryName = categoryNameBySourceId.get(item.categorySourceId) ?? "";

  return {
    id: index + 1,
    category_id: categoryId,
    name_en: nameEn,
    name_ar: nameAr,
    slug: `${slug}-${index + 1}`,
    description_en: descriptionEn,
    description_ar: descriptionAr,
    image_url: item.imageUrl,
    price: Number(item.price),
    is_available: true,
    is_featured: featuredSourceIds.has(item.sourceId) || categoryName === "Shawarma",
    is_visible: true,
    variants: [],
    modifier_groups: [],
    category: demoCategories.find((category) => category.id === categoryId),
  };
});

export const demoBrand = {
  ...brand,
  source: catalog.source,
};

export function findDemoMenuItem(slug: string) {
  return demoMenuItems.find((item) => item.slug === slug) ?? null;
}

export function withCatalogMenuItem(item: MenuItem): MenuItem {
  const sourceIndex = catalog.items.findIndex((sourceItem) =>
    item.slug.endsWith(`-${sourceItem.sourceId.slice(0, 8)}`),
  );
  const sourceItem = sourceIndex >= 0 ? demoMenuItems[sourceIndex] : null;

  if (!sourceItem) {
    return item;
  }

  return {
    ...item,
    name_en: sourceItem.name_en,
    name_ar: sourceItem.name_ar,
    description_en: sourceItem.description_en,
    description_ar: sourceItem.description_ar,
    image_url: item.image_url ?? sourceItem.image_url,
    category: item.category ?? sourceItem.category,
  };
}
