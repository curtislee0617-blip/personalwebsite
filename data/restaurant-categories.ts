export const restaurantCategories = [
  { name: "Bars", emoji: "🥂", description: "Cocktail bars, wine bars and drinking-focused venues." },
  { name: "Asian Fancy", emoji: "🍵", description: "Asian fine dining, tasting menus and omakase." },
  { name: "Fine Dining", emoji: "🍷", description: "Formal Western fine dining and tasting menus." },
  { name: "Western Nicer", emoji: "🍽️", description: "Western restaurants above USD 80 per person that are not formal fine dining." },
  { name: "Bakeries", emoji: "🍞", description: "Bread-led bakeries and boulangeries." },
  { name: "Tacos", emoji: "🌮", description: "Restaurants primarily serving tacos." },
  { name: "Burgers", emoji: "🍔", description: "Restaurants primarily serving burgers." },
  { name: "Chicken", emoji: "🍗", description: "Restaurants primarily serving chicken." },
  { name: "Ramen", emoji: "🍜", description: "Ramen specialists." },
  { name: "Sushi", emoji: "🍣", description: "Casual and mid-range sushi specialists." },
  { name: "Pizza", emoji: "🍕", description: "Pizzerias and pizza specialists." },
  { name: "Pasta", emoji: "🍝", description: "Restaurants primarily serving pasta." },
  { name: "Steakhouse", emoji: "🥩", description: "Steakhouses and restaurants primarily serving steak." },
  { name: "Bistro", emoji: "🥘", description: "Bistros and relaxed neighborhood dining rooms." },
  { name: "Barbecue", emoji: "🌭", description: "Barbecue restaurants, smokehouses and grilled-meat specialists." },
  { name: "Deli", emoji: "🥓", description: "Delis, delicatessens and bodegas." },
  { name: "Cafés", emoji: "☕", description: "Coffee shops and café-led venues." },
  { name: "Desserts", emoji: "🍰", description: "Dessert shops, ice cream and non-bread-led patisseries." },
  { name: "South Asian", emoji: "🍛", description: "Indian, Pakistani, Bangladeshi, Sri Lankan and related cuisines." },
  { name: "East Asian", emoji: "🥢", description: "Chinese, Japanese and Korean restaurants not covered by a specialist category." },
  { name: "Southeast Asian", emoji: "🌶️", description: "Thai, Vietnamese, Malaysian, Filipino, Indonesian and related cuisines." },
  { name: "Middle Eastern", emoji: "🧆", description: "Levantine, Persian, Turkish and related cuisines." },
  { name: "African", emoji: "🍲", description: "African cuisines not otherwise covered." },
  { name: "Casual", emoji: "🍴", description: "Other casual North American, South American, European and Oceanian restaurants." },
  { name: "Unclassified", emoji: "❓", description: "Places that need a manual classification." },
] as const;

export type RestaurantCategory = (typeof restaurantCategories)[number]["name"];

export function getCategoryEmoji(category: RestaurantCategory) {
  return restaurantCategories.find((item) => item.name === category)?.emoji ?? "❓";
}
