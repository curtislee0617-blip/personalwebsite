import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDirectory, "..");
const sourceRoot = path.resolve(
  process.argv[2] ?? path.join(root, "tmp/pdfs/thailand-pages-hires"),
);
const dataPath = path.join(root, "lib/imported-cookbooks-data.json");
const imageRoot = path.join(
  root,
  "public/imported-cookbooks/recipes/thailand-the-cookbook",
);

// These matches were read from the rotated labels printed beside each photograph.
// The two labelled photographs for recipes missing from the current transcription
// (Mango Salad with Smoked Dried Fish and Grilled Giant Freshwater Shrimp) are
// intentionally omitted instead of being attached to a different recipe.
const imagePagesByTitle = new Map([
  ["Spicy Tamarind Dip", 51],
  ["Pickled Bamboo Shoot Dip", 54],
  ["Spicy Green Mango Dip", 57],
  ["Shrimp Paste Dipping Sauce", 59],
  ["Seafood Dipping Sauce", 61],
  ["Very Spicy Thai Dipping Sauce", 63],
  ["Spicy Sauce with Boiled Eggs", 64],
  ["Tomato Chili Sauce", 67],
  ["Old-Style Rice Crust", 78],
  ["Grilled Eggs in Banana Leaves", 83],
  ["Thai Summer Rolls", 89],
  ["Pork and Shrimp Golden Packages", 91],
  ["Grilled Pork Skewers", 95],
  ["Sour Sausage Meat in Banana Leaf", 98],
  ["Fried Crickets with Herbs", 101],
  ["Roasted Crickets", 103],
  ["Grilled Yuca Root with Coconut Syrup", 107],
  ["Water Chestnut Rubies and Emeralds in Coconut Milk", 109],
  ["Dragon Fruit Frappé", 111],
  ["Passion Fruit Juice", 113],
  ["Lemongrass Juice", 114],
  ["Roselle Juice", 117],
  ["Spicy Fish Salad", 129],
  ["Spicy Squid and Heart of Palm Salad", 130],
  ["Spicy Salad with Shrimp and Pork", 135],
  ["Seafood Salad", 136],
  ["Snail and Noodle Salad", 144],
  ["Pickled Vegetable Salad", 147],
  ["Spicy Shiitake Mushroom Salad", 148],
  ["Spicy Mushroom Salad", 150],
  ["Green Papaya Salad", 155],
  ["Chicken and Banana Blossom Salad", 161],
  ["Indian Trumpet Flower Pod Spicy Salad", 163],
  ["Egg Tofu and Ground Pork Soup", 173],
  ["Spicy Snakehead Fish and Lotus Stem Soup", 179],
  ["Spicy Shrimp Soup", 183],
  ["Melinjo Leaf and Shrimp in Coconut Milk Soup", 184],
  ["Pork and Anise Soup with Rice Noodles", 189],
  ["Noodle Soup with Roasted Pork and Wontons", 193],
  ["Roasted Duck Noodle Soup", 196],
  ["Chicken and Coconut Soup", 199],
  ["Spicy Catfish and Snake Gourd Curry", 213],
  ["Spicy Catfish and Tree Basil Curry", 214],
  ["Dry Fish Curry", 221],
  ["Spicy Fish Ball Curry with Rice Vermicelli", 223],
  ["Crab Curry with Betel Leaves", 224],
  ["Stir-Fried Blue Crab Curry", 229],
  ["Beef Massaman Curry", 234],
  ["Beef and Coconut Milk Curry", 236],
  ["Beef Curry with Noodles", 239],
  ["Roasted Duck Curry with Lychee", 244],
  ["Chicken Curry with Herbs", 247],
  ["Spicy Chicken Curry and Young Banana", 249],
  ["Spicy Chicken Curry with Bamboo Shoots", 250],
  ["Steamed Mushroom Curry in Banana Leaves", 255],
  ["Spicy Banana Blossom Curry", 258],
  ["Grilled Squid", 269],
  ["Grilled Chicken", 279],
  ["Grilled Pork Salad", 280],
  ["Steamed Fish with Pumpkin and Herbs", 285],
  ["Steamed Catfish in Banana Leaf", 286],
  ["Stuffed Mangrove Trumpet Tree Flowers", 289],
  ["Pumpkin in Coconut Milk", 295],
  ["Spicy Fried Sea Bass", 297],
  ["Fried Sea Bass", 299],
  ["Deep-Fried Sea Bass on Betel Leaves", 300],
  ["Fried Sea Bass with Three-Flavored Sauce", 302],
  ["Deep-Fried Pork and Crabmeat in Shells", 307],
  ["Deep-Fried Soft-Shell Crab with Garlic", 309],
  ["Deep-Fried Shrimp", 311],
  ["Sun-Dried Pork", 315],
  ["Pork Floss Wrapped in Kale Leaves", 321],
  ["Stir-Fried Tofu with Bean Sprouts", 331],
  ["Stir-Fried Sea Bass with Cardamom Shoots", 334],
  ["Stir-Fried Kale with Salted Fish", 337],
  ["Stir-Fried Blue Crab with Curry Powder", 341],
  ["Stir-Fried Mushrooms, Baby Corn, and Shrimp", 342],
  ["Stir-Fried Squid", 345],
  ["Stir-Fried Beef with Broccoli in Oyster Sauce", 347],
  ["Phat Thai without Noodles", 351],
  ["Spicy Stir-Fried Pork Side", 353],
  ["Stir-Fried Ginger Chicken", 357],
  ["Spicy Stir-Fried Straw Mushroom Salad", 358],
  ["Stir-Fried Shiitake Mushrooms", 363],
  ["Stir-Fried Lotus Stems with Shrimp", 364],
  ["Fried Spinach with Oyster Sauce", 369],
  ["Spicy Stir-Fried Water Spinach", 371],
  ["Crab Fried Rice", 383],
  ["Shrimp Paste Fried Rice", 384],
  ["Crispy Curry Rice with Fermented Pork", 389],
  ["Thai Pork Fried Rice with Fried Eggs", 390],
  ["Glutinous Rice in a Banana Leaf", 392],
  ["Baked Pineapple and Rice", 395],
  ["Fried Rice with Pineapple", 396],
  ["Fried Noodles in Coconut Milk with Shrimp", 400],
  ["Fried Noodles with Chicken and Gravy", 403],
  ["Fried Noodles", 407],
  ["Stewed Beef Noodles", 409],
  ["Rice Noodles with Shredded Chicken", 410],
  ["Fried Rice Noodles with Chicken", 413],
  ["Golden Egg Teardrops", 425],
  ["Coconut Custard with Fried Shallots", 426],
  ["Sweet Glutinous Rice with Dried Shrimp", 429],
  ["Black Beans in Coconut Milk", 432],
  ["Sweet Glutinous Rice in Banana Leaf", 435],
  ["Glutinous Rice in Tiger Grass Leaf", 436],
  ["Sugar-Coated Stuffed Dough Balls", 439],
  ["Red Glutinous Rice with Sesame Seeds", 445],
  ["Sesame and Sugar-Coated Peanuts", 448],
  ["Pumpkin Custard", 451],
  ["Sweet Banana", 456],
  ["Tapioca with Longan", 460],
  ["Glutinous Rice with Mango", 462],
  ["Candied Sugar Palm Fruit", 465],
  ["Pandan Pudding", 466],
]);

const slugify = (value) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const books = JSON.parse(await fs.readFile(dataPath, "utf8"));
const thailand = books.find((book) => book.id === "thailand-the-cookbook");
if (!thailand) throw new Error("Thailand cookbook data was not found.");

await fs.mkdir(imageRoot, { recursive: true });

for (const [title, page] of imagePagesByTitle) {
  const matches = thailand.recipes.filter((recipe) => recipe.title === title);
  if (matches.length === 0) throw new Error(`Recipe titled "${title}" was not found.`);
  const recipe = matches.toSorted(
    (first, second) =>
      Math.abs(first.sourcePages[0] - page) - Math.abs(second.sourcePages[0] - page),
  )[0];

  const source = path.join(sourceRoot, `page-${String(page).padStart(3, "0")}.jpg`);
  const imageName = `${slugify(title)}.webp`;
  const destination = path.join(imageRoot, imageName);

  const croppedImage = await sharp(source)
    .extract({ left: 82, top: 70, width: 836, height: 1280 })
    .toBuffer();

  await sharp(croppedImage)
    .trim({ background: "#ffffff", threshold: 12 })
    .webp({ quality: 84, effort: 5 })
    .toFile(destination);

  recipe.image = `/imported-cookbooks/recipes/thailand-the-cookbook/${imageName}`;
}

await fs.writeFile(dataPath, JSON.stringify(books), "utf8");
console.log(`Attached ${imagePagesByTitle.size} labelled Thailand cookbook photographs.`);
