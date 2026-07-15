import operaData from "@/lib/opera-data.json";

export type OperaComponent = {
  name: string;
  ingredients: string[];
  steps: string[];
};

export type OperaRecipe = {
  slug: string;
  title: string;
  category: string;
  meta: string[];
  pdfPage: number;
  sourcePages: number[];
  sourceImages: string[];
  photoPage: number;
  image: string;
  components: OperaComponent[];
};

export type OperaBasic = {
  slug: string;
  name: string;
  group: "Doughs" | "Creams" | "Pralines" | "Others";
  ingredients: string[];
  method: string[];
  sourcePages: string[];
};

const sourcePages = (...pages: number[]) => pages.map((page) => `/opera/pages/page-${String(page).padStart(3, "0")}.webp`);

export const operaRecipes = operaData as OperaRecipe[];

export const operaCategories = [
  "7 a.m. · Breakfast pastries",
  "11 a.m. · French pastries",
  "3 p.m. · Desserts and frozen fruit",
  "5 p.m. · End of baking",
] as const;

export const operaBasics: OperaBasic[] = [
  {
    slug: "brioche-dough",
    name: "Brioche Dough",
    group: "Doughs",
    ingredients: ["7⅔ cups (1 kg) cake flour", "3 tablespoons (25 g) salt", "⅔ cup (120 g) superfine sugar", "⅔ cake (40 g) organic cake yeast, or 1½ tablespoons active dry yeast dissolved in water or milk", "9 large eggs (450 g)", "⅔ cup (150 g) whole milk", "2¼ cups (500 g) unsalted butter"],
    method: ["In an electric stand mixer fitted with a dough hook, add the flour, salt, sugar, yeast, eggs and milk. Mix on first speed for 35 minutes.", "Add the butter and mix on second speed for 8 minutes.", "Cover with a wet cloth and let rise for 1 hour at room temperature."],
    sourcePages: sourcePages(362, 363),
  },
  {
    slug: "puff-pastry-brioche-dough",
    name: "Puff Pastry Brioche Dough",
    group: "Doughs",
    ingredients: ["6⅓ cups (825 g) cake flour", "2 teaspoons (12 g) fine salt", "¼ cup (50 g) superfine sugar", "3 large eggs (150 g)", "1¼ cups (300 g) whole milk", "1¼ cakes (75 g) yeast, or 4 tablespoons active dry yeast dissolved in milk or water", "⅓ cup (75 g) unsalted butter, softened", "2 cups (450 g) unsalted dry butter, 84% fat"],
    method: ["In an electric stand mixer fitted with a dough hook, add the flour, salt, sugar, eggs, milk and yeast. Mix on first speed until smooth, then on second speed until the dough begins to come away from the bowl.", "Mix in the softened butter and knead until smooth. Cover with a damp cloth and let rise for 1 hour at 75–80°F (24–25°C).", "Punch down by hand, then roll to the width of the dry butter and twice its length. Freeze for 5 minutes, then refrigerate for 15 minutes.", "Place the dry butter in the middle and fold the dough over it from both sides. With the butter side up, roll to about ¼ inch (7 mm), fold the top and bottom to the midpoint, then fold in half like a wallet to make a double turn. Refrigerate for 10 minutes.", "Make one simple turn: roll to ⅜ inch (1 cm), fold the top third down and the bottom third over it. Roll to ⅛ inch (3.5 mm)."],
    sourcePages: sourcePages(362, 363),
  },
  {
    slug: "croissant-dough",
    name: "Croissant Dough",
    group: "Doughs",
    ingredients: ["7⅔ cups (1 kg) cake flour", "1 large egg (50 g)", "¾ cake (45 g) cake yeast, or 5 teaspoons active dry yeast dissolved in milk or water", "1 tablespoon (18 g) salt", "½ cup (100 g) superfine sugar", "1 tablespoon (20 g) honey", "5 tablespoons (70 g) unsalted butter, at room temperature", "1¾ cups (400 g) unsalted dry butter, 84% fat", "1¾ cups (420 g) water"],
    method: ["In an electric stand mixer fitted with a dough hook, mix the flour, water, egg, yeast, salt, sugar and honey on first speed until smooth, then on second speed until the dough comes away from the bowl.", "Mix in the softened butter and knead until smooth. Cover with a damp cloth and let rise for 1 hour at 75–80°F (24–25°C).", "Punch down by hand, then roll to the width of the dry butter and twice its length. Freeze for 5 minutes, then refrigerate for 15 minutes.", "Enclose the dry butter in the dough. With the butter side up, make a double turn at ¼ inch (7 mm). Refrigerate for 10 minutes, then make one simple turn and roll to ⅛ inch (3.5 mm)."],
    sourcePages: sourcePages(362, 363, 364),
  },
  {
    slug: "puff-pastry-dough",
    name: "Puff Pastry Dough",
    group: "Doughs",
    ingredients: ["Kneaded butter: 1½ cups (330 g) unsalted dry butter, 84% fat", "Kneaded butter: 1 cup plus 2 tablespoons (135 g) pastry flour", "Water dough: ½ cup plus 1 tablespoon (130 g) water", "Water dough: 2 teaspoons (12 g) salt", "Water dough: ½ teaspoon (3 g) distilled white vinegar", "Water dough: 7 tablespoons (100 g) unsalted butter, softened", "Water dough: 2⅔ cups (315 g) pastry flour"],
    method: ["Beat the dry butter with its flour in a stand mixer fitted with the flat beater for about 10 minutes. Roll the beurre manié into a 16 × 45-inch (40 × 115-cm) rectangle, ⅜ inch (10 mm) thick.", "Make the détrempe by mixing the water, salt, vinegar, softened butter and flour with a dough hook for about 15 minutes, until smooth.", "Roll the détrempe into a 15-inch (38-cm) square, ⅜ inch (10 mm) thick. Place it in the middle of the beurre manié and fold the edges over to enclose it.", "Give the dough four simple turns, refrigerating for 1 hour between every turn. Roll the finished dough to ⅛ inch (4 mm)."],
    sourcePages: sourcePages(364, 365),
  },
  {
    slug: "basque-shortbread-pastry-dough",
    name: "Basque Shortbread Pastry Dough",
    group: "Doughs",
    ingredients: ["1 cup plus 2 tablespoons (250 g) unsalted butter", "1 cup packed (220 g) light brown sugar", "2 large eggs (90 g)", "2½ cups (310 g) all-purpose flour", "1¾ cups (154 g) ground almonds", "¼ cake (16 g) yeast, or 2¾ teaspoons active dry yeast dissolved in milk or water", "½ teaspoon (3 g) salt"],
    method: ["Mix the softened butter and brown sugar in a bowl. Add the eggs, then the flour, ground almonds, yeast and salt.", "Roll to ⅛ inch (3 mm), then freeze for 40 minutes."],
    sourcePages: sourcePages(364, 365),
  },
  {
    slug: "pound-cake-batter",
    name: "Pound Cake Batter",
    group: "Doughs",
    ingredients: ["4 large eggs (200 g)", "2 cups (250 g) all-purpose flour", "1 cup plus 2 tablespoons (250 g) semi-salted butter", "¾ cup (150 g) raw sugar"],
    method: ["Add the eggs, flour, butter and sugar to the bowl of an electric stand mixer and blend."],
    sourcePages: sourcePages(365, 366),
  },
  {
    slug: "baba-dough",
    name: "Baba Dough",
    group: "Doughs",
    ingredients: ["⅓ cake (17 g) yeast, or 2 teaspoons active dry yeast dissolved in milk or water", "3⅔ cups (450 g) all-purpose flour", "⅔ teaspoon (4 g) salt", "⅔ cup (140 g) unsalted butter", "2½ teaspoons (17 g) honey", "10 large eggs (500 g)", "1½ tablespoons (25 g) whole milk"],
    method: ["In a stand mixer fitted with a dough hook, add the yeast, flour, salt, butter and honey. Knead on second speed, gradually adding the eggs and then the milk.", "Continue kneading until the dough comes completely away from the sides of the bowl."],
    sourcePages: sourcePages(366, 367),
  },
  {
    slug: "ladyfinger",
    name: "Ladyfinger",
    group: "Doughs",
    ingredients: ["6 large egg yolks (100 g)", "¾ cup plus 1½ tablespoons (164 g) superfine sugar, divided", "6 large egg whites (200 g)", "¾ cup plus 1½ tablespoons (164 g) all-purpose flour", "Superfine sugar, for finishing", "Confectioners’ sugar, for finishing"],
    method: ["Whip the egg yolks with half the superfine sugar. Separately whip the egg whites with the remaining sugar, then gently fold the two mixtures together with the flour.", "Spread 1/16 inch (2 mm) thick on a baking sheet. Sprinkle with superfine and confectioners’ sugars, then bake at 350°F (180°C) for 10 minutes."],
    sourcePages: sourcePages(366, 367),
  },
  {
    slug: "crumb-dough",
    name: "Crumb Dough",
    group: "Doughs",
    ingredients: ["½ cup (110 g) unsalted butter", "⅓ cup (75 g) superfine sugar", "¾ cup plus 1½ tablespoons (110 g) cake flour"],
    method: ["Cream the butter with the sugar in a stand mixer fitted with the flat beater. Add the flour, sift the crumbs and freeze for 30 minutes."],
    sourcePages: sourcePages(367),
  },
  {
    slug: "choux-paste",
    name: "Choux Paste",
    group: "Doughs",
    ingredients: ["⅔ cup (150 g) whole milk", "⅔ cup (150 g) water", "1½ tablespoons (18 g) trimoline", "1 teaspoon (6 g) salt", "½ cup plus 1½ tablespoons (132 g) unsalted butter", "1⅓ cups plus 2 tablespoons (180 g) all-purpose flour", "5 large eggs (250 g)"],
    method: ["Boil the milk, water, trimoline, salt and butter. Remove from the heat and immediately add the flour.", "Return to the heat and stir briskly to dry the mixture. Transfer to a stand mixer fitted with the flat beater and gradually add the eggs.", "Rest for 1 hour at room temperature."],
    sourcePages: sourcePages(367, 368),
  },
  {
    slug: "sweet-dough",
    name: "Sweet Dough",
    group: "Doughs",
    ingredients: ["⅔ cup (150 g) unsalted butter", "¾ cup (95 g) confectioners’ sugar", "⅓ cup (30 g) ground almonds", "⅙ teaspoon (1 g) Guérande salt", "⅓ teaspoon (1 g) vanilla powder", "1 large egg (50 g)", "2 cups (250 g) all-purpose flour"],
    method: ["In a stand mixer fitted with the flat beater, mix the butter, confectioners’ sugar, almonds, salt and vanilla powder. Emulsify with the egg, then add the flour.", "Mix until smooth and refrigerate for 4 hours."],
    sourcePages: sourcePages(367, 368),
  },
  {
    slug: "pastry-cream",
    name: "Pastry Cream",
    group: "Creams",
    ingredients: ["4 gelatin sheets (13 g powdered gelatin)", "1¾ cups plus 2 tablespoons (450 g) whole milk", "3½ tablespoons (50 g) whipping cream", "2 vanilla beans, split and scraped", "⅓ cup plus 2 tablespoons (90 g) superfine sugar", "1½ tablespoons (25 g) custard powder", "3½ tablespoons (25 g) all-purpose flour", "5⅓ large egg yolks (90 g)", "2 tablespoons (30 g) cocoa butter", "3½ tablespoons (50 g) unsalted butter", "2 tablespoons (30 g) mascarpone"],
    method: ["Soak the gelatin in cold water. Heat the milk and cream with the vanilla seeds and pods and infuse for 20 minutes.", "Whisk the sugar, custard powder, flour and yolks until pale. Strain the hot dairy over the yolk mixture, return to a clean saucepan and cook over medium heat for 2 minutes, whisking constantly, until thick.", "Off the heat add the cocoa butter, drained gelatin, butter and mascarpone. Blend, then cool rapidly in the refrigerator for about 30 minutes."],
    sourcePages: sourcePages(370),
  },
  {
    slug: "creme-anglaise",
    name: "Crème Anglaise",
    group: "Creams",
    ingredients: ["1⅓ cups (330 g) whole milk", "¾ cup (150 g) superfine sugar", "12 large egg yolks (200 g)"],
    method: ["Heat the milk, then pour it over the sugar and egg yolks beaten until pale. Return to the heat and cook to 175°F (80°C)."],
    sourcePages: sourcePages(370, 371),
  },
  {
    slug: "almond-cream",
    name: "Almond Cream",
    group: "Creams",
    ingredients: ["3½ tablespoons (50 g) unsalted butter", "¼ cup (50 g) superfine sugar", "½ cup (50 g) ground almonds", "1 large egg (50 g)"],
    method: ["Cream the butter with the sugar and ground almonds in a stand mixer fitted with the flat beater. Gradually incorporate the egg, then transfer to a pastry bag."],
    sourcePages: sourcePages(371),
  },
  {
    slug: "french-buttercream",
    name: "French Buttercream",
    group: "Creams",
    ingredients: ["¾ cup (180 g) whole milk", "8 large egg yolks (140 g)", "¾ cup plus 3 tablespoons (180 g) superfine sugar (1)", "3½ cups (800 g) unsalted butter", "3 large egg whites (112 g)", "1 cup plus 3 tablespoons (233 g) superfine sugar (2)", "⅓ cup (78 g) water"],
    method: ["Use the milk, yolks and sugar (1) to make a crème anglaise. In a stand mixer fitted with the whisk, gradually whip the crème anglaise into the butter.", "Whip the egg whites. Heat the water and sugar (2) to 250°F (120°C), pour over the whipped whites and mix on medium speed until cool.", "Fold the two mixtures together with a silicone spatula."],
    sourcePages: sourcePages(371),
  },
  {
    slug: "hazelnut-praline",
    name: "Hazelnut Praline",
    group: "Pralines",
    ingredients: ["3⅔ cups (500 g) hazelnuts", "1 cup (200 g) superfine sugar", "2½ teaspoons (10 g) fleur de sel", "⅓ cup (70 g) cocoa butter", "1¼ cups (70 g) feuilletine flakes"],
    method: ["Toast the hazelnuts at 320°F (160°C) for 15 minutes. Make a dry caramel with the sugar.", "Mix the hazelnuts and caramel with the fleur de sel in a stand mixer, then beat with the flat beater. Add the cocoa butter and feuilletine."],
    sourcePages: sourcePages(371, 372),
  },
  {
    slug: "cocoa-nib-praline",
    name: "Cocoa Nib Praline",
    group: "Pralines",
    ingredients: ["3⅔ cups (500 g) hazelnuts", "¾ cup (150 g) superfine sugar", "1¾ cups (200 g) cocoa nibs", "¾ cup plus 2 tablespoons (200 g) grapeseed oil", "2½ teaspoons (10 g) fleur de sel"],
    method: ["Toast the hazelnuts at 320°F (160°C) for 10 minutes. Make a dry caramel with the sugar.", "Mix the toasted hazelnuts, caramel and cocoa nibs in a stand mixer. With the flat beater, mix in the oil and fleur de sel."],
    sourcePages: sourcePages(372),
  },
  {
    slug: "vanilla-praline",
    name: "Vanilla Praline",
    group: "Pralines",
    ingredients: ["2½ cups (375 g) blanched almonds", "2 vanilla beans (10 g)", "1¼ cups (250 g) superfine sugar", "⅔ cup (165 g) water"],
    method: ["Toast the almonds and vanilla at 285°F (140°C) for 20 minutes.", "Heat the sugar and water to 230°F (110°C). Add the almonds and chopped vanilla, then mix and caramelize at 330°F (165°C).", "Cool on parchment, then blend coarsely in a food processor."],
    sourcePages: sourcePages(372, 373),
  },
  {
    slug: "lemon-gel",
    name: "Lemon Gel",
    group: "Others",
    ingredients: ["2 cups (500 g) lemon juice", "¼ cup (50 g) superfine sugar", "1 tablespoon (8 g) agar powder"],
    method: ["Bring the lemon juice to a boil, then add the sugar mixed with the agar. Cool, then blend in a food processor."],
    sourcePages: sourcePages(373),
  },
  {
    slug: "raspberry-preserves",
    name: "Raspberry Preserves",
    group: "Others",
    ingredients: ["1 cup (250 g) frozen raspberries", "¾ cup (150 g) superfine sugar, divided", "1¼ teaspoons (5 g) pectin NH", "2 teaspoons (10 g) lemon juice"],
    method: ["Heat the raspberries with half the sugar. Stir in the remaining sugar mixed with the pectin NH and boil for 1 minute.", "Add the strained lemon juice, mix and transfer to a vacuum-sealed bag."],
    sourcePages: sourcePages(373),
  },
  {
    slug: "meringue",
    name: "Meringue",
    group: "Others",
    ingredients: ["6 large egg whites (200 g)", "¾ cup plus 3 tablespoons (180 g) superfine sugar", "1⅔ cups (200 g) confectioners’ sugar", "¼ cup (20 g) unsweetened cocoa powder"],
    method: ["Whip the egg whites with the superfine sugar. Fold in the confectioners’ sugar.", "Pipe lines with an 11/16-inch (18-mm) plain tip onto a parchment-lined baking sheet. Dust with cocoa powder and bake at 200°F (90°C) for 1 hour."],
    sourcePages: sourcePages(373, 374),
  },
  {
    slug: "simple-syrup-30-baume",
    name: "Simple Syrup (30 Baumé Syrup)",
    group: "Others",
    ingredients: ["6⅔ cups (1.3 kg) superfine sugar", "4¼ cups (1 liter) water"],
    method: ["Combine the water and sugar and bring to a rolling boil over high heat. Cool to room temperature, then refrigerate."],
    sourcePages: sourcePages(374),
  },
];

export const operaBasicsBySlug = new Map(operaBasics.map((recipe) => [recipe.slug, recipe]));
