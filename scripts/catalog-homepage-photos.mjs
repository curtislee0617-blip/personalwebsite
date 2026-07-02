import { readdir, rename } from "node:fs/promises";
import path from "node:path";

const descriptions = [
  "chefs-with-red-book", "winery-barrel-group", "cycling-with-friends", "lobster-plated-dish",
  "baked-rice-and-cucumber", "fish-plated-dish", "duck-dinner-plates", "lamb-wellington",
  "chemistry-distillation-flask", "curry-and-cocktails", "chemistry-glassware", "orchestra-cellists",
  "orchestra-flute-performance", "green-curry", "meatballs-and-rice", "chemistry-heated-flask",
  "desert-canyon-tour", "desert-mountain-sign", "steak-frites", "restaurant-kitchen-team",
  "friends-in-the-sea", "fried-chicken-and-chips", "chemistry-separation-column", "flaming-chemistry-samples",
  "chemistry-lab-demonstration", "canyon-climbing", "seafood-clay-pot", "lab-beakers-on-scale",
  "petri-dish-lab-sample", "sandwich-and-tomatoes", "picnic-toast", "tomato-stew-and-noodles",
  "roast-chicken-curry", "dessert-and-drinks", "sliced-meat-noodle-bowl", "sliced-meat-soup",
  "eating-noodles", "toast-with-cheese", "margherita-pizza", "prosciutto-pizza",
  "charcuterie-and-salad", "sourdough-crumb-closeup", "lattice-pastry", "roast-tomato-and-eggs",
  "rocky-sea-cliffs", "mixing-lab-samples", "chef-kitchen-group", "mountain-lake",
  "plated-fish", "lime-wedge", "cultivated-meat-texture-sample", "texture-analyzer-lab",
  "black-gel-sample", "microscope-lab", "material-samples", "microchip-closeup",
  "cleanroom-researchers", "with-graphene-researcher", "industrial-pilot-plant", "nasa-jpl-lab-sign",
  "caltech-entrance-sign", "braised-meat-pasta", "restaurant-table-laughing", "picnic-charcuterie",
  "graduation-costumes", "croissants-in-hand", "coffee-and-pastries", "caneles",
  "shakshuka-and-egg", "barbecue-grill", "barbecue-meat-platter", "studying-on-lawn",
  "duck-breast-salad", "flavour-theory-presentation", "orchestra-friends", "formal-friends-on-lawn",
  "laboratory-liquid-pouring", "protest-crowd", "nitrogen-tank-lab", "chef-with-mentor",
  "petri-well-plate", "wine-cellar-barrels", "underground-train-platform", "wearing-kimono",
  "cultivated-meat-petri-dish", "meat-science-poster", "restaurant-kitchen-team-two", "with-chef-mentor-two",
  "kitchen-team-group", "mountain-river", "chef-in-kitchen", "flower-petals-in-tray",
  "dining-with-chef", "croissant", "school-group-courtyard", "school-building-group-photo",
  "assorted-laminated-pastries", "school-project-display", "caltech-condensed-can-art", "caltech-sign-friends",
  "sliced-steak-bowl", "fruit-tart", "school-building-group-photo-two", "sourdough-loaf",
  "creamy-pasta", "tortellini-pasta", "salmon-and-salad", "caltech-event-portrait",
  "sliced-duck-breast", "arranged-sausage-pan", "braised-meat-pot", "meat-pie",
  "chemical-engineering-car-competition", "typewriter-exhibition", "steak-dinner-table", "giant-paella",
  "sashimi-platters", "hamachi-sashimi", "lab-sample-moulds", "fish-in-tomato-sauce",
  "ratatouille-pan", "hillside-laptop-view", "butter-log", "beef-wellington",
  "beef-wellington-plated", "steak-on-fire", "dumplings-and-rice", "roast-chicken",
  "tuna-tasting-plate", "lamb-plated-dish", "burger", "hot-dog",
  "filled-croissant", "meatballs-in-sauce", "noodle-salad", "korean-seaweed-rice",
  "indoor-plant-farm", "plant-growth-chamber", "leaf-wrapped-meat-platter", "lab-researcher-mixing",
  "korean-stew", "sunset-mountain-lake", "kitchen-flambe", "sourdough-crumb",
  "prosciutto-flatbread", "tomato-rose-pastry", "tomato-tart", "banana-leaf-curry",
  "tortellini-broth", "scrambled-eggs", "tortellini-broth-two", "canele-tray",
  "sliced-meat-and-potatoes", "barbecue-ribs-and-potatoes", "chemistry-distillation", "baked-pasta",
  "lab-vial-in-glove", "chocolate-cake-dessert", "chocolate-cake-and-ice-cream", "violin-performance",
  "retronasal-olfaction-presentation", "flavour-theory-presentation-two", "sweetness-graph-presentation",
];

const directory = path.join(process.cwd(), "public", "photos");
const files = (await readdir(directory)).filter((file) => /\.(avif|jpe?g|png|webp)$/i.test(file));

if (descriptions.length !== 163) {
  throw new Error(`Expected 163 descriptions, received ${descriptions.length}.`);
}

for (let index = 0; index < descriptions.length; index += 1) {
  const number = String(index + 1).padStart(3, "0");
  const target = `${number}-${descriptions[index]}.webp`;
  const source = files.find((file) => file.startsWith(`${number}-`));

  if (!source || source === target) continue;
  await rename(path.join(directory, source), path.join(directory, target));
  console.log(`${source} -> ${target}`);
}
