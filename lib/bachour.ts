export type BachourRecipeComponent = {
  name: string;
  ingredients: string[];
  steps: string[];
};

export type BachourRecipe = {
  slug: string;
  title: string;
  yield: string;
  image: string | null;
  imagePosition?: string;
  sourceNote?: string;
  components: BachourRecipeComponent[];
};

export const bachourRecipes: BachourRecipe[] = [
  {
    slug: "strawberry-brownie-vanilla",
    title: "Strawberry, Brownie & Vanilla",
    yield: "12–15 pieces",
    image: "/bachour/strawberry-brownie-vanilla.jpeg",
    imagePosition: "46% 62%",
    sourceNote: "The supplied photographs begin with the finished cross-section and recipe page; the original title page was not included, so this descriptive title follows the photographed components.",
    components: [
      {
        name: "Chocolate Brownie",
        ingredients: ["210 g butter, cubed", "110 g sugar", "120 g light brown sugar", "190 g eggs", "100 g all-purpose flour", "2 g baking powder", "1 g fleur de sel", "170 g milk chocolate couverture, 40% cocoa", "10 g walnuts, chopped"],
        steps: [
          "Mix the butter and both sugars with the paddle attachment. Mix in the eggs, then the sifted flour, baking powder and salt. Add the chocolate, melted to 45°C, and the walnuts.",
          "Mix thoroughly without overmixing. Spread on a parchment-lined half-sheet pan and bake at 160°C for 20 minutes. Freeze, cut into 5 cm rounds and keep frozen until needed.",
        ],
      },
      {
        name: "Vanilla Cream",
        ingredients: ["150 g heavy cream, 35% fat", "2 vanilla pods", "55 g egg yolks", "25 g sugar", "5 g silver gelatin sheets", "400 g heavy cream, 35% fat"],
        steps: [
          "Bloom the gelatin in ice water, squeeze out the excess water and reserve.",
          "Cook the first cream, vanilla, egg yolks and sugar as a crème anglaise to 82°C. Add the gelatin, cool to 25°C and fold in the second cream, whipped to soft peaks.",
        ],
      },
      {
        name: "Strawberry Panna Cotta",
        ingredients: ["300 g Greek yogurt", "10 g silver gelatin sheets", "150 g heavy cream", "90 g sugar", "520 g strawberry purée"],
        steps: ["Bloom and drain the gelatin. Boil the cream, purée and sugar, dissolve in the gelatin, then pour over the yogurt and blend with a hand blender."],
      },
      {
        name: "Strawberry Crunchy Coating",
        ingredients: ["550 g Valrhona Strawberry Inspiration", "35 g grapeseed oil", "50 g corn flakes, crushed"],
        steps: ["Melt the chocolate and oil to 40°C and fold in the crushed corn flakes. Use at 35°C."],
      },
      {
        name: "White Chocolate Whipped Ganache",
        ingredients: ["200 g heavy cream, 35% fat", "25 g invert sugar", "25 g glucose", "300 g Ivoire white chocolate, 35% cocoa", "500 g heavy cream, 35% fat"],
        steps: ["Boil the first cream with the glucose and invert sugar. Pour gradually over the melted chocolate and blend into an emulsion. Add the cold second cream, blend again and refrigerate for about 12 hours before whipping."],
      },
    ],
  },
  {
    slug: "matcha-calamansi-yuzu-wasabi",
    title: "Matcha, Calamansi, Yuzu & Wasabi",
    yield: "15 pieces",
    image: "/bachour/matcha-yuzu-wasabi.jpeg",
    imagePosition: "50% 55%",
    sourceNote: "The supplied sequence contains the component page and assembly photographs but omits the original title page. This descriptive title follows the photographed components.",
    components: [
      {
        name: "Green Tea Dacquoise",
        ingredients: ["28 g all-purpose flour", "85 g almond flour", "100 g sugar", "12 g matcha tea powder", "140 g egg whites", "50 g sugar"],
        steps: ["Sift the flours, matcha and first sugar together. Whip the egg whites while quickly adding the second sugar until smooth, then fold in the dry mixture. Spread on a silicone-lined half-sheet pan, bake at 180°C for 12 minutes, cool, freeze and cut into 5 cm discs."],
      },
      {
        name: "Calamansi Crémeux",
        ingredients: ["28 g sugar", "100 g calamansi purée", "100 g eggs", "70 g Ivoire white chocolate, 35% cocoa", "20 g cocoa butter", "4 g silver gelatin sheets"],
        steps: ["Cook the sugar, purée and eggs as a crème anglaise to 82°C. Add the bloomed gelatin, pour over the chocolate and cocoa butter and emulsify. Portion 20 ml into 5 cm hemisphere moulds and freeze."],
      },
      {
        name: "Yuzu Mousse",
        ingredients: ["120 g whole milk", "9 g silver gelatin", "220 g white chocolate", "95 g yuzu juice", "420 g heavy cream"],
        steps: ["Bloom and drain the gelatin. Boil the milk and dissolve in the gelatin. Pour one-third over the chocolate and mix until glossy and elastic, then add the rest without breaking the emulsion. Add the yuzu juice and, at 28°C, fold in the whipped cream."],
      },
      {
        name: "Wasabi Green Glaze",
        ingredients: ["18 g silver gelatin sheets", "125 g water", "225 g granulated sugar", "225 g glucose syrup", "225 g Ivoire white chocolate, 35% cocoa", "160 g condensed milk", "90 g neutral glaze", "20 g wasabi powder", "3 g yellow water-based food colour", "2 g green water-based food colour", "Silver dust, as needed"],
        steps: ["Bloom and drain the gelatin. Boil the water, sugar and glucose to 103°C and stir in the gelatin. Pour over the white chocolate and wasabi and emulsify. Blend in the condensed milk, neutral glaze and colours. Use at 35°C."],
      },
      {
        name: "White Chocolate Strip",
        ingredients: ["500 g white chocolate, 35% cocoa", "25 g Pavoni white cocoa butter"],
        steps: ["Heat to 45°C, temper and use at 29°C. Spread on acetate, allow to set, cut into 5.5 × 9.5 cm strips and roll around parchment into an 8 cm tube."],
      },
      {
        name: "Modelling Chocolate Flower",
        ingredients: ["250 g white chocolate", "50 g cocoa butter", "50 g glucose", "25 g water", "Natural white colour powder, as needed"],
        steps: ["Process the chocolate and cocoa butter to a paste. Add the glucose, water and colour and mix until homogeneous. Rest between acetate at 22°C for at least 6 hours, roll to 0.5 mm and cut with a daisy cutter. Temper yellow chocolate and dot the flower centre."],
      },
      {
        name: "Sablé Dough",
        ingredients: ["180 g unsalted butter, chilled and cubed", "397 g all-purpose flour", "97.5 g confectioners’ sugar", "Pinch of salt", "45 g almond flour", "71 g whole eggs"],
        steps: ["Mix the butter with the flour, sugar, salt and almond flour to breadcrumbs. Add the egg and mix only until a ball forms. Roll to 2 mm, chill for at least 1 hour, line 6 cm tart moulds and bake at 165°C for about 15 minutes until lightly golden."],
      },
    ],
  },
  {
    slug: "strawberry-field",
    title: "Strawberry Field",
    yield: "3 entremets, 18 cm diameter",
    image: "/bachour/strawberry-field.jpeg",
    imagePosition: "50% 57%",
    components: [
      {
        name: "Almond Cake",
        ingredients: ["97.5 g almond paste", "97.5 g unsalted butter", "97.5 g granulated sugar", "1 vanilla bean, split lengthwise and scraped", "93 g eggs", "75 g flour", "7 g baking powder", "Pinch of salt", "97.5 g sour cream"],
        steps: ["Preheat the oven to 170°C. Beat the almond paste, butter, sugar and vanilla until light and smooth. Add the eggs gradually. Sift in the flour, baking powder and salt; mix on low for 1 minute, then add the sour cream for 30 seconds. Put 135 g batter in a greased 16 cm mould, bake 15–20 minutes and freeze."],
      },
      {
        name: "Strawberry Basil Compote",
        ingredients: ["340 g strawberry purée", "180 g strawberries, diced", "7 g basil leaves, chopped", "100 g sugar", "13 g pectin NH", "5 g lemon juice"],
        steps: ["Warm the purée to 40°C. Add the sugar mixed with pectin, then the fruit and bring to a boil. Add lemon juice and basil. Pour 150 g over the frozen almond cake and freeze."],
      },
      {
        name: "Valrhona Strawberry Inspiration Crémeux",
        ingredients: ["156 g strawberry purée", "20 g invert sugar", "6.5 g silver gelatin sheets", "275 g Valrhona Strawberry Inspiration", "234 g heavy cream"],
        steps: ["Bloom and drain the gelatin. Heat the purée and invert sugar, dissolve in the gelatin and pour over the melted chocolate. Blend, cool to 28°C and blend in the cold cream. Pour 150 g over the strawberry-basil compote and freeze."],
      },
      {
        name: "Strawberry Mousse",
        ingredients: ["375 g strawberry purée", "70 g sugar", "30 g albumin powder", "13 g silver gelatin sheets", "375 g heavy cream, whipped to soft peaks"],
        steps: ["Bloom and drain the gelatin. Mix sugar and albumin, then whip with the purée to soft peaks. Melt the gelatin and fold in a little meringue, then the remainder, followed by the semi-whipped cream."],
      },
      {
        name: "Red Glaze",
        ingredients: ["18 g silver gelatin sheets", "125 g water", "225 g granulated sugar", "225 g glucose syrup", "225 g white chocolate", "160 g condensed milk", "90 g neutral glaze", "5 g red water-based food colour"],
        steps: ["Bloom and drain the gelatin. Boil the water, sugar and glucose to 103°C and add the gelatin. Pour over the chocolate and emulsify. Blend in the condensed milk, neutral glaze and colour. Use at 35°C."],
      },
      {
        name: "Red Chocolate Decoration",
        ingredients: ["500 g Ivoire 35% white chocolate, melted", "25 g red cocoa butter, melted"],
        steps: ["Spread the tempered chocolate and cocoa-butter mixture between acetate sheets. Cut into 8 × 1 cm rectangles and 18 × 1.5 cm strips for the entremet decoration."],
      },
    ],
  },
  {
    slug: "pistachio-paris-brest",
    title: "Pistachio Paris-Brest",
    yield: "15–20 pieces",
    image: "/bachour/pistachio-paris-brest.jpeg",
    imagePosition: "50% 58%",
    components: [
      {
        name: "Craquelin",
        ingredients: ["150 g butter", "150 g brown sugar", "120 g flour", "60 g almond flour"],
        steps: ["Beat all ingredients with the paddle until smooth. Laminate to 2 mm and freeze."],
      },
      {
        name: "Choux",
        ingredients: ["75 g water", "75 g milk", "70 g butter", "100 g all-purpose flour", "2.5 g salt", "2.5 g sugar", "150 g eggs"],
        steps: ["Bring water, milk, butter, sugar and salt to a simmer. Stir in sifted flour and cook 1–3 minutes until the dough leaves the pan. Paddle on low until about 45°C, then add eggs gradually until shiny, thick and smooth.", "Pipe 5 cm rings with an 807 tip. Top with same-size craquelin rings. Bake at 200°C, immediately reduce to 175°C and bake about 25 minutes until risen and browned. Cool."],
      },
      {
        name: "Pistachio Praliné",
        ingredients: ["300 g sugar", "170 g water", "505 g pistachios", "50 g 100% pistachio paste"],
        steps: ["Cook the sugar and water to caramel, pour over the pistachios and cool. Grind to a paste, then add pistachio paste until the colour is nutty green."],
      },
      {
        name: "Pistachio Praliné Crémeux",
        ingredients: ["30 g whole milk", "2.3 g silver gelatin sheets", "190 g pistachio praliné", "100 g heavy cream, 35% fat"],
        steps: ["Heat the milk and dissolve in the hydrated gelatin. Gradually emulsify into the pistachio praliné, then blend in the cold cream. Refrigerate overnight. Pipe a 6 cm ring, top with another to form a thicker ring and freeze."],
      },
      {
        name: "Pistachio Whipped Ganache",
        ingredients: ["175 g heavy cream, 35% fat", "50 g invert sugar", "30 g glucose syrup", "300 g Ivoire 35% white chocolate", "65 g 100% pistachio paste", "3 g silver gelatin sheets", "410 g cold heavy cream"],
        steps: ["Boil the first cream with invert sugar and glucose. Add bloomed gelatin, pour over the chocolate and pistachio paste and blend. Add the cold cream and refrigerate overnight before whipping."],
      },
    ],
  },
  {
    slug: "coffee-caramel-gianduja",
    title: "Coffee, Caramel & Gianduja",
    yield: "3 entremets, 18 cm diameter",
    image: "/bachour/coffee-caramel-gianduja.jpeg",
    imagePosition: "50% 55%",
    sourceNote: "The supplied photographs contain the full component page and finished cake, but not its original title page. This descriptive title follows the photographed components.",
    components: [
      {
        name: "Chocolate Biscuit",
        ingredients: ["33 g almond powder", "33 g confectioners’ sugar", "105 g egg yolks", "25 g heavy cream", "23 g cocoa powder", "30 g dark couverture, 70% cocoa", "70 g butter, 82% fat", "150 g egg whites", "33 g sugar for meringue"],
        steps: ["Whip the egg whites and sugar to a meringue. Fold in the egg yolks, then the dry ingredients. Finish with the cream and the chocolate and butter, previously combined at 45°C. Pour 135 g into a 16 cm ring and bake at 170°C for 12 minutes. Freeze."],
      },
      {
        name: "Soft Coffee Caramel",
        ingredients: ["120 g sugar", "120 g glucose", "190 g heavy cream", "75 g milk", "15 g instant coffee", "75 g butter"],
        steps: ["Cook sugar and glucose to caramel. Heat the cream, milk and coffee and use to deglaze. Cook to 107°C, add butter and blend. Cool to room temperature, pipe 150 g over the frozen biscuit and freeze."],
      },
      {
        name: "Vanilla Custard",
        ingredients: ["160 g milk", "160 g heavy cream, 35% fat", "3 vanilla beans", "85 g egg yolks", "85 g sugar", "7.5 g silver gelatin sheets"],
        steps: ["Boil the milk, cream and vanilla; cover off the heat for at least 10 minutes. Temper into the yolks and sugar, return to the pan and cook to 85°C. Add drained gelatin, pour 150 g over the frozen caramel and freeze."],
      },
      {
        name: "Coffee Mousse",
        ingredients: ["4.2 g silver gelatin sheets", "185 g milk", "2 vanilla beans", "37 g Arabica coffee beans", "6 g instant coffee", "250 g white chocolate", "250 g heavy cream, 35% fat"],
        steps: ["Infuse 250 g milk with coffee beans and vanilla overnight. Strain and adjust the milk to 187 g. Simmer with the instant coffee, add gelatin and emulsify into the chocolate in three additions. Cool to 28°C and fold in softly whipped cream."],
      },
      {
        name: "Glaze",
        ingredients: ["18 g silver gelatin sheets", "125 g water", "225 g granulated sugar", "225 g glucose syrup", "225 g Ivoire white chocolate", "160 g condensed milk", "90 g Absolu Cristal neutral glaze", "5 g natural brown water-based colour", "Gold dust"],
        steps: ["Bloom and drain the gelatin. Boil water, sugar and glucose to 103°C and add the gelatin. Pour over the chocolate and emulsify, then blend in condensed milk, colour, gold dust and neutral glaze. Apply at about 35°C."],
      },
      {
        name: "Gianduja Wire",
        ingredients: ["500 g Jivara milk chocolate, 40% cocoa", "250 g 100% hazelnut paste"],
        steps: ["Melt the chocolate to 45°C, mix with hazelnut paste and temper to 30°C in a rectangular mould. Chill for a few hours, return to room temperature and grate into fine wire curls."],
      },
    ],
  },
  {
    slug: "caramel-coffee",
    title: "Caramel Coffee",
    yield: "15 pieces",
    image: "/bachour/caramel-coffee.jpeg",
    imagePosition: "50% 55%",
    components: [
      {
        name: "Chocolate Biscuit",
        ingredients: ["65 g almond powder", "65 g confectioners’ sugar", "210 g egg yolks", "50 g heavy cream", "45 g cocoa powder", "60 g 70% dark couverture", "140 g dry butter, 84% fat", "300 g egg whites", "65 g sugar for meringue"],
        steps: ["Whip egg whites with the second sugar to a meringue. Fold in yolks, then dry ingredients, then the cream and chocolate-butter mixture at 45°C. Spread on a full sheet pan and bake at 170°C for 12 minutes. Cool, freeze and cut into 5 cm discs."],
      },
      {
        name: "Coffee Crème Brûlée",
        ingredients: ["350 g heavy cream, 35% fat", "45 g coffee beans", "300 g basic cream infusion", "60 g whole milk", "50 g sugar", "10 g sugar", "60 g egg yolks", "5 g silver gelatin sheets"],
        steps: ["Roast coffee beans at 160°C for 5 minutes and cold-infuse in the cream for at least 5 hours. Bloom gelatin. Combine the basic cream infusion with milk and heat to 55°C. Caramelise 50 g sugar, deglaze with the cream mixture, then temper into yolks mixed with 10 g sugar. Cook to 82–84°C, add gelatin and pour about 20 ml into insert moulds. Freeze."],
      },
      {
        name: "Caramel Mousse",
        ingredients: ["90 g sugar", "60 g glucose", "172 g heavy cream, 35% fat", "60 g egg yolks", "60 g water", "20 g milk powder", "12 g invert sugar", "150 g pâte à bombe", "150 g caramel sauce", "45 g egg yolks", "135 g Ivoire white chocolate, 35% cocoa", "23 g cocoa butter", "7.5 g silver gelatin sheets", "270 g heavy cream, 35%"],
        steps: ["For the caramel sauce, cook sugar and glucose to caramel and deglaze with hot cream. For the pâte à bombe, mix yolks, water, milk powder and invert sugar, cook over a bain-marie to 85°C and whip on high.", "Mix the caramel sauce with 45 g yolks and cook to 85°C. Add hydrated gelatin, pour over white chocolate and cocoa butter and blend. Cool to 30°C, fold in medium-peaked cream and finish with the pâte à bombe."],
      },
      {
        name: "Glaze",
        ingredients: ["18 g silver gelatin sheets", "125 g water", "225 g granulated sugar", "225 g glucose syrup", "160 g Dulcey chocolate", "90 g condensed milk", "90 g Absolu Cristal neutral glaze"],
        steps: ["Bloom gelatin. Boil water, sugar and glucose to 103°C and add the gelatin. Pour over the chocolate and emulsify, then blend in condensed milk and neutral glaze. Use at 35°C."],
      },
      {
        name: "Dulcey Chocolate Decoration",
        ingredients: ["Dulcey chocolate, as needed", "Sugar, as needed", "Gold powder, as needed"],
        steps: ["Mix sugar and gold powder. Temper the Dulcey, spread on acetate, sprinkle with the gold sugar and cut 7 cm circles. Put parchment on top, roll into a tube and crystallise overnight."],
      },
    ],
  },
  {
    slug: "sweet-potato-pear-tart",
    title: "Sweet Potato Pear Tart",
    yield: "12 pieces",
    image: "/bachour/sweet-potato-pear-tart.jpeg",
    imagePosition: "50% 55%",
    components: [
      {
        name: "Hazelnut Sablé",
        ingredients: ["135 g butter, chilled and cubed", "120 g confectioners’ sugar", "69 g whole eggs", "45 g toasted hazelnut powder", "315 g all-purpose flour", "2.5 g salt"],
        steps: ["Paddle butter, flour, sugar, salt and hazelnut powder to a sandy texture. Add eggs and mix only until a ball forms. Chill at least 3 hours, roll to 2 mm, line 6 cm tart moulds and bake at 165°C about 15 minutes until lightly golden."],
      },
      {
        name: "Sweet Potato Custard",
        ingredients: ["290 g sweet potato, roasted and peeled", "224 g sugar", "28 g evaporated milk", "200 g whole egg", "Pinch of salt", "56 g butter, melted"],
        steps: ["Preheat the oven to 165°C. Blend the sugar, evaporated milk, eggs, roasted sweet potato and salt, then add melted butter. Pipe one-third into each tart and bake about 10 minutes, until a knife comes out clean."],
      },
      {
        name: "Pear Crémeux",
        ingredients: ["190 g pear purée", "60 g egg yolks", "70 g whole egg", "55 g sugar", "70 g butter", "10 g silver gelatin sheets"],
        steps: ["Bloom and drain the gelatin. Mix yolks, eggs and sugar. Bring the purée to a simmer and temper into the egg mixture; cook to 82°C. Add gelatin, cool to 40°C and blend in butter. Pour over the sweet potato custard and chill until set."],
      },
      {
        name: "Pear Compote",
        ingredients: ["225 g fresh pear", "Lemon juice, as needed", "50 g sugar", "8 g pectin NH", "160 g pear purée"],
        steps: ["Dice the fresh pear and toss with lemon juice. Heat the purée and pear to 40°C, add sugar mixed with pectin and boil for 1 minute. Fill 38 × 20 mm hemisphere moulds and freeze."],
      },
      {
        name: "Nappage Spray",
        ingredients: ["300 g Valrhona Absolu Cristal neutral glaze", "30 g water"],
        steps: ["Heat the glaze and water to 70–80°C and apply."],
      },
    ],
  },
  {
    slug: "illanka-chocolate-choux",
    title: "Illanka Chocolate Choux",
    yield: "12 pieces",
    image: "/bachour/illanka-chocolate-choux.jpeg",
    imagePosition: "50% 54%",
    sourceNote: "The supplied photographs contain the full component page and finished cross-section, but not the original title page. This descriptive title follows the photographed Illanka and choux components.",
    components: [
      {
        name: "Cocoa Craquelin",
        ingredients: ["100 g flour", "18 g cocoa powder", "95 g sugar", "80 g butter"],
        steps: ["Cream all ingredients with the paddle. Wrap and chill for 45 minutes, roll to 2 mm and cut 2 cm discs."],
      },
      {
        name: "Cocoa Pâte à Choux",
        ingredients: ["120 g milk", "50 g butter", "2 g sugar", "2 g salt", "52 g all-purpose flour", "14 g cocoa powder", "120 g eggs"],
        steps: ["Bring milk, butter, sugar and salt to a boil. Stir in flour and cocoa and cook about 1 minute until the dough leaves the pan. Paddle to about 45°C, then mix in eggs gradually. Pipe 2 cm buttons, top with craquelin and bake at 220°C for 20–25 minutes."],
      },
      {
        name: "Whipped Jivara Ganache",
        ingredients: ["112 g heavy cream, 35% fat", "13 g glucose", "13 g invert sugar", "160 g Jivara 40% milk chocolate", "290 g chilled heavy cream, 35% fat"],
        steps: ["Heat the first cream with invert sugar and glucose. Combine gradually with melted chocolate, then blend in the chilled cream. Refrigerate at least 12 hours before whipping."],
      },
      {
        name: "Chocolate Biscuit",
        ingredients: ["180 g sugar", "187 g egg whites", "180 g egg yolks", "37 g potato starch", "37 g all-purpose flour", "80 g Guanaja 70% dark couverture", "80 g clarified butter"],
        steps: ["Whip egg whites with sugar to medium peaks. Sift flour and starch. Melt butter and chocolate, fold yolks into the whites, then dry ingredients, followed by the chocolate-butter mixture. Bake on a half-sheet pan at 180°C for 10–13 minutes. Cool, freeze and cut 5 cm discs."],
      },
      {
        name: "Illanka 62% Chocolate Mousse",
        ingredients: ["150 g milk", "50 g egg yolks", "30 g sugar", "185 g Illanka 63% dark couverture", "230 g heavy cream"],
        steps: ["Bring milk to a boil. Temper into yolks and sugar and cook to 85°C. Strain over the chocolate and blend. At 40°C, fold in whipped cream."],
      },
      {
        name: "Illanka Chocolate Cream",
        ingredients: ["1 silver gelatin sheet", "75 g milk", "75 g heavy cream, 35%", "33 g egg yolks", "17 g sugar", "100 g Illanka 63% dark couverture"],
        steps: ["Cook milk, cream, yolks and sugar as a crème anglaise to 82–85°C. Add gelatin, strain over chocolate at 40–45°C and blend. Fill 38 × 20 mm hemisphere moulds and freeze."],
      },
      {
        name: "Chocolate Glaze",
        ingredients: ["12 g silver gelatin sheets", "55 g water", "25 g glucose syrup", "55 g dextrose", "55 g heavy cream", "12 g non-fat milk powder", "175 g sugar", "70 g cocoa powder", "120 g Absolu Cristal neutral glaze"],
        steps: ["Bloom gelatin. Heat water, glucose and dextrose to 40°C; add cream, milk powder, sugar and cocoa and boil. Stir in gelatin, strain over neutral glaze and blend. Cool before use."],
      },
    ],
  },
  {
    slug: "bachour-piedmont",
    title: "Bachour Piedmont",
    yield: "12–15 pieces",
    image: "/bachour/bachour-piedmont.jpeg",
    imagePosition: "50% 56%",
    components: [
      {
        name: "100% Pure Hazelnut Paste",
        ingredients: ["500 g Piedmont hazelnuts"],
        steps: ["Bake the hazelnuts at 165°C for 13–15 minutes. Cool, then process to a smooth paste."],
      },
      {
        name: "Dark Gianduja",
        ingredients: ["300 g 100% pure hazelnut paste", "750 g 55% dark couverture"],
        steps: ["Heat chocolate and hazelnut paste to 45°C and mix. Pre-crystallise to 25°C, spread in a rectangular frame and crystallise."],
      },
      {
        name: "Gianduja Crémeux",
        ingredients: ["175 g heavy cream, 35% fat", "75 g milk", "50 g egg yolks", "225 g dark gianduja", "3 g silver gelatin"],
        steps: ["Bloom gelatin. Cook cream, milk and yolks to 82°C, remove from heat and add gelatin. Strain over the gianduja and blend."],
      },
      {
        name: "Hazelnut Praliné",
        ingredients: ["50 g water", "175 g sugar", "300 g roasted hazelnuts", "1 vanilla bean"],
        steps: ["Caramelise the sugar with water and vanilla, add roasted hazelnuts and cool. Process to a praliné texture."],
      },
      {
        name: "Hazelnut Praliné Crémeux",
        ingredients: ["50 g heavy cream, 35% fat", "2.5 g silver gelatin", "350 g hazelnut praliné", "175 g chilled heavy cream, 35% fat"],
        steps: ["Heat the first cream and add hydrated gelatin. Gradually emulsify into the praliné, then slowly blend in the chilled cream until glossy and elastic."],
      },
      {
        name: "Azélia Chocolate and Caramel Whipped Ganache",
        ingredients: ["250 g heavy cream, 35% fat", "25 g glucose syrup", "30 g sugar", "170 g Azélia milk couverture, 35%", "375 g chilled heavy cream, 35% fat"],
        steps: ["Boil the first cream and glucose. Make a dry caramel with the sugar and stop it with the hot cream. Cool to about 60°C, pour gradually over the chocolate and blend. Add the chilled cream, blend and refrigerate overnight before whipping."],
      },
      {
        name: "Crunchy Milk Chocolate Coating",
        ingredients: ["400 g milk couverture", "60 g cocoa butter", "80 g hazelnuts, crushed"],
        steps: ["Melt chocolate and cocoa butter to 35°C, add the hazelnuts and use immediately."],
      },
    ],
  },
  {
    slug: "guanaja-pecan-cookies",
    title: "Guanaja Pecan Cookies",
    yield: "18 cookies",
    image: "/bachour/guanaja-pecan-cookies.jpeg",
    imagePosition: "50% 58%",
    components: [
      {
        name: "Guanaja Chocolate Cookie Dough",
        ingredients: ["500 g all-purpose flour", "6 g baking soda", "6 g baking powder", "2 g cinnamon powder", "6 g sea salt", "300 g unsalted butter", "300 g light brown sugar", "220 g granulated sugar", "2 large eggs", "175 g Guanaja 70% dark couverture, melted", "330 g Guanaja 70% dark couverture, chopped", "100 g pecan pieces, lightly roasted"],
        steps: ["Combine flour, baking soda, baking powder, cinnamon and salt. Paddle butter and both sugars for about 5 minutes until soft and fluffy, then add eggs one at a time. Mix in dry ingredients on low, followed by melted chocolate, most of the chopped chocolate and pecans.", "Shape into 100 g balls and place 6–8 on a parchment-lined tray. Flatten slightly and add the reserved chocolate and pecans without crushing. Bake at 170°C for 10–12 minutes and cool on a rack."],
      },
      {
        name: "Chocolate Sauce",
        ingredients: ["130 g water", "40 g glucose syrup", "130 g Guanaja 70% dark couverture", "1 g xanthan gum"],
        steps: ["Boil water and glucose. Start an emulsion by adding a little hot syrup to the melted chocolate. Blend in xanthan gum, then add the remaining hot liquid and blend again. Refrigerate until needed."],
      },
      {
        name: "Pecan Praliné",
        ingredients: ["200 g sugar", "400 g pecan nuts, roasted", "2 g salt"],
        steps: ["Cook sugar to a golden caramel, add salt and roasted pecans, and cool on a silicone mat. Process to a praliné."],
      },
    ],
  },
  {
    slug: "chocolate-tart",
    title: "Chocolate Tart",
    yield: "15 tarts, 6 cm diameter",
    image: "/bachour/chocolate-tart.jpeg",
    imagePosition: "50% 57%",
    components: [
      {
        name: "Sablé Dough",
        ingredients: ["180 g butter, chilled and cubed", "100 g confectioners’ sugar", "60 g cocoa powder", "Pinch of salt", "45 g almond powder", "72 g whole eggs", "337 g flour"],
        steps: ["Paddle the butter into small cubes. Add flour, cocoa, sugar, salt and almond and mix to a powder. Add egg and mix until crumbly. Roll to 2 mm between parchment, wrap and chill at least 1 hour. Line 6 cm tart moulds and bake at 165°C for 15 minutes until lightly golden."],
      },
      {
        name: "Chocolate Financier",
        ingredients: ["141 g Guanaja 70% dark couverture", "130 g heavy cream", "97 g egg whites", "48 g confectioners’ sugar", "38 g almond powder", "38 g flour", "4 g baking powder", "54 g butter"],
        steps: ["Sift sugar, almond, flour and baking powder. Add egg whites and mix on low for 2 minutes, then cream for 30 seconds. Melt chocolate and butter together at 45–50°C and add to the mixture. Spread on a half-sheet pan and bake at 170°C for 8–10 minutes. Freeze and cut 6 cm discs."],
      },
      {
        name: "Caraïbe Ganache",
        ingredients: ["320 g heavy cream, 35% fat", "300 g Caraïbe 66% dark couverture", "40 g glucose", "50 g invert sugar"],
        steps: ["Heat cream, glucose and invert sugar to 75–80°C. Combine half with the melted chocolate, then gradually add the rest and blend into an emulsion."],
      },
      {
        name: "Guanaja Chocolate Mousse",
        ingredients: ["200 g milk", "40 g invert sugar", "140 g egg yolks", "220 g Guanaja 70% dark chocolate", "220 g heavy cream, 35% fat, whipped to medium peaks"],
        steps: ["Bring milk to a simmer. Temper into invert sugar and yolks and cook to 82°C. Strain over the chocolate in three additions and emulsify. Cool to 40°C and fold in the semi-whipped cream. Fill 6 cm hemisphere moulds and freeze."],
      },
      {
        name: "Caraïbe Glaze Spray",
        ingredients: ["500 g Absolu Cristal neutral glaze", "50 g water", "100 g Caraïbe 66% dark couverture"],
        steps: ["Boil the neutral glaze and water. Pour slowly over the chocolate, blend and use at approximately 80°C."],
      },
    ],
  },
];
