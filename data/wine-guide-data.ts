export type WineSubregion = {
  name: string;
  grapes: string;
  note: string;
};

export type WineRegion = {
  id: string;
  name: string;
  coordinates: [number, number];
  climate: string;
  terrain: string;
  grapes: string[];
  styles: string[];
  note: string;
  subregions: WineSubregion[];
};

export type WineCountry = {
  iso: string;
  name: string;
  summary: string;
  climate: string;
  vineyardLens: string;
  regions: WineRegion[];
};

export type BurgundyPlot = {
  id: string;
  name: string;
  village: string;
  area: "Chablis" | "Côte de Nuits" | "Côte de Beaune" | "Côte Chalonnaise" | "Mâconnais";
  classification: string;
  grapes: string;
  colour: "red" | "white" | "mixed";
  soilAspect: string;
  style: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type BordeauxMapSite = {
  id: string;
  name: string;
  kind: "zone" | "estate";
  bank: "Left Bank" | "Right Bank" | "Between the rivers";
  appellation: string;
  classification: string;
  coordinates: [number, number];
  grapes: string;
  ground: string;
  style: string;
  radiusKm: number;
};

function subregion(name: string, grapes: string, note: string): WineSubregion {
  return { name, grapes, note };
}

function region(
  id: string,
  name: string,
  coordinates: [number, number],
  climate: string,
  terrain: string,
  grapes: string[],
  styles: string[],
  note: string,
  subregions: WineSubregion[],
): WineRegion {
  return { id, name, coordinates, climate, terrain, grapes, styles, note, subregions };
}

export const wineCountries: WineCountry[] = [
  {
    iso: "FRA",
    name: "France",
    summary: "France is useful because so much wine vocabulary was built around its places. Atlantic Bordeaux, continental Burgundy, cool Champagne and Mediterranean Provence can feel like different countries in the same bottle rack.",
    climate: "Atlantic influence in the west, continental conditions inland and Mediterranean heat in the south, with mountains and rivers creating many local exceptions.",
    vineyardLens: "French labels often lead with place rather than grape. Region, village and vineyard can therefore tell us more than the variety printed—or not printed—on the front.",
    regions: [
      region("fr-bordeaux", "Bordeaux", [-0.58, 44.84], "Moderate maritime; rain and humidity make vintage timing important.", "Gravel on the Left Bank; clay and limestone are especially important on the Right Bank.", ["Cabernet Sauvignon", "Merlot", "Cabernet Franc", "Sauvignon Blanc", "Sémillon"], ["structured red blends", "dry white", "botrytised sweet"], "The Gironde and its tributaries divide the region into banks with different soils and blending priorities.", [
        subregion("Médoc & Haut-Médoc", "Cabernet Sauvignon-led blends", "Well-drained gravel favours later-ripening Cabernet; Margaux, Pauillac, Saint-Julien and Saint-Estèphe each shift the balance."),
        subregion("Graves & Pessac-Léognan", "Cabernet Sauvignon, Merlot; Sauvignon Blanc, Sémillon", "Gravelly terraces produce both firm reds and barrel-shaped dry whites."),
        subregion("Saint-Émilion", "Merlot, Cabernet Franc", "Limestone plateau, clay slopes and sandier flats give very different expressions within one appellation."),
        subregion("Pomerol", "Merlot, Cabernet Franc", "Small, gently rolling vineyards; clay-rich sectors can make dense, plush and long-lived Merlot."),
        subregion("Sauternes & Barsac", "Sémillon, Sauvignon Blanc", "Morning mist and clearer afternoons can encourage noble rot while preserving enough acidity."),
      ]),
      region("fr-burgundy", "Burgundy", [4.84, 47.05], "Cool to moderate continental; spring frost, hail and rain around flowering or harvest can sharply reduce yields.", "A fractured limestone-and-marl slope where aspect, drainage and soil depth change over very short distances.", ["Pinot Noir", "Chardonnay", "Aligoté", "Gamay"], ["single-variety red", "single-variety white", "Crémant"], "Burgundy is a lesson in scale: regional wine, village wine, premier cru and grand cru can sit only a few metres apart. Open the climat map to inspect named plots.", [
        subregion("Chablis", "Chardonnay", "Kimmeridgian marl dominates the classic slopes; Petit Chablis is more often associated with higher Portlandian limestone."),
        subregion("Côte de Nuits", "Pinot Noir", "A narrow east-facing escarpment containing most of Burgundy’s red grands crus."),
        subregion("Côte de Beaune", "Pinot Noir, Chardonnay", "Red villages in the north give way to the celebrated white-wine slopes around Meursault, Puligny and Chassagne."),
        subregion("Côte Chalonnaise", "Pinot Noir, Chardonnay, Aligoté", "Bouzeron, Rully, Mercurey, Givry and Montagny each have a clear varietal emphasis."),
        subregion("Mâconnais", "Chardonnay, Gamay", "Warmer rolling limestone hills make generous Chardonnay, with the most focused wines around the southern limestone outcrops."),
      ]),
      region("fr-champagne", "Champagne", [4.0, 49.05], "Cool continental with Atlantic rain; marginal ripening preserves the acidity needed for sparkling wine.", "Chalk, limestone and marl store water while draining freely; exposure is important this far north.", ["Chardonnay", "Pinot Noir", "Meunier"], ["traditional-method sparkling"], "Blending across grapes, villages, years and reserve wines is as important as any single vineyard.", [
        subregion("Montagne de Reims", "Pinot Noir", "A wooded limestone plateau with villages on several exposures; Pinot Noir contributes structure."),
        subregion("Vallée de la Marne", "Meunier, Pinot Noir", "Frost-prone valleys and clay-rich soils suit earlier-budding, resilient Meunier."),
        subregion("Côte des Blancs", "Chardonnay", "East-facing chalk slopes make high-acid Chardonnay with a particularly linear frame."),
        subregion("Côte des Bar", "Pinot Noir", "Warmer, more southerly Kimmeridgian country; Pinot Noir dominates."),
      ]),
      region("fr-beaujolais", "Beaujolais", [4.7, 46.12], "Moderate continental, warmer than the Côte d’Or.", "Granite and schist in the hilly north; flatter clay-limestone soils farther south.", ["Gamay"], ["light to structured red", "rosé", "small amounts of white"], "Semi-carbonic and whole-bunch methods can emphasise perfume and fruit, but the crus are capable of savoury, ageworthy wine.", [
        subregion("Northern crus", "Gamay", "Saint-Amour through Moulin-à-Vent sit on varied granite, schist and manganese-rich soils."),
        subregion("Beaujolais-Villages", "Gamay", "Hilly northern and western communes generally give more concentration than the broad regional zone."),
        subregion("Southern Beaujolais", "Gamay", "Flatter, more fertile terrain is the centre of early-drinking regional wine."),
      ]),
      region("fr-alsace", "Alsace", [7.3, 48.2], "Sunny, dry continental conditions in the rain shadow of the Vosges.", "A geological patchwork of granite, limestone, sandstone, marl and volcanic material along foothill slopes.", ["Riesling", "Gewürztraminer", "Pinot Gris", "Muscat", "Pinot Blanc", "Pinot Noir"], ["dry aromatic white", "late-harvest sweet", "Crémant", "light red"], "The grape is usually named, but the best sites add a second layer of place through the grand cru system.", [
        subregion("Bas-Rhin", "Riesling, Pinot Blanc, Gewürztraminer", "The northern sector is slightly cooler, with sandstone, granite and marl sites."),
        subregion("Haut-Rhin", "Riesling, Gewürztraminer, Pinot Gris", "Sheltered central and southern slopes contain many of the celebrated grands crus."),
        subregion("Vosges foothills", "Site-dependent", "Aspect and geology change quickly where the plain meets the mountains."),
      ]),
      region("fr-loire", "Loire Valley", [0.7, 47.4], "Maritime in the west, increasingly continental inland.", "River terraces, tuffeau limestone, schist, flint and clay change repeatedly along the Loire.", ["Melon B", "Chenin Blanc", "Sauvignon Blanc", "Cabernet Franc", "Gamay"], ["dry white", "sweet white", "red", "rosé", "traditional-method sparkling"], "The river is the organising line, but Muscadet, Vouvray, Sancerre and Chinon belong to very different climates and grapes.", [
        subregion("Pays Nantais", "Melon B", "Muscadet’s Atlantic, schist-rich country makes light, high-acid whites often aged on lees."),
        subregion("Anjou-Saumur", "Chenin Blanc, Cabernet Franc", "Schist to the west and tuffeau limestone around Saumur support dry, sweet, red and sparkling styles."),
        subregion("Touraine", "Chenin Blanc, Cabernet Franc, Sauvignon Blanc", "Vouvray, Montlouis, Chinon and Bourgueil translate river exposure and limestone into contrasting wines."),
        subregion("Central Vineyards", "Sauvignon Blanc, Pinot Noir", "Sancerre and Pouilly-Fumé combine continental conditions with limestone, marl and flint."),
      ]),
      region("fr-northern-rhone", "Northern Rhône", [4.82, 45.25], "Moderate continental with strong sun on steep exposures and a cold mistral wind.", "Very steep granite slopes; terraces are often essential.", ["Syrah", "Viognier", "Marsanne", "Roussanne"], ["structured red", "aromatic white"], "The valley is narrow enough that vineyard aspect can determine whether grapes ripen fully.", [
        subregion("Côte-Rôtie", "Syrah, sometimes co-fermented Viognier", "Very steep, sun-catching slopes make perfumed yet structured Syrah."),
        subregion("Condrieu", "Viognier", "Tiny granite terraces produce full-bodied, low-acid, intensely aromatic white wine."),
        subregion("Hermitage", "Syrah; Marsanne, Roussanne", "A south-facing granite hill gives long-lived red and full-bodied white wines."),
        subregion("Crozes-Hermitage & Saint-Joseph", "Syrah; Marsanne, Roussanne", "Large, varied appellations ranging from flatter alluvium to steep granite."),
        subregion("Cornas", "Syrah", "Warm amphitheatre-like granite slopes make concentrated, firm red wine."),
      ]),
      region("fr-southern-rhone", "Southern Rhône", [4.83, 44.05], "Warm Mediterranean with drought, mistral and intense summer sun.", "Stony terraces, sand, clay and limestone; large rolled stones are only one of several important soil types.", ["Grenache", "Syrah", "Mourvèdre", "Cinsault", "Clairette", "Grenache Blanc"], ["red blend", "rosé", "white", "VDN"], "Blends balance Grenache’s alcohol and red fruit with the structure, colour, spice and freshness of partner varieties.", [
        subregion("Châteauneuf-du-Pape", "Grenache-led field and cellar blends", "Terraces vary from galets roulés to sand and limestone; both red and white are made."),
        subregion("Gigondas & Vacqueyras", "Grenache, Syrah, Mourvèdre", "Higher limestone slopes around the Dentelles can retain freshness."),
        subregion("Tavel & Lirac", "Grenache, Cinsault and partners", "Tavel is devoted to substantial rosé; neighbouring Lirac makes all three colours."),
        subregion("Beaumes-de-Venise & Rasteau", "Muscat; Grenache", "These villages also make sweet fortified vins doux naturels."),
      ]),
      region("fr-provence", "Provence", [5.75, 43.45], "Sunny Mediterranean, moderated locally by altitude, sea breezes and the mistral.", "Limestone, schist and crystalline coastal massifs create a broken landscape.", ["Grenache", "Cinsault", "Mourvèdre", "Syrah", "Tibouren", "Rolle"], ["pale dry rosé", "structured red", "white"], "Rosé dominates volume, but Bandol’s Mourvèdre and the coastal white grapes show a much broader region.", [
        subregion("Côtes de Provence", "Grenache, Cinsault, Syrah, Rolle", "A large, geographically fragmented appellation and the centre of pale dry rosé."),
        subregion("Bandol", "Mourvèdre", "Warm, terraced limestone slopes near the sea can ripen late Mourvèdre for powerful red."),
        subregion("Cassis", "Marsanne, Clairette and local whites", "A small limestone amphitheatre near the sea known mainly for white wine."),
      ]),
      region("fr-languedoc-roussillon", "Languedoc-Roussillon", [3.0, 43.3], "Warm, dry Mediterranean; elevation and distance from the sea are the main cooling levers.", "Coastal plains rise into limestone, schist and mountain foothills.", ["Grenache", "Syrah", "Mourvèdre", "Carignan", "Cinsault", "Picpoul", "Muscat"], ["red blend", "rosé", "white", "sparkling", "VDN"], "This huge southern arc contains inexpensive regional wine, old-vine mountain plots and several historically distinct sweet and sparkling traditions.", [
        subregion("Pic Saint-Loup & Terrasses du Larzac", "Syrah, Grenache, Mourvèdre", "Altitude and night-time cooling sharpen southern red blends."),
        subregion("Corbières & Minervois", "Carignan, Grenache, Syrah, Mourvèdre", "Large, rugged appellations with old vines and varied limestone and schist."),
        subregion("Limoux", "Mauzac, Chardonnay, Chenin Blanc", "A cooler western pocket with long-established sparkling wine."),
        subregion("Banyuls & Maury", "Grenache", "Steep schist terraces produce both dry reds and oxidative or youthful VDN."),
        subregion("Rivesaltes & Muscats", "Grenache, Muscat", "The plain and foothills around Perpignan support several fortified styles."),
      ]),
      region("fr-southwest", "South West France", [0.5, 44.0], "Mostly maritime, becoming warmer and drier inland.", "River terraces, limestone plateaux and Pyrenean foothills.", ["Malbec", "Tannat", "Négrette", "Manseng", "Colombard"], ["structured red", "aromatic white", "sweet white"], "Local varieties keep the region from becoming a simple extension of Bordeaux.", [
        subregion("Cahors", "Malbec", "Limestone causse and river terraces produce dark, firm Malbec."),
        subregion("Madiran", "Tannat", "Warm inland slopes make deeply coloured, high-tannin reds."),
        subregion("Jurançon", "Petit Manseng, Gros Manseng", "Pyrenean foothills produce intensely aromatic dry and sweet whites."),
        subregion("Fronton & Gaillac", "Négrette; many local grapes", "Two varied zones preserving a broad collection of regional varieties."),
      ]),
      region("fr-jura", "Jura", [5.72, 46.72], "Cool continental with wet summers and cold winters.", "Folded limestone and marl foothills east of Burgundy.", ["Savagnin", "Chardonnay", "Poulsard", "Trousseau", "Pinot Noir"], ["ouillé white", "oxidative vin jaune", "red", "sparkling", "vin de paille"], "The same grapes can be kept topped up for freshness or deliberately aged under a yeast veil for nutty, oxidative complexity.", [
        subregion("Arbois", "All five principal grapes", "The largest and most varied appellation, especially strong in red and oxidative styles."),
        subregion("Château-Chalon", "Savagnin", "A tiny appellation devoted to long-aged vin jaune."),
        subregion("L’Étoile & Côtes du Jura", "Chardonnay, Savagnin", "Limestone and marl sites for still, oxidative and sparkling whites."),
      ]),
    ],
  },
  {
    iso: "ITA",
    name: "Italy",
    summary: "Italy’s long peninsula, mountains and islands preserve an enormous number of local grapes. The useful question is rarely just north or south; altitude, sea, volcanic soils and individual valleys matter more.",
    climate: "Alpine and continental in the north, Mediterranean farther south, but the Apennines supply elevation through most of the country.",
    vineyardLens: "Many Italian wines are built around a local grape-place pairing: Nebbiolo in Barolo, Sangiovese in Chianti Classico or Carricante on Etna.",
    regions: [
      region("it-alto-adige", "Alto Adige", [11.35, 46.5], "Alpine but unusually sunny, with large day–night swings.", "High valley slopes with limestone, porphyry and glacial deposits.", ["Pinot Grigio", "Gewürztraminer", "Schiava", "Lagrein", "Pinot Noir"], ["aromatic white", "light to firm red"], "Elevation and exposure let warm-valley and cool-mountain grapes coexist.", [
        subregion("Bolzano basin", "Schiava, Lagrein", "Warm, sheltered sites favour indigenous red grapes."),
        subregion("Oltradige & Bassa Atesina", "Pinot Grigio, Gewürztraminer, Pinot Noir", "A complex ladder of exposures and elevations."),
        subregion("Valle Isarco", "Sylvaner, Kerner, Riesling", "The cooler northern valley specialises in high-acid aromatic whites."),
      ]),
      region("it-trentino", "Trentino", [11.12, 46.08], "Warm valley floors moderated by Alpine altitude.", "Alluvial Adige valley and limestone-dolomite slopes.", ["Chardonnay", "Pinot Grigio", "Teroldego", "Marzemino"], ["still white", "red", "traditional-method sparkling"], "Chardonnay and Pinot Noir from high sites underpin Trentodoc; Teroldego belongs to the warmer Campo Rotaliano.", [
        subregion("Trento high slopes", "Chardonnay, Pinot Noir", "Cool sites supply acid for traditional-method sparkling wine."),
        subregion("Campo Rotaliano", "Teroldego", "A warm, stony alluvial plain makes deeply coloured red."),
      ]),
      region("it-friuli", "Friuli-Venezia Giulia", [13.2, 46.0], "Warm days with cooling Alpine and Adriatic influences; rain can be substantial.", "Marl-and-sandstone ponca hills and gravelly plains.", ["Friulano", "Ribolla Gialla", "Sauvignon Blanc", "Pinot Grigio", "Merlot"], ["dry white", "skin-contact amber", "red"], "Long skin contact in some cellars sits beside precise, protected modern white-wine making.", [
        subregion("Collio", "Friulano, Ribolla Gialla, Sauvignon Blanc", "Ponca slopes against Slovenia make textured, aromatic whites."),
        subregion("Colli Orientali", "Friulano, Ribolla Gialla, local reds", "Hills east of Udine include dry and sweet styles."),
        subregion("Carso", "Vitovska, Malvasia Istriana", "A limestone plateau exposed to the bora wind."),
      ]),
      region("it-veneto", "Veneto", [11.0, 45.55], "From cool Alpine foothills to warm plains around Verona and Venice.", "Volcanic and limestone hills rise above fertile alluvial plains.", ["Glera", "Garganega", "Corvina", "Rondinella", "Molinara"], ["sparkling", "dry white", "red", "passito"], "The region contains both high-volume plains and sharply defined hill zones.", [
        subregion("Valdobbiadene & Asolo", "Glera", "Steep pre-Alpine hills give the most site-specific Prosecco."),
        subregion("Soave", "Garganega", "Volcanic and limestone hills make dry whites with more texture than the plain."),
        subregion("Valpolicella", "Corvina, Corvinone, Rondinella", "Fresh red, ripasso, dried-grape Amarone and sweet Recioto begin with related blends."),
        subregion("Bardolino", "Corvina-led blends", "Lake Garda moderates a zone known for lighter red and rosé."),
      ]),
      region("it-piedmont", "Piemonte", [8.0, 44.7], "Continental, with fog, hail risk and long autumns in the Langhe.", "Calcareous marl hills, sandier zones and Alpine foothills.", ["Nebbiolo", "Barbera", "Dolcetto", "Moscato Bianco", "Cortese", "Arneis"], ["long-lived red", "fruity red", "sparkling sweet", "dry white"], "Nebbiolo changes noticeably with slope, exposure and marl type; Barbera and Dolcetto fill different structural roles.", [
        subregion("Barolo", "Nebbiolo", "Communes and individual crus divide firmer sandstone-derived and more perfumed marl expressions."),
        subregion("Barbaresco", "Nebbiolo", "Slightly lower, warmer hills generally ripen earlier than Barolo."),
        subregion("Asti & Alba", "Barbera, Dolcetto, Moscato Bianco", "A large mixed zone for reds and fragrant tank-fermented sparkling wine."),
        subregion("Gavi", "Cortese", "Southeastern hills with maritime influence produce high-acid dry white."),
        subregion("Roero", "Arneis, Nebbiolo", "Sandier soils across the Tanaro support aromatic white and perfumed red."),
      ]),
      region("it-lombardy", "Lombardy", [10.1, 45.5], "Continental, moderated locally by lakes or Alpine elevation.", "Glacial amphitheatres, lake moraines and steep mountain terraces.", ["Chardonnay", "Pinot Noir", "Nebbiolo", "Croatina"], ["traditional-method sparkling", "mountain red", "still wine"], "Franciacorta and Valtellina show two extremes: morainic sparkling-wine country and heroic Alpine terraces.", [
        subregion("Franciacorta", "Chardonnay, Pinot Noir, Pinot Blanc", "Glacial soils south of Lake Iseo for traditional-method sparkling."),
        subregion("Valtellina", "Nebbiolo (Chiavennasca)", "Very steep, south-facing dry-stone terraces high in the Alps."),
        subregion("Oltrepò Pavese", "Pinot Noir, Croatina", "Rolling southern hills make sparkling and still reds."),
      ]),
      region("it-liguria", "Liguria", [8.5, 44.1], "Mild maritime, but windy and dry on exposed terraces.", "Extremely steep coastal slopes over schist and sandstone.", ["Vermentino", "Pigato", "Rossese"], ["saline dry white", "light red"], "Tiny hand-worked terraces make this one of Italy’s clearest examples of landscape limiting scale.", [
        subregion("Riviera Ligure di Ponente", "Pigato, Vermentino, Rossese", "Western terraces for aromatic whites and pale reds."),
        subregion("Cinque Terre", "Bosco, Albarola, Vermentino", "Sea-facing terraces make dry whites and the rare dried-grape Sciacchetrà."),
      ]),
      region("it-emilia-romagna", "Emilia-Romagna", [11.0, 44.5], "Warm continental plains with cooler Apennine foothills.", "Fertile Po plain and clay-limestone hills.", ["Lambrusco families", "Sangiovese", "Albana", "Pignoletto"], ["frizzante red", "sparkling", "red", "white"], "Lambrusco is a family of grapes and wines, not one sweet industrial style.", [
        subregion("Modena & Reggio Emilia", "Lambrusco di Sorbara, Salamino, Grasparossa", "Different Lambrusco grapes range from pale and floral to dark and tannic."),
        subregion("Romagna hills", "Sangiovese, Albana", "Apennine foothills produce still red, dry white and sweet passito."),
      ]),
      region("it-tuscany", "Tuscany", [11.25, 43.1], "Warm Mediterranean moderated by hills, altitude and distance from the sea.", "Galestro, alberese limestone, clay and coastal sand across rolling terrain.", ["Sangiovese", "Cabernet Sauvignon", "Merlot", "Vernaccia"], ["savoury red", "international blend", "white", "Vin Santo"], "Sangiovese has many local names, but acidity, sour-cherry fruit and tannin remain the structural thread.", [
        subregion("Chianti Classico", "Sangiovese", "Higher hills between Florence and Siena; communes and geology create marked variation."),
        subregion("Brunello di Montalcino", "Sangiovese (Brunello)", "A warm, dry hill with varied exposures makes concentrated, ageworthy red."),
        subregion("Vino Nobile di Montepulciano", "Sangiovese (Prugnolo Gentile)", "Clay-sand hills east of Montalcino produce firm yet aromatic red."),
        subregion("Bolgheri & Maremma", "Cabernet Sauvignon, Merlot, Cabernet Franc, Vermentino", "Maritime coastal sites support Bordeaux grapes and Mediterranean whites."),
        subregion("San Gimignano", "Vernaccia", "A small hill zone for structured dry white."),
      ]),
      region("it-marche-abruzzo", "Marche & Abruzzo", [13.2, 43.0], "Adriatic warmth with strong cooling from the Apennines.", "Limestone-clay hills between mountains and sea.", ["Verdicchio", "Montepulciano", "Pecorino", "Trebbiano"], ["dry white", "red", "rosé"], "Altitude and sea breeze preserve acid in grapes that can otherwise become broad and ripe.", [
        subregion("Castelli di Jesi & Matelica", "Verdicchio", "Maritime and inland mountain basins give two distinct versions of the same grape."),
        subregion("Montepulciano d’Abruzzo", "Montepulciano", "A large red-wine zone with quality concentrated on well-exposed hills."),
        subregion("Cerasuolo d’Abruzzo", "Montepulciano", "Deeply coloured, full-flavoured rosé made from the local red grape."),
      ]),
      region("it-umbria-lazio", "Umbria & Lazio", [12.55, 42.5], "Warm inland Mediterranean with meaningful hill elevation.", "Volcanic soils around Lazio; clay and limestone through Umbria.", ["Sagrantino", "Sangiovese", "Grechetto", "Trebbiano"], ["tannic red", "red blend", "dry white"], "Landlocked Umbria tends towards structured reds; Lazio’s volcanic hills are more strongly associated with whites.", [
        subregion("Montefalco", "Sagrantino, Sangiovese", "Sagrantino gives extremely high tannin and benefits from careful ripening and ageing."),
        subregion("Orvieto", "Grechetto, Trebbiano", "A volcanic-tuff hill town surrounded by white-wine vineyards."),
        subregion("Frascati", "Malvasia, Trebbiano", "Volcanic hills south of Rome make fresh white blends."),
      ]),
      region("it-campania", "Campania", [14.85, 40.9], "Warm Mediterranean with high, cool inland zones.", "Volcanic soils around Vesuvius and limestone-clay in the Apennines.", ["Aglianico", "Fiano", "Greco", "Falanghina"], ["structured red", "textured white"], "Old varieties and elevation keep freshness in a region that can look very warm on a map.", [
        subregion("Taurasi", "Aglianico", "High inland hills ripen late, tannic Aglianico over a long season."),
        subregion("Fiano di Avellino", "Fiano", "Cool volcanic and clay-limestone sites make waxy, ageworthy white."),
        subregion("Greco di Tufo", "Greco", "Sulfur-rich volcanic and clay soils contribute to firm, phenolic white."),
        subregion("Vesuvius & coast", "Piedirosso, Falanghina", "Volcanic and maritime sites produce both colours."),
      ]),
      region("it-puglia-basilicata", "Puglia & Basilicata", [16.3, 40.6], "Hot, dry Mediterranean; altitude is crucial in Basilicata.", "Puglian plains and limestone contrast with Basilicata’s volcanic Vulture slopes.", ["Primitivo", "Negroamaro", "Nero di Troia", "Aglianico"], ["full red", "rosé"], "Heat gives generous fruit, while old vines, elevation and earlier picking can stop the wines becoming heavy.", [
        subregion("Manduria", "Primitivo", "Warm red soils and old bush vines make high-alcohol, richly fruited red."),
        subregion("Salice Salentino", "Negroamaro", "The Salento peninsula specialises in dark, bittersweet reds and rosato."),
        subregion("Castel del Monte", "Nero di Troia", "Higher limestone plateau in northern Puglia supports firmer reds."),
        subregion("Vulture", "Aglianico", "High volcanic slopes in Basilicata produce tense, tannic Aglianico."),
      ]),
      region("it-sicily", "Sicily", [14.1, 37.6], "Hot Mediterranean, but altitude, wind and sea make several cool pockets.", "Volcanic Etna, limestone southeast, clay interior and windswept western coast.", ["Nero d’Avola", "Nerello Mascalese", "Carricante", "Catarratto", "Grillo", "Frappato"], ["red", "white", "Marsala"], "Sicily is a continent in miniature: Etna’s high lava terraces have little in common with warm western Marsala.", [
        subregion("Etna", "Nerello Mascalese, Carricante", "High lava contrade wrap around the volcano with different elevations and exposures."),
        subregion("Vittoria", "Nero d’Avola, Frappato", "Cerasuolo di Vittoria blends structure with fragrant red fruit."),
        subregion("Noto & southeast", "Nero d’Avola, Moscato", "Warm limestone country near the grape’s historic heartland."),
        subregion("Marsala & west", "Grillo, Catarratto, Inzolia", "Dry, windy western vineyards supply fortified Marsala and modern dry whites."),
      ]),
      region("it-sardinia", "Sardinia", [9.0, 40.0], "Dry, windy Mediterranean with strong maritime exposure.", "Granite, sand, limestone and schist across an ancient island landscape.", ["Cannonau", "Vermentino", "Carignano"], ["red", "dry white"], "Old bush vines and wind reduce vigour; local names reveal long Mediterranean grape migrations.", [
        subregion("Gallura", "Vermentino", "Windy granitic northeast makes firm, saline white."),
        subregion("Sulcis", "Carignano", "Sandy southwest sites preserve old ungrafted vines."),
        subregion("Cannonau zones", "Cannonau (Grenache)", "Warm inland and eastern zones make red with Mediterranean herbs and alcohol."),
      ]),
    ],
  },
  {
    iso: "ESP",
    name: "Spain",
    summary: "Spain combines a high central plateau, Atlantic northwest, Mediterranean coast and mountain barriers. Tempranillo is important, but the country’s regional grapes are much more varied than one variety suggests.",
    climate: "Mostly warm and dry, with Atlantic Galicia and the cooler north-western coast as major exceptions; altitude cools much of the interior.",
    vineyardLens: "Old bush vines, low rainfall and large day–night ranges explain why very warm-looking regions can still produce balanced wine.",
    regions: [
      region("es-rioja", "Rioja", [-2.55, 42.45], "Warm continental moderated by Atlantic influence in the west and Mediterranean influence in the east.", "Ebro valley terraces with limestone-clay, iron-rich clay and alluvium.", ["Tempranillo", "Garnacha", "Graciano", "Mazuelo", "Viura"], ["red", "white", "rosado"], "Village and site are increasingly visible alongside the familiar ageing categories.", [
        subregion("Rioja Alta", "Tempranillo, Graciano", "Higher Atlantic-influenced vineyards give acid and perfume."),
        subregion("Rioja Alavesa", "Tempranillo", "Limestone-clay slopes below the Sierra Cantabria produce structured, aromatic reds."),
        subregion("Rioja Oriental", "Garnacha, Tempranillo", "Warmer, drier eastern vineyards give body and ripe fruit."),
      ]),
      region("es-ribera", "Ribera del Duero", [-3.7, 41.65], "Harsh continental climate at high altitude, with hot days, cold nights and frost risk.", "High limestone-clay plateau along the Duero.", ["Tempranillo", "Cabernet Sauvignon", "Merlot"], ["powerful red"], "Altitude preserves acidity and aromatic detail in deeply coloured Tempranillo.", [
        subregion("Western Ribera", "Tempranillo", "Generally lower and slightly warmer along the river."),
        subregion("Central & eastern plateau", "Tempranillo", "Higher, colder sites can give firmer structure and slower ripening."),
      ]),
      region("es-rueda-toro", "Rueda & Toro", [-5.0, 41.2], "Hot, dry continental with large diurnal range.", "Stony, sandy terraces on the high Duero plateau.", ["Verdejo", "Sauvignon Blanc", "Tempranillo"], ["aromatic white", "powerful red"], "Neighbouring regions use the same harsh plateau for very different grapes and styles.", [
        subregion("Rueda", "Verdejo", "Cool fermentation protects citrus, herb and stone-fruit aromas."),
        subregion("Toro", "Tempranillo (Tinta de Toro)", "Old bush vines on sandy, stony soils make concentrated red."),
      ]),
      region("es-rias-baixas", "Rías Baixas", [-8.7, 42.35], "Cool, wet Atlantic with mildew pressure.", "Granitic soils around drowned coastal inlets.", ["Albariño"], ["high-acid aromatic white"], "Pergola training improves air movement in one of Spain’s wettest wine regions.", [
        subregion("Val do Salnés", "Albariño", "Cool coastal granite gives the lightest, most saline styles."),
        subregion("Condado do Tea", "Albariño, Treixadura", "Warmer inland sites produce riper, fuller whites."),
        subregion("O Rosal", "Albariño, Loureiro, Caiño Blanco", "Coastal-southern blends can be particularly aromatic."),
      ]),
      region("es-ribeira-sacra", "Ribeira Sacra", [-7.5, 42.45], "Atlantic-continental transition with warm river gorges.", "Extremely steep slate and granite terraces above the Miño and Sil.", ["Mencía", "Godello"], ["fragrant red", "textured white"], "So-called heroic viticulture limits machinery and keeps individual slopes highly visible.", [
        subregion("Sil canyon", "Mencía, Godello", "Slate terraces collect heat but altitude and river air retain freshness."),
        subregion("Miño valley", "Mencía and local grapes", "More Atlantic humidity and granite influence."),
      ]),
      region("es-bierzo", "Bierzo", [-6.65, 42.6], "Transitional Atlantic and continental, sheltered by mountains.", "Slate, quartz and clay on basin slopes.", ["Mencía", "Godello"], ["red", "white"], "Old Mencía vines on high slopes can be perfumed rather than heavy.", [
        subregion("Valley floor", "Mencía", "Fertile sites tend towards earlier-drinking wine."),
        subregion("High parajes", "Mencía, Godello", "Slate slopes and old vines give lower yields and more definition."),
      ]),
      region("es-priorat-montsant", "Priorat & Montsant", [0.75, 41.15], "Hot, dry Mediterranean with cooler nights at elevation.", "Priorat’s fractured llicorella slate is encircled by Montsant’s varied limestone, clay and granite.", ["Garnacha", "Cariñena", "Syrah"], ["concentrated red"], "Old vines survive on steep, low-yielding slopes where water access is the central challenge.", [
        subregion("Priorat", "Garnacha, Cariñena", "Steep llicorella slopes make dense but mineral-framed reds."),
        subregion("Montsant", "Garnacha, Cariñena", "A horseshoe around Priorat with more varied soils and often softer styles."),
      ]),
      region("es-penedes-cava", "Penedès & Cava country", [1.7, 41.4], "Mediterranean, cooler with altitude toward the interior.", "Coastal and pre-littoral limestone-clay basins.", ["Xarel·lo", "Macabeo", "Parellada", "Chardonnay", "Garnacha"], ["traditional-method sparkling", "still white", "red"], "The three traditional Cava grapes contribute body, aroma and freshness in different proportions.", [
        subregion("Alt Penedès", "Xarel·lo, Parellada", "Higher vineyards retain acidity and include many quality sparkling sites."),
        subregion("Baix Penedès", "Xarel·lo, Macabeo", "Warmer lower slopes produce fuller base wine."),
        subregion("Conca del Riu Anoia", "Traditional local varieties", "A producer-led focus on long-aged, estate-grown sparkling wine."),
      ]),
      region("es-jerez", "Jerez", [-6.15, 36.7], "Hot, sunny Atlantic-influenced with humid poniente and dry levante winds.", "Bright, chalky albariza stores winter rain for the dry growing season.", ["Palomino", "Pedro Ximénez", "Moscatel"], ["Fino", "Manzanilla", "Amontillado", "Oloroso", "sweet Sherry"], "Fortification, flor, oxygen and the solera system matter more to final flavour than fresh grape aroma.", [
        subregion("Jerez de la Frontera", "Palomino", "Central ageing town with bodegas producing the full range of styles."),
        subregion("Sanlúcar de Barrameda", "Palomino", "Humid coastal cellars support especially active flor for Manzanilla."),
        subregion("El Puerto de Santa María", "Palomino", "The third point of the Sherry triangle, also maritime-influenced."),
      ]),
      region("es-levant", "Valencia, Alicante & Jumilla", [-0.8, 38.5], "Hot, dry Mediterranean; altitude moderates inland vineyards.", "Limestone plateaux, sandy soils and dry valleys.", ["Monastrell", "Bobal", "Moscatel"], ["full red", "rosado", "sweet fortified"], "Drought-resistant local grapes carry colour and tannin without heavy irrigation.", [
        subregion("Jumilla & Yecla", "Monastrell", "High, arid limestone plateaux preserve old bush vines."),
        subregion("Utiel-Requena", "Bobal", "Elevated inland vineyards make red, rosado and sparkling wine."),
        subregion("Alicante", "Monastrell, Moscatel", "Warm coastal and inland sites include sweet and fortified traditions."),
      ]),
    ],
  },
  {
    iso: "PRT",
    name: "Portugal",
    summary: "Portugal’s strength is its local grapes and field blends. Atlantic freshness, hot interior valleys and old mixed vineyards produce styles that cannot be reduced to Port alone.",
    climate: "Cool and wet on the north-west coast, increasingly hot and continental inland and toward the south.",
    vineyardLens: "Many Portuguese names describe grapes found nowhere else in significant quantity; old field blends can contain dozens growing together.",
    regions: [
      region("pt-vinho-verde", "Vinho Verde", [-8.35, 41.5], "Cool, rainy Atlantic.", "Granite hills and river valleys with vigorous vegetation.", ["Alvarinho", "Loureiro", "Arinto", "Trajadura"], ["light white", "serious dry white", "rosé"], "The region is not one fizzy style: northern Monção e Melgaço produces concentrated Alvarinho.", [
        subregion("Monção e Melgaço", "Alvarinho", "Sheltered, slightly warmer granite valley for ripe, structured white."),
        subregion("Lima", "Loureiro", "Cool Atlantic valley strongly associated with floral Loureiro."),
        subregion("Basto, Cávado & Ave", "Arinto, Loureiro, blends", "Wet central subregions favour high-acid white blends."),
      ]),
      region("pt-douro", "Douro", [-7.55, 41.15], "Hot, dry continental valley sheltered from Atlantic rain.", "Steep schist slopes along the Douro and tributaries; elevation and aspect are decisive.", ["Touriga Nacional", "Touriga Franca", "Tinta Roriz", "Tinta Barroca", "Tinto Cão"], ["Port", "dry red", "dry white"], "The same old vineyards may supply either fortified or dry wine; rapid extraction is crucial when Port fermentation lasts only a day or two.", [
        subregion("Baixo Corgo", "Mixed Port varieties", "Cooler and wetter western sector, historically higher yielding."),
        subregion("Cima Corgo", "Touriga Nacional, Touriga Franca and field blends", "The heart of many top Port quintas."),
        subregion("Douro Superior", "Touriga Nacional and heat-tolerant varieties", "Hottest, driest eastern sector with expanding vineyard area."),
      ]),
      region("pt-dao", "Dão", [-7.9, 40.55], "Continental but mountain-protected, with cold nights.", "High granite plateau encircled by mountains.", ["Touriga Nacional", "Alfrocheiro", "Jaen", "Encruzado"], ["fragrant red", "textured white"], "Granite, altitude and forested shelter can give lighter, fresher structure than the hot interior suggests.", [
        subregion("Serra da Estrela", "Touriga Nacional, Encruzado", "High, cool granite slopes."),
        subregion("Central plateau", "Field blends", "Mixed old vineyards balance fragrance, acid and tannin."),
      ]),
      region("pt-bairrada", "Bairrada", [-8.5, 40.4], "Moderate Atlantic with rain around harvest.", "Heavy clay-limestone barros and sandier coastal soils.", ["Baga", "Bical", "Maria Gomes"], ["tannic red", "traditional-method sparkling", "white"], "Late-ripening Baga needs crop and canopy control; its acid also suits rosé and sparkling base wine.", [
        subregion("Clay-limestone heartland", "Baga", "Firm soils and cool climate produce high-acid, high-tannin reds."),
        subregion("Coastal sands", "Baga, white grapes", "Lighter soils include old ungrafted vines and sparkling material."),
      ]),
      region("pt-lisboa", "Lisboa", [-9.15, 39.1], "Windy Atlantic, warmer inland.", "Rolling clay-limestone hills north of Lisbon.", ["Arinto", "Fernão Pires", "Touriga Nacional", "Castelão"], ["white", "red", "blends"], "Nine appellations sit inside a productive regional zone; wind and aspect are central.", [
        subregion("Bucelas", "Arinto", "Cool, chalky Atlantic valley for high-acid white."),
        subregion("Colares", "Ramisco, Malvasia", "Sandy coastal vineyards exposed to wind; old vines survive on their own roots."),
        subregion("Óbidos & Alenquer", "Arinto, Fernão Pires; red blends", "Cooler west and warmer inland hills support different styles."),
      ]),
      region("pt-setubal", "Setúbal Peninsula", [-8.8, 38.55], "Warm maritime Mediterranean.", "Limestone Serra da Arrábida and sandy plains.", ["Moscatel de Setúbal", "Castelão"], ["sweet fortified", "red"], "Fortified Muscat and old-vine Castelão occupy different soils within a compact peninsula.", [
        subregion("Serra da Arrábida", "Moscatel de Setúbal", "Limestone slopes for intensely aromatic fortified wine."),
        subregion("Palmela", "Castelão", "Warm sandy plains produce savoury red from old vines."),
      ]),
      region("pt-tejo", "Tejo", [-8.55, 39.2], "Warm inland with Atlantic influence along the river.", "Fertile river plain, sandy charneca and limestone bairro.", ["Fernão Pires", "Castelão", "Touriga Nacional", "Trincadeira"], ["white", "red"], "The three landscape zones matter more than the broad regional name.", [
        subregion("Campo", "High-yield mixed grapes", "Fertile alluvium beside the Tagus."),
        subregion("Charneca", "Castelão, Trincadeira", "Drier sandy soils south and east of the river."),
        subregion("Bairro", "Arinto, Touriga Nacional", "Rolling limestone-clay hills north of the river."),
      ]),
      region("pt-alentejo", "Alentejo", [-7.7, 38.3], "Hot, dry Mediterranean with important altitude around Portalegre.", "Rolling plains over granite, schist, clay and limestone.", ["Aragonez", "Trincadeira", "Alicante Bouschet", "Antão Vaz"], ["full red", "ripe white", "talha wine"], "Heat encourages rich fruit; old clay amphora talha production provides a distinct local counterpoint.", [
        subregion("Portalegre", "Mixed old vines", "High granite slopes give the region’s coolest, most aromatic wines."),
        subregion("Évora & Redondo", "Aragonez, Trincadeira", "Warm central zones make generous reds."),
        subregion("Vidigueira", "Antão Vaz", "East–west fault and slope exposure support full but balanced white."),
      ]),
      region("pt-madeira", "Madeira", [-16.95, 32.75], "Subtropical maritime with high rainfall and dramatic altitude changes.", "Very steep volcanic slopes trained on terraces or pergola-like latadas.", ["Sercial", "Verdelho", "Boal", "Malvasia", "Terrantez", "Tinta Negra"], ["heated oxidative fortified"], "Heat and oxygen, normally treated as enemies, are deliberately used to make one of the world’s most stable wines.", [
        subregion("North coast & high sites", "Sercial, Verdelho", "Cooler, wetter vineyards suit higher-acid, drier styles."),
        subregion("South coast", "Boal, Malvasia, Tinta Negra", "Warmer slopes ripen grapes for richer styles."),
        subregion("Canteiro ageing lodges", "Any authorised variety", "Gentle attic heat over years gives more finesse than rapid estufagem."),
      ]),
    ],
  },
  {
    iso: "DEU",
    name: "Germany",
    summary: "Germany shows what rivers, slate, exposure and long daylight can do near the cool edge of grape growing. Riesling dominates the story, but Pinot varieties are increasingly important.",
    climate: "Cool continental to moderate, with Atlantic rain in the west; south-facing river slopes and climate warming improve ripeness.",
    vineyardLens: "Must-weight categories describe grape sugar at harvest, not the final wine’s sweetness. Site and producer choices still decide whether the wine finishes dry.",
    regions: [
      region("de-mosel", "Mosel", [6.75, 49.8], "Very cool continental; rivers and steep exposure help ripening.", "Extremely steep slate slopes above the Mosel, Saar and Ruwer.", ["Riesling"], ["dry to sweet white"], "Low-alcohol Riesling can carry intense flavour because acidity and residual sugar, not alcohol alone, provide structure.", [
        subregion("Middle Mosel", "Riesling", "Famous blue and grey slate meanders around Bernkastel, Wehlen and Piesport."),
        subregion("Saar", "Riesling", "Cool tributary valley known for piercing acidity and late ripening."),
        subregion("Ruwer", "Riesling", "Tiny, cool valley with delicate, herbal expressions."),
      ]),
      region("de-rheingau", "Rheingau", [8.0, 50.0], "Cool, protected by the Taunus; the Rhine reflects light onto south-facing slopes.", "Quartzite, slate, loess and clay along a compact east–west river bank.", ["Riesling", "Pinot Noir"], ["dry white", "sweet white", "red"], "The river’s unusual turn creates a long band of favourable southern exposure.", [
        subregion("Rüdesheim", "Riesling", "Steep slate and quartzite at the western end."),
        subregion("Central Rheingau", "Riesling", "Gentler south-facing slopes around the historic estates."),
        subregion("Assmannshausen", "Pinot Noir", "Steep red-slate site with a long red-wine tradition."),
      ]),
      region("de-rheinhessen", "Rheinhessen", [8.2, 49.8], "Moderate and relatively dry by German standards.", "Rolling loess and limestone hills; steep red-slate Rhine frontage.", ["Riesling", "Silvaner", "Pinot varieties"], ["dry white", "red"], "A very large region whose best-known modern wines come from limestone hills and the Roter Hang.", [
        subregion("Roter Hang", "Riesling", "Steep red-slate Rhine slopes around Nierstein."),
        subregion("Wonnegau", "Riesling, Pinot varieties", "Limestone around Westhofen gives concentrated dry whites."),
      ]),
      region("de-pfalz", "Pfalz", [8.05, 49.35], "Sunny, dry and relatively warm, sheltered by the Haardt mountains.", "Sandstone, basalt, limestone and loess along a north–south foothill strip.", ["Riesling", "Pinot Noir", "Pinot Gris", "Pinot Blanc"], ["dry white", "red"], "Warmer conditions favour powerful dry Riesling and increasingly serious Pinot Noir.", [
        subregion("Mittelhaardt", "Riesling", "Historic sandstone and basalt sites around Forst and Deidesheim."),
        subregion("Südliche Weinstrasse", "Pinot varieties, Riesling", "Warmer southern sector with more varied grapes."),
      ]),
      region("de-nahe", "Nahe", [7.7, 49.85], "Cool to moderate, protected in parts by surrounding hills.", "An unusually dense mix of volcanic rock, slate, sandstone and quartzite.", ["Riesling"], ["dry to sweet white"], "Small distances can move Riesling from smoky volcanic soils to fine slate.", [
        subregion("Upper Nahe", "Riesling", "Steep volcanic and slate sites around Schlossböckelheim and Niederhausen."),
        subregion("Lower Nahe", "Riesling", "Gentler, warmer valleys toward Bingen."),
      ]),
      region("de-ahr", "Ahr", [7.1, 50.5], "Cool, sheltered river gorge.", "Steep slate and greywacke slopes.", ["Pinot Noir"], ["light to structured red"], "A tiny northerly region where heat-retaining slopes make Pinot Noir possible.", [
        subregion("Middle Ahr", "Pinot Noir", "Narrow gorge with the steepest slate vineyards."),
        subregion("Lower Ahr", "Pinot Noir", "Broader valley with loess and volcanic material."),
      ]),
      region("de-baden", "Baden", [8.3, 48.0], "Germany’s warmest broad region, stretched along the Rhine and Black Forest.", "Volcanic Kaiserstuhl, limestone, loess and mountain foothills.", ["Pinot Noir", "Pinot Gris", "Pinot Blanc", "Chasselas"], ["red", "full dry white"], "Its great length means Kaiserstuhl and Lake Constance should not be treated as one climate.", [
        subregion("Kaiserstuhl", "Pinot Noir, Pinot Gris", "Warm volcanic massif with deep loess."),
        subregion("Markgräflerland", "Chasselas (Gutedel)", "Southern foothills near Switzerland."),
        subregion("Bodensee", "Pinot Noir, Müller-Thurgau", "Cool lakeside vineyards at higher elevation."),
      ]),
      region("de-franken", "Franken", [10.1, 49.8], "Continental with cold winters and dry summers.", "Triassic limestone, gypsum marl and sandstone around the Main.", ["Silvaner", "Riesling"], ["dry white"], "Silvaner’s relatively quiet aroma makes soil and texture especially visible.", [
        subregion("Maindreieck", "Silvaner", "Limestone slopes around Würzburg."),
        subregion("Steigerwald", "Silvaner", "Gypsum-rich marl farther east."),
      ]),
    ],
  },
  {
    iso: "AUT",
    name: "Austria",
    summary: "Austria’s eastern vineyards sit where cool continental air meets warmer Pannonian influence. Grüner Veltliner and Riesling rule the Danube; indigenous reds and botrytised sweets gather farther east.",
    climate: "Cool to moderate continental, with warm dry air from the east and cooling from altitude, forests and the Danube.",
    vineyardLens: "The Wachau’s stone terraces, Weinviertel’s loess and Burgenland’s shallow lakes produce distinct structures even when the country looks compact.",
    regions: [
      region("at-wachau", "Wachau", [15.42, 48.38], "Cool continental with large diurnal shifts along the Danube.", "Steep primary-rock terraces with loess pockets.", ["Grüner Veltliner", "Riesling"], ["dry white"], "Terrace height and whether roots reach loess or gneiss strongly change body and ripening.", [
        subregion("Western Wachau", "Riesling, Grüner Veltliner", "Narrower, cooler valley around Spitz."),
        subregion("Eastern Wachau", "Grüner Veltliner, Riesling", "Warmer sites toward Dürnstein and Loiben."),
      ]),
      region("at-kremstal-kamptal", "Kremstal & Kamptal", [15.65, 48.48], "Warm Pannonian days meet cool northern air.", "Loess, gneiss and distinctive sandstone-conglomerate terraces.", ["Grüner Veltliner", "Riesling"], ["dry white"], "Loess tends to give rounder Grüner; rocky terraces focus Riesling.", [
        subregion("Krems & Stein", "Grüner Veltliner, Riesling", "Danube terraces continue the Wachau landscape."),
        subregion("Heiligenstein", "Riesling", "Permian sandstone and volcanic material form a celebrated warm slope."),
        subregion("Loess terraces", "Grüner Veltliner", "Deep windblown soils retain water and support fuller wine."),
      ]),
      region("at-weinviertel", "Weinviertel", [16.4, 48.6], "Dry continental, warm toward the east.", "Rolling loess and limestone plains.", ["Grüner Veltliner"], ["peppery dry white"], "Austria’s largest region made Grüner Veltliner the country’s first DAC identity.", [
        subregion("Western Weinviertel", "Grüner Veltliner", "Cooler rolling loess and primary rock."),
        subregion("Eastern Weinviertel", "Grüner Veltliner, Zweigelt", "Warmer Pannonian conditions."),
      ]),
      region("at-thermenregion", "Thermenregion", [16.25, 48.0], "Warm, dry edge of the Vienna basin.", "Limestone, clay and gravel below the Vienna Woods.", ["Zierfandler", "Rotgipfler", "Pinot Noir", "Sankt Laurent"], ["textured white", "red"], "Rare local white grapes survive beside Burgundian and Austrian reds.", [
        subregion("Gumpoldskirchen", "Zierfandler, Rotgipfler", "Warm limestone slopes for full, spicy white blends."),
        subregion("Tattendorf", "Pinot Noir, Sankt Laurent", "Cool gravelly plain for red grapes."),
      ]),
      region("at-burgenland", "Burgenland", [16.75, 47.8], "Warm Pannonian, moderated by shallow Lake Neusiedl.", "Clay, gravel, limestone and schist around the lake and hills.", ["Blaufränkisch", "Zweigelt", "Furmint", "Welschriesling"], ["red", "botrytised sweet", "dry white"], "Humidity near the lake promotes noble rot; hills to the south give Blaufränkisch structure.", [
        subregion("Neusiedlersee", "Zweigelt, Welschriesling", "Warm east shore and lake humidity support reds and sweet wine."),
        subregion("Leithaberg", "Blaufränkisch, Pinot Blanc", "Limestone and schist hills west of the lake."),
        subregion("Mittelburgenland", "Blaufränkisch", "Warm clay basin strongly identified with the grape."),
        subregion("Eisenberg", "Blaufränkisch", "Iron-rich schist slopes produce lighter, peppery reds."),
      ]),
      region("at-styria", "Styria", [15.55, 46.75], "Cool, wet and Alpine-influenced.", "Very steep opok marl, volcanic and schist hills near Slovenia.", ["Sauvignon Blanc", "Welschriesling", "Blaufränkisch"], ["aromatic dry white", "red"], "Steepness and rainfall make hand work common; Sauvignon can be both pungent and deeply mineral.", [
        subregion("Südsteiermark", "Sauvignon Blanc, Morillon", "Steep marl hills for the region’s most concentrated whites."),
        subregion("Vulkanland", "Sauvignon Blanc, Traminer", "Volcanic eastern hills."),
        subregion("Weststeiermark", "Blauer Wildbacher", "Home of high-acid Schilcher rosé."),
      ]),
    ],
  },
  {
    iso: "HUN",
    name: "Hungary",
    summary: "Hungary is much more than one sweet wine, but Tokaj is the clearest lesson in how volcanic slopes, autumn humidity, noble rot and a cellar tradition can combine.",
    climate: "Continental, with hot summers and cold winters; lakes and rivers modify key regions.",
    vineyardLens: "Furmint’s high acid and susceptibility to botrytis let it carry both bone-dry and extremely sweet styles.",
    regions: [
      region("hu-tokaj", "Tokaj", [21.2, 48.15], "Continental; Tisza and Bodrog rivers encourage autumn mist followed by drying afternoons.", "Volcanic hills with tuff, rhyolite and clay.", ["Furmint", "Hárslevelű", "Sárga Muskotály"], ["dry white", "late-harvest", "botrytised Aszú", "Eszencia"], "Aszú berries are selected individually, then macerated in must or wine; sugar is balanced by Furmint’s forceful acidity.", [
        subregion("Mád", "Furmint, Hárslevelű", "Firm volcanic sites with many celebrated single vineyards."),
        subregion("Tarcal & Tokaj", "Furmint, Muscat", "South-facing volcanic slopes near the confluence of the rivers."),
        subregion("Sárospatak & Tolcsva", "Furmint, Hárslevelű", "Cooler northern/eastern cellars and mixed volcanic soils."),
      ]),
      region("hu-eger-balaton", "Eger & Balaton", [19.8, 47.2], "Continental, moderated around Lake Balaton.", "Volcanic hills, limestone and loess.", ["Kékfrankos", "Kadarka", "Olaszrizling", "Juhfark"], ["red blend", "dry white"], "Eger’s Bikavér and Balaton’s volcanic whites show the breadth beyond Tokaj.", [
        subregion("Eger", "Kékfrankos, Kadarka and blends", "Cool northern hills make spicy, acid-driven red blends."),
        subregion("Somló", "Juhfark, Furmint", "A tiny extinct volcano for smoky, high-acid white."),
        subregion("Balaton uplands", "Olaszrizling, Kéknyelű", "Lake-moderated volcanic and limestone slopes."),
      ]),
    ],
  },
  {
    iso: "GRC",
    name: "Greece",
    summary: "Greek wine is organised by mountains, islands, wind and drought-resistant local varieties. Santorini is dramatic, but the cool northern mainland is just as important.",
    climate: "Mostly Mediterranean, with altitude and northern latitude creating cool continental pockets.",
    vineyardLens: "Bush vines, wind-shaped baskets and high mountain vineyards are practical responses to heat, drought and exposure—not picturesque decoration.",
    regions: [
      region("gr-santorini", "Santorini", [25.43, 36.4], "Hot, dry, intensely windy maritime climate.", "Volcanic ash, pumice and lava with almost no clay.", ["Assyrtiko", "Aidani", "Athiri"], ["high-acid dry white", "sweet Vinsanto"], "Basket-trained kouloura vines shelter grapes from wind; old ungrafted roots survive in phylloxera-hostile volcanic soil.", [
        subregion("Caldera slopes", "Assyrtiko", "West-facing volcanic terraces give concentrated, saline dry white."),
        subregion("Lower island vineyards", "Assyrtiko, Aidani, Athiri", "Mixed sites supply blends and sun-dried Vinsanto."),
      ]),
      region("gr-naoussa-amyndeon", "Naoussa & Amyndeon", [22.05, 40.62], "Cool continental northern Greece; Amyndeon is higher and colder.", "Limestone-clay foothills and high sandy plateau.", ["Xinomavro"], ["tannic red", "rosé", "sparkling"], "Xinomavro combines high acid, tannin and pale colour; site and extraction decide whether it feels severe or fragrant.", [
        subregion("Naoussa", "Xinomavro", "Warm south-eastern Vermio slopes make structured red."),
        subregion("Amyndeon", "Xinomavro", "High plateau produces lighter red, rosé and sparkling wine."),
      ]),
      region("gr-nemea", "Nemea", [22.67, 37.82], "Warm Mediterranean, moderated in the highest valleys.", "Clay and limestone across three broad elevation bands.", ["Agiorgitiko"], ["soft to structured red", "rosé"], "Lower sites give ripe fruit; high Asprokampos retains acid and perfume.", [
        subregion("Valley floor", "Agiorgitiko", "Warm sites for soft, early-drinking red."),
        subregion("Mid-slopes", "Agiorgitiko", "Balanced ripeness and structure for many ageworthy wines."),
        subregion("Asprokampos", "Agiorgitiko", "Cool high plateau for fresh red and rosé."),
      ]),
      region("gr-mantinia", "Mantinia", [22.4, 37.62], "Cool high-altitude Peloponnese plateau.", "Poor, well-drained clay and limestone around 600 metres or more.", ["Moschofilero"], ["aromatic white", "sparkling", "rosé"], "Late-ripening pink-skinned Moschofilero keeps high acidity and floral-citrus perfume.", [
        subregion("Mantinia plateau", "Moschofilero", "Cold nights extend the season and preserve aroma."),
      ]),
      region("gr-crete", "Crete", [25.1, 35.15], "Warm Mediterranean with cooling sea wind and high mountain sites.", "Limestone, clay and mountain valleys.", ["Vidiano", "Vilana", "Liatiko", "Kotsifali", "Mandilaria"], ["white", "red", "sweet"], "A revived collection of local varieties is replacing the assumption that island wine must be hot and heavy.", [
        subregion("Heraklion", "Kotsifali, Mandilaria, Vidiano", "Central valleys for both colours."),
        subregion("Sitia", "Liatiko, Vilana", "Drier eastern Crete includes old-vine red and sweet wine."),
        subregion("High mountain valleys", "Vidiano and local whites", "Elevation gives the freshest modern styles."),
      ]),
    ],
  },
  {
    iso: "USA",
    name: "United States",
    summary: "American wine spans foggy Pacific valleys, rain-shadowed plateaux, desert, mountains and humid eastern lakes. State names are much too broad to predict style.",
    climate: "Strongly varied: Mediterranean California, cool maritime Oregon, dry continental Washington and humid continental New York.",
    vineyardLens: "American Viticultural Areas define origin but usually do not prescribe grapes or methods, so the producer’s farming and cellar choices remain unusually visible.",
    regions: [
      region("us-napa", "Napa Valley", [-122.3, 38.5], "Warm Mediterranean with cool Pacific air entering from San Pablo Bay.", "Valley alluvium, volcanic mountain soils and many elevation bands.", ["Cabernet Sauvignon", "Merlot", "Chardonnay", "Sauvignon Blanc"], ["full red", "dry white"], "Temperature rises northward along the floor, while mountain vineyards trade cooler nights and drainage for exposure and lower yields.", [
        subregion("Carneros", "Chardonnay, Pinot Noir", "Bay fog and wind make the coolest southern sector."),
        subregion("Oakville & Rutherford", "Cabernet Sauvignon", "Central alluvial fans and benchlands are the valley’s Cabernet core."),
        subregion("Calistoga", "Cabernet Sauvignon, Zinfandel", "Warm northern basin with volcanic influence."),
        subregion("Howell, Spring & Diamond Mountains", "Cabernet Sauvignon", "High, well-drained sites give smaller berries and firm tannin."),
      ]),
      region("us-sonoma", "Sonoma County", [-122.85, 38.45], "Pacific maritime to warm inland; fog corridors are decisive.", "Coastal ridges, volcanic hills and alluvial valleys.", ["Pinot Noir", "Chardonnay", "Cabernet Sauvignon", "Zinfandel", "Syrah"], ["red", "white", "sparkling"], "The county’s AVAs differ more than the county name suggests.", [
        subregion("Russian River Valley", "Pinot Noir, Chardonnay", "Fog moving up the river cools a broad interior basin."),
        subregion("Sonoma Coast", "Pinot Noir, Chardonnay", "Exposed ridges and cold coastal air produce high-acid wine."),
        subregion("Alexander Valley", "Cabernet Sauvignon", "Warmer northern valley gives ripe, softer Cabernet."),
        subregion("Dry Creek Valley", "Zinfandel, Sauvignon Blanc", "Warm days and cooling evening air suit old-vine Zinfandel."),
      ]),
      region("us-central-coast", "Central Coast", [-121.25, 35.7], "Mediterranean, with cold Pacific wind entering east–west valleys.", "Marine sediment, limestone and fractured mountain soils.", ["Pinot Noir", "Chardonnay", "Syrah", "Cabernet Sauvignon"], ["red", "white"], "Valley orientation explains why very cool Pinot sites can sit near warm Cabernet country.", [
        subregion("Santa Cruz Mountains", "Pinot Noir, Chardonnay, Cabernet Sauvignon", "High fractured slopes above fog."),
        subregion("Santa Lucia Highlands", "Pinot Noir, Chardonnay", "Windy bench above the Salinas Valley."),
        subregion("Paso Robles", "Cabernet Sauvignon, Rhône grapes", "Warm interior days, cold nights and a major limestone-clay western sector."),
        subregion("Santa Barbara County", "Pinot Noir, Chardonnay, Syrah", "East–west valleys funnel ocean air far inland."),
      ]),
      region("us-sierra-lodi", "Sierra Foothills & Lodi", [-120.8, 38.1], "Hot Mediterranean with cooling delta air in Lodi and elevation in the Sierra.", "Deep sandy plains and granitic foothills.", ["Zinfandel", "Barbera", "Rhône varieties"], ["ripe red", "old-vine red"], "Old vines persist in sand and isolated foothill plots, often as mixed plantings.", [
        subregion("Lodi", "Zinfandel, mixed old vines", "Deep sand and delta breeze protect very old vines."),
        subregion("Amador & El Dorado", "Zinfandel, Barbera, Rhône grapes", "Elevation and granite give warmer grapes a fresher frame."),
      ]),
      region("us-willamette", "Willamette Valley", [-123.2, 45.2], "Cool maritime with dry summers and wet winters.", "Volcanic basalt, marine sediment and windblown loess across hill chains.", ["Pinot Noir", "Chardonnay", "Pinot Gris"], ["red", "white", "sparkling"], "Pinot Noir is the common language, but soil and wind exposure divide the valley’s nested AVAs.", [
        subregion("Dundee Hills", "Pinot Noir, Chardonnay", "Red volcanic Jory soils produce fragrant, fine-grained wines."),
        subregion("Yamhill-Carlton", "Pinot Noir", "Marine sediment tends toward darker fruit and firmer tannin."),
        subregion("Eola-Amity Hills", "Pinot Noir, Chardonnay", "Van Duzer corridor wind cools the slopes."),
        subregion("Chehalem Mountains", "Pinot Noir and white grapes", "High, geologically mixed ridges near Portland."),
      ]),
      region("us-columbia", "Columbia Valley", [-119.2, 46.3], "Dry continental in the Cascade rain shadow, with hot days and cold winters.", "Basalt bedrock under flood sediments, loess and windblown sand.", ["Cabernet Sauvignon", "Merlot", "Syrah", "Riesling"], ["red", "white"], "Irrigation is essential; latitude supplies long summer daylight while nights preserve acidity.", [
        subregion("Yakima Valley", "Cabernet Sauvignon, Syrah, Chardonnay", "A large varied valley containing several nested districts."),
        subregion("Walla Walla Valley", "Cabernet Sauvignon, Syrah", "Warm, dry cross-border valley with loess and cobblestone sites."),
        subregion("Red Mountain", "Cabernet Sauvignon", "Small, hot, windy south-west-facing slope known for firm tannin."),
        subregion("Ancient Lakes", "Riesling, Chardonnay", "Cool calcareous and basalt landscape near the Columbia River."),
      ]),
      region("us-new-york", "New York", [-76.9, 42.7], "Humid continental; large lakes moderate frost and extend autumn.", "Glacial shale, limestone, gravel and lake terraces.", ["Riesling", "Cabernet Franc", "Chardonnay", "Concord"], ["dry white", "red", "sparkling", "sweet"], "Lake effect makes vinifera possible in otherwise severe continental conditions.", [
        subregion("Finger Lakes", "Riesling, Cabernet Franc", "Deep narrow lakes reduce frost and support high-acid aromatic wine."),
        subregion("Long Island", "Merlot, Cabernet Franc, Chardonnay", "Maritime, sandy glacial forks east of New York City."),
        subregion("Hudson River", "Hybrid grapes, Cabernet Franc", "Historic, humid valley with mixed varieties."),
      ]),
      region("us-virginia-texas", "Virginia & Texas High Plains", [-87.0, 34.0], "Humid continental Virginia contrasts with dry, high Texas plains.", "Appalachian foothills versus flat, calcareous high plateau.", ["Cabernet Franc", "Petit Verdot", "Viognier", "Tempranillo", "Mourvèdre"], ["red", "white"], "Two emerging zones solve very different problems: Virginia manages summer rain; Texas manages heat, wind and spring frost.", [
        subregion("Monticello & Northern Virginia", "Cabernet Franc, Petit Verdot, Viognier", "Rolling foothills need airflow and disease control."),
        subregion("Texas High Plains", "Tempranillo, Rhône and Italian grapes", "High, dry plains supply most Texas fruit."),
      ]),
    ],
  },
  {
    iso: "CAN",
    name: "Canada",
    summary: "Canada’s wine regions are narrow climatic pockets near lakes or the Pacific. Winter cold is the defining risk, while the same cold enables reliable icewine.",
    climate: "Cool continental in Ontario, drier continental in interior British Columbia and maritime on the Pacific edge.",
    vineyardLens: "Water moderates temperature, but site selection and winter survival matter as much as summer heat accumulation.",
    regions: [
      region("ca-niagara", "Niagara Peninsula", [-79.25, 43.15], "Cool humid continental, moderated by Lake Ontario.", "Limestone-clay benchlands below the Niagara Escarpment.", ["Riesling", "Chardonnay", "Pinot Noir", "Cabernet Franc", "Vidal"], ["dry white", "red", "sparkling", "icewine"], "The escarpment traps lake air and creates narrow benches with distinct drainage and frost exposure.", [
        subregion("Niagara Escarpment benches", "Riesling, Chardonnay, Pinot Noir", "Limestone-derived soils and slope airflow favour classic vinifera."),
        subregion("Niagara-on-the-Lake", "Cabernet Franc, Vidal", "Warmer, flatter sites near the river and lake."),
      ]),
      region("ca-okanagan", "Okanagan Valley", [-119.45, 49.5], "Dry continental, ranging from cool north to semi-desert south.", "Glacial lakes, benches, sand and silt over varied bedrock.", ["Riesling", "Pinot Noir", "Chardonnay", "Merlot", "Syrah"], ["white", "red", "sparkling", "icewine"], "The long valley crosses enough latitude and terrain that no single signature grape fits all of it.", [
        subregion("Lake Country & Kelowna", "Riesling, Pinot Noir, Chardonnay", "Cool northern lake benches."),
        subregion("Naramata & Okanagan Falls", "Pinot Noir, Chardonnay, Merlot", "Mid-valley slopes with mixed exposures."),
        subregion("Oliver & Osoyoos", "Merlot, Cabernet Franc, Syrah", "Hot, dry southern benches near the US border."),
      ]),
      region("ca-nova-scotia", "Nova Scotia", [-64.25, 45.05], "Very cool maritime with frost and hurricane risk.", "Glacial soils around the Bay of Fundy.", ["L’Acadie Blanc", "Chardonnay", "Pinot Noir"], ["traditional-method sparkling", "high-acid white"], "Long daylight and cold conditions naturally favour sparkling base wine.", [
        subregion("Annapolis Valley", "L’Acadie Blanc, Chardonnay, Pinot Noir", "Bay-moderated slopes make most of the province’s wine."),
      ]),
    ],
  },
  {
    iso: "CHL",
    name: "Chile",
    summary: "Chile is a long climatic corridor between Pacific, Andes and desert. Cold ocean water, altitude and east–west position matter more than simple latitude.",
    climate: "Mediterranean in the centre, desert in the north and cool-wet in the far south; Humboldt Current and Andes create strong cooling.",
    vineyardLens: "A vineyard closer to the Andes can be cooler at night; one nearer the coast can be cooler by day. Both can share the same valley name.",
    regions: [
      region("cl-limari-elqui", "Elqui & Limarí", [-70.7, -30.0], "Arid, sunny north cooled by altitude or Pacific fog.", "Rocky desert, limestone pockets and river terraces.", ["Syrah", "Chardonnay", "Sauvignon Blanc", "Pedro Jiménez"], ["red", "white", "pisco base"], "Irrigation and water access are essential; Limarí’s coastal limestone is especially useful for Chardonnay.", [
        subregion("Elqui Andes", "Syrah", "High, clear desert sites produce peppery, concentrated red."),
        subregion("Limarí coast", "Chardonnay, Sauvignon Blanc", "Camanchaca fog and limestone preserve acidity."),
      ]),
      region("cl-aconcagua", "Aconcagua", [-71.1, -32.8], "Warm inland, sharply cooler near the Pacific.", "River terraces from high Andes to coastal granite.", ["Cabernet Sauvignon", "Syrah", "Sauvignon Blanc", "Pinot Noir"], ["red", "white"], "The Costa, Entre Cordilleras and Andes bands split one valley into distinct temperature regimes.", [
        subregion("Aconcagua Andes", "Cabernet Sauvignon, Syrah", "Warm days and cold nights on alluvial fans."),
        subregion("Aconcagua Costa", "Sauvignon Blanc, Pinot Noir, Chardonnay", "Cold Pacific air reaches coastal granite hills."),
      ]),
      region("cl-casablanca-san-antonio", "Casablanca & San Antonio", [-71.45, -33.55], "Cool maritime with morning fog and strong afternoon wind.", "Coastal granite and clay hills.", ["Sauvignon Blanc", "Chardonnay", "Pinot Noir", "Syrah"], ["white", "cool-climate red", "sparkling"], "These valleys established Chile’s modern cool-climate coastal identity.", [
        subregion("Casablanca", "Sauvignon Blanc, Chardonnay, Pinot Noir", "Broad foggy basin between Santiago and the coast."),
        subregion("Leyda", "Sauvignon Blanc, Pinot Noir", "A small, wind-exposed zone very close to the sea."),
        subregion("Lo Abarca", "Sauvignon Blanc, Pinot Noir", "Cool limestone-influenced pocket near Cartagena."),
      ]),
      region("cl-maipo", "Maipo", [-70.65, -33.6], "Warm Mediterranean with cooling altitude toward the Andes.", "Gravelly alluvial fans and river terraces.", ["Cabernet Sauvignon", "Carmenère", "Merlot"], ["structured red"], "Classic Cabernet comes from well-drained eastern piedmont rather than the warmer fertile western floor.", [
        subregion("Alto Maipo", "Cabernet Sauvignon", "High eastern alluvial fans produce minty, structured Cabernet."),
        subregion("Central & Pacific Maipo", "Carmenère, Merlot, Cabernet Sauvignon", "Warmer lower sites give riper, softer wine."),
      ]),
      region("cl-rapel", "Rapel: Cachapoal & Colchagua", [-71.1, -34.4], "Warm Mediterranean; coastal hills and Andes provide cooler pockets.", "Alluvial valley floors, granitic hills and mountain terraces.", ["Carmenère", "Cabernet Sauvignon", "Syrah", "Malbec"], ["full red"], "Carmenère needs a long season to lose green pyrazine character without losing freshness.", [
        subregion("Cachapoal Andes", "Carmenère, Cabernet Sauvignon", "Warm protected foothills and gravelly fans."),
        subregion("Colchagua valley floor", "Carmenère, Cabernet Sauvignon", "Ripe, generous reds from warm alluvium."),
        subregion("Apalta & coastal hills", "Carmenère, Syrah", "Granite slopes and afternoon shade give concentration with freshness."),
      ]),
      region("cl-curico-maule", "Curicó & Maule", [-71.5, -35.2], "Warm Mediterranean, cooler and wetter toward the south.", "Large alluvial valleys with dry-farmed granitic coastal hills.", ["Cabernet Sauvignon", "Carmenère", "País", "Carignan"], ["red", "white"], "Old dry-farmed bush vines in the Maule secano preserve varieties and farming systems outside the irrigated mainstream.", [
        subregion("Curicó", "Cabernet Sauvignon, Sauvignon Blanc", "Broad productive valley with many exposures."),
        subregion("Maule valley floor", "Cabernet Sauvignon, Carmenère", "Warm irrigated alluvial vineyards."),
        subregion("Maule secano", "País, Carignan, field blends", "Dry-farmed granite hills with many old vines."),
      ]),
      region("cl-itata-bio-bio", "Itata & Bío-Bío", [-72.3, -36.6], "Cooler, wetter Mediterranean-to-maritime south.", "Granitic coastal hills and river valleys.", ["País", "Cinsault", "Muscat of Alexandria", "Chardonnay", "Pinot Noir"], ["light red", "aromatic white", "sparkling"], "Old head-trained vines and revived local traditions sit beside newer cool-climate plantings.", [
        subregion("Itata dry-farmed hills", "Cinsault, País, Muscat", "Old bush vines on decomposed granite."),
        subregion("Bío-Bío & Malleco", "Chardonnay, Pinot Noir", "Cool, rainy southern edge for high-acid wine."),
      ]),
    ],
  },
  {
    iso: "ARG",
    name: "Argentina",
    summary: "Argentina is high-altitude desert viticulture. The Andes provide meltwater, cold nights and a ladder of elevations that can change style within the same valley.",
    climate: "Dry continental with intense sun; altitude cools the growing season and hail is a persistent threat.",
    vineyardLens: "Elevation is not automatically quality, but it alters UV exposure, night temperature, ripening speed and water availability.",
    regions: [
      region("ar-salta", "Salta", [-65.95, -25.5], "Very high, arid and intensely sunny.", "Rocky alluvial valleys from roughly 1,600 to over 3,000 metres.", ["Torrontés", "Malbec", "Cabernet Sauvignon"], ["aromatic white", "red"], "Cafayate’s high sunlight builds aroma and colour while cold nights preserve acidity.", [
        subregion("Cafayate", "Torrontés, Malbec", "The principal high valley, warm by day and cold at night."),
        subregion("Quebrada de Humahuaca", "Malbec and experimental varieties", "Extreme elevation farther north."),
      ]),
      region("ar-mendoza", "Mendoza", [-68.85, -33.0], "Arid continental; altitude and Andean air create large diurnal range.", "Alluvial fans of sand, silt, clay and stones below the Andes.", ["Malbec", "Cabernet Sauvignon", "Chardonnay", "Bonarda"], ["red", "white", "sparkling"], "Mendoza is several regions: warm eastern plains differ sharply from high Uco Valley and stony Luján.", [
        subregion("Luján de Cuyo", "Malbec, Cabernet Sauvignon", "Historic alluvial fans south of the city."),
        subregion("Maipú", "Malbec, Cabernet Sauvignon, Bonarda", "Warm traditional heartland with many old vines."),
        subregion("Uco Valley", "Malbec, Cabernet Franc, Chardonnay", "High southern subregions expose limestone-rich, rocky alluvium."),
        subregion("Eastern Mendoza", "Bonarda, Criolla, bulk varieties", "Lower, warmer and more productive plain."),
      ]),
      region("ar-uco", "Uco Valley", [-69.15, -33.6], "High, dry and cool at night, with frequent hail risk.", "Rocky alluvial fans, often with calcium-carbonate-coated stones.", ["Malbec", "Cabernet Franc", "Chardonnay", "Pinot Noir"], ["structured red", "high-acid white"], "The valley deserves its own close view because Gualtallary, Paraje Altamira and La Consulta have different soils and elevations.", [
        subregion("Gualtallary", "Malbec, Cabernet Franc, Chardonnay", "Very high, heterogeneous limestone-rich alluvial soils."),
        subregion("Los Chacayes", "Malbec, Rhône varieties", "Rocky western Tunuyán vineyards."),
        subregion("Paraje Altamira", "Malbec", "Stony, calcareous fan of the Tunuyán River."),
        subregion("La Consulta", "Malbec", "Slightly lower historic vineyards with sandy alluvium."),
      ]),
      region("ar-san-juan", "San Juan", [-68.5, -31.5], "Hotter and drier than Mendoza, cooled in high western valleys.", "Desert alluvium and mountain valleys.", ["Syrah", "Bonarda", "Torrontés"], ["ripe red", "white"], "Pedernal’s altitude and limestone offer a fresher counterpoint to the warm central valleys.", [
        subregion("Tulum Valley", "Syrah, Bonarda", "Warm, productive central basin."),
        subregion("Pedernal Valley", "Syrah, Malbec", "High limestone-rich western valley."),
      ]),
      region("ar-patagonia", "Patagonia", [-68.7, -39.2], "Cool, dry and very windy continental.", "River-irrigated desert terraces and newer high plateaux.", ["Pinot Noir", "Malbec", "Chardonnay", "Sémillon"], ["red", "white", "sparkling"], "Latitude, wind and cold nights give a lighter structure than northern Argentina.", [
        subregion("Río Negro", "Pinot Noir, Malbec, Sémillon", "Historic irrigated river valley with old vines."),
        subregion("Neuquén", "Pinot Noir, Malbec, Chardonnay", "Newer, windy plateau vineyards."),
        subregion("Chubut", "Pinot Noir, Chardonnay", "Extreme southern frontier focused on high acid."),
      ]),
    ],
  },
  {
    iso: "ZAF",
    name: "South Africa",
    summary: "The Cape’s wine regions cluster around mountains and two oceans. Cold Benguela water, the Cape Doctor wind and old decomposed granite or shale soils create much more variation than the word ‘sunny’ suggests.",
    climate: "Mediterranean with dry summers; Atlantic and False Bay cooling penetrates through mountain gaps.",
    vineyardLens: "Distance from water, elevation and whether a slope sees morning or afternoon sun can matter within a few kilometres.",
    regions: [
      region("za-stellenbosch", "Stellenbosch", [18.86, -33.93], "Warm Mediterranean, cooled in southern sectors by False Bay.", "Granite, shale and sandstone on mountain slopes and valley floors.", ["Cabernet Sauvignon", "Merlot", "Syrah", "Chenin Blanc"], ["structured red", "white"], "Mountain wards differ enough that Cabernet from Simonsberg and coastal Helderberg should not be treated as one style.", [
        subregion("Simonsberg-Stellenbosch", "Cabernet Sauvignon, Bordeaux varieties", "Warm granite and shale slopes for structured reds."),
        subregion("Helderberg", "Cabernet Sauvignon, Syrah", "Maritime south-facing slopes receive False Bay air."),
        subregion("Bottelary & Polkadraai", "Chenin Blanc, Syrah, Pinotage", "Rolling granite hills include many old vines."),
      ]),
      region("za-paarl", "Paarl", [18.96, -33.72], "Warm, dry inland Mediterranean.", "Granite outcrops and shale-clay valleys.", ["Shiraz", "Cabernet Sauvignon", "Chenin Blanc", "Pinotage"], ["red", "white"], "Warmth gives generous fruit; elevation and old vines retain definition.", [
        subregion("Paarl Mountain", "Shiraz, Cabernet Sauvignon", "Granite slopes around the town."),
        subregion("Voor Paardeberg", "Chenin Blanc, Rhône varieties", "Dry-farmed granite hills toward Swartland."),
      ]),
      region("za-swartland", "Swartland", [18.65, -33.35], "Hot, dry and windy Mediterranean.", "Granite around Paardeberg, shale toward the east and iron-rich soils.", ["Chenin Blanc", "Syrah", "Grenache", "Cinsault"], ["textured white", "red blend"], "Old dry-farmed bush vines and restrained cellar work drove the region’s modern reputation.", [
        subregion("Paardeberg", "Chenin Blanc, Grenache", "Decomposed granite gives low-vigour old-vine fruit."),
        subregion("Kasteelberg", "Syrah, Chenin Blanc", "Shale slopes near Riebeek."),
        subregion("Malmesbury plains", "Chenin Blanc, Cinsault", "Warm mixed soils with many old vineyards."),
      ]),
      region("za-constantia", "Constantia", [18.42, -34.02], "Cool maritime, exposed to Atlantic and False Bay winds.", "Weathered granite slopes on the Cape Peninsula.", ["Sauvignon Blanc", "Sémillon", "Muscat de Frontignan"], ["dry white", "sweet wine", "red"], "A historic tiny region whose cool slopes sit inside Cape Town.", [
        subregion("Upper Constantia", "Sauvignon Blanc, Sémillon, Muscat", "High, wet, wind-exposed granite slopes."),
      ]),
      region("za-walker-bay", "Walker Bay & Cape South Coast", [19.3, -34.4], "Cool maritime with strong wind and winter rain.", "Shale, clay and sandstone close to the Southern Ocean.", ["Pinot Noir", "Chardonnay", "Sauvignon Blanc"], ["cool-climate red", "white", "sparkling"], "Hemel-en-Aarde’s nested valleys shift from maritime to more inland conditions over a short distance.", [
        subregion("Hemel-en-Aarde Valley", "Pinot Noir, Chardonnay", "The lowest, most maritime section."),
        subregion("Upper Hemel-en-Aarde", "Pinot Noir, Chardonnay", "Higher clay and shale sites."),
        subregion("Elgin", "Sauvignon Blanc, Chardonnay, Pinot Noir", "Cool high basin with strong diurnal range."),
      ]),
      region("za-robertson-breede", "Robertson & Breede River", [19.9, -33.8], "Warm, dry inland, with cooling southeast wind.", "Limestone-rich valley floors and shale slopes.", ["Chardonnay", "Colombard", "Shiraz"], ["white", "red", "traditional-method sparkling"], "Limestone and reliable sun make Robertson a major base for Cap Classique.", [
        subregion("Robertson", "Chardonnay, Colombard, Shiraz", "Limestone pockets support white and sparkling wine."),
        subregion("Worcester", "Colombard, Chenin Blanc", "Large warm production zone around the Breede River."),
      ]),
      region("za-olifants", "Olifants River & Cederberg", [19.05, -32.1], "Hot and dry on the river, much cooler at high Cederberg elevation.", "River alluvium, sandstone mountains and sandy coastal areas.", ["Chenin Blanc", "Sauvignon Blanc", "Shiraz"], ["white", "red"], "This broad northern area includes both productive irrigated valley and isolated mountain vineyards.", [
        subregion("Olifants River", "Chenin Blanc, Colombard", "Warm irrigated valley with large production."),
        subregion("Cederberg", "Sauvignon Blanc, Shiraz", "Remote high sandstone vineyards with cold nights."),
      ]),
    ],
  },
  {
    iso: "AUS",
    name: "Australia",
    summary: "Australia’s wine map is a ring around a dry continent. Ocean influence, altitude and old soils create cool Pinot country, warm old-vine Shiraz and everything between.",
    climate: "Mostly warm and dry, but southern oceans, mountain ranges and latitude create important cool regions.",
    vineyardLens: "Shiraz can mean peppery, medium-bodied cool-climate red or dense Barossa wine; the regional name is essential.",
    regions: [
      region("au-hunter", "Hunter Valley", [151.1, -32.8], "Warm, humid and cloudy with harvest rain risk.", "Alluvial flats and red clay or limestone-influenced hills.", ["Sémillon", "Shiraz", "Chardonnay"], ["low-alcohol white", "medium-bodied red"], "Early-picked Hunter Sémillon starts neutral and light, then develops toast and honey without oak.", [
        subregion("Lower Hunter", "Sémillon, Shiraz", "Warm, humid historic core around Pokolbin."),
        subregion("Upper Hunter", "Chardonnay, mixed grapes", "Drier, higher interior section."),
      ]),
      region("au-barossa", "Barossa Valley & Eden Valley", [139.0, -34.55], "Warm Barossa floor; cooler, higher Eden Valley.", "Ancient mixed geology, loam and clay below rocky highlands.", ["Shiraz", "Grenache", "Mataro", "Riesling"], ["full red", "aromatic white"], "One regional name often joins two landscapes: dense old-vine Shiraz below and lime-scented Riesling above.", [
        subregion("Barossa Valley floor", "Shiraz, Grenache, Mataro", "Warm sites with some of the world’s oldest productive vines."),
        subregion("Eden Valley", "Riesling, Shiraz", "High, cooler slopes east of the Barossa."),
      ]),
      region("au-clare", "Clare Valley", [138.6, -33.9], "Warm continental days with cool nights from elevation.", "Broken limestone, slate and red loam valleys.", ["Riesling", "Shiraz", "Cabernet Sauvignon"], ["dry white", "red"], "Watervale limestone and Polish Hill slate give recognisably different Riesling structures.", [
        subregion("Watervale", "Riesling", "Limestone-rich soils for fragrant, approachable dry white."),
        subregion("Polish Hill River", "Riesling", "Slate and cooler conditions give tighter, longer-lived wine."),
      ]),
      region("au-mclaren", "McLaren Vale", [138.55, -35.22], "Warm Mediterranean, moderated by Gulf St Vincent.", "A geological mosaic of sand, clay, limestone and ancient rock.", ["Shiraz", "Grenache", "Mataro", "Fiano"], ["red", "Mediterranean white"], "Old Grenache and varied geology make the region much more than ripe Shiraz.", [
        subregion("Blewitt Springs", "Grenache, Shiraz", "Higher sandy sites give perfume and finer tannin."),
        subregion("Willunga & Sellicks", "Shiraz, Mataro", "Southern slopes receive stronger maritime influence."),
      ]),
      region("au-coonawarra", "Coonawarra", [140.83, -37.3], "Cool maritime, with frost risk.", "A narrow cigar of red terra rossa clay over limestone.", ["Cabernet Sauvignon", "Shiraz"], ["structured red"], "The famous soil strip is small; vineyards beyond it can carry the regional name but not the same profile.", [
        subregion("Terra rossa strip", "Cabernet Sauvignon", "Free-draining red clay over limestone makes minty, firm Cabernet."),
        subregion("Black and brown rendzina", "Shiraz, Cabernet Sauvignon", "Heavier surrounding soils give different vigour and structure."),
      ]),
      region("au-adelaide-hills", "Adelaide Hills", [138.85, -34.95], "Cool to moderate at elevation, with varied aspects.", "Folded sandstone, shale and loam ridges.", ["Chardonnay", "Pinot Noir", "Sauvignon Blanc", "Shiraz"], ["white", "cool red", "sparkling"], "Elevation and exposure separate sparkling base sites from warm pockets for Shiraz.", [
        subregion("Piccadilly Valley", "Chardonnay, Pinot Noir", "High, cool heartland for sparkling and still wine."),
        subregion("Lenswood", "Chardonnay, Pinot Noir, Sauvignon Blanc", "Cool elevated eastern slopes."),
      ]),
      region("au-yarra", "Yarra Valley", [145.4, -37.65], "Cool maritime to warmer inland, with rain during the growing season.", "Valley alluvium and higher grey loam over clay.", ["Pinot Noir", "Chardonnay", "Cabernet Sauvignon", "Syrah"], ["red", "white", "sparkling"], "The cool Upper Yarra and warmer valley floor make very different Pinot and Chardonnay.", [
        subregion("Upper Yarra", "Pinot Noir, Chardonnay", "High, cool red volcanic and grey soils."),
        subregion("Lower Yarra", "Cabernet Sauvignon, Chardonnay", "Warmer traditional vineyards near the valley floor."),
      ]),
      region("au-mornington", "Mornington Peninsula", [145.05, -38.35], "Cool, windy maritime with rain and variable seasons.", "Rolling volcanic and sedimentary soils between bays.", ["Pinot Noir", "Chardonnay"], ["red", "white"], "No vineyard is far from water, but aspect and wind exposure still create local differences.", [
        subregion("Red Hill & Main Ridge", "Pinot Noir, Chardonnay", "Higher, cooler volcanic centre."),
        subregion("Moorooduc", "Pinot Noir, Chardonnay", "Warmer northern end on sandy loam."),
      ]),
      region("au-tasmania", "Tasmania", [147.0, -42.0], "Cool maritime with long daylight and high wind.", "Dolerite, sandstone and river alluvium across separated valleys.", ["Pinot Noir", "Chardonnay", "Riesling"], ["traditional-method sparkling", "red", "white"], "The island’s best-known common feature is acid retention; north and south still differ markedly.", [
        subregion("Tamar & Pipers River", "Pinot Noir, Chardonnay", "Northern sectors with many sparkling vineyards."),
        subregion("Coal River & Derwent", "Pinot Noir, Chardonnay, Riesling", "Drier southern valleys around Hobart."),
        subregion("Huon Valley", "Pinot Noir, Chardonnay", "Cool, wet southern frontier."),
      ]),
      region("au-margaret-river", "Margaret River", [115.05, -33.8], "Moderate Mediterranean, strongly maritime.", "Ancient gravelly loam over granite and gneiss.", ["Cabernet Sauvignon", "Chardonnay", "Sauvignon Blanc", "Sémillon"], ["red", "white"], "A narrow coastal strip produces both refined Cabernet and powerful Chardonnay.", [
        subregion("Wilyabrup", "Cabernet Sauvignon, Chardonnay", "Warm central gravels for many benchmark reds."),
        subregion("Karridale", "Chardonnay, Sauvignon Blanc, Sémillon", "Cooler southern maritime sector."),
        subregion("Wallcliffe", "Cabernet Sauvignon, Chardonnay", "Coastal central-southern sites with strong wind influence."),
      ]),
      region("au-great-southern", "Great Southern", [117.6, -34.5], "Cool maritime to continental across a very large southern zone.", "Granite, gravel, loam and mountain slopes.", ["Riesling", "Shiraz", "Cabernet Sauvignon", "Pinot Noir"], ["white", "red"], "Subregions are essential: coastal Denmark and inland Frankland River do not share one climate.", [
        subregion("Frankland River", "Riesling, Shiraz, Cabernet Sauvignon", "Cool inland valley with gravelly soils."),
        subregion("Mount Barker", "Riesling, Shiraz", "Elevated continental centre."),
        subregion("Denmark", "Pinot Noir, Chardonnay", "Cool, wet maritime coast."),
      ]),
      region("au-rutherglen", "Rutherglen", [146.45, -36.05], "Warm continental with dry autumns.", "Alluvial loam and clay on gentle inland slopes.", ["Muscat à Petits Grains Rouge", "Muscadelle", "Durif"], ["sweet fortified", "full red"], "Late-harvest, partly shrivelled Muscat is fortified early, then concentrated through years in warm old barrels.", [
        subregion("Rutherglen plain", "Muscat, Muscadelle", "Warm vineyards and hot maturation warehouses build the classic fortified style."),
        subregion("Glenrowan", "Muscat, Durif", "Neighbouring inland zone with a related fortified tradition."),
      ]),
    ],
  },
  {
    iso: "NZL",
    name: "New Zealand",
    summary: "New Zealand is a long, maritime pair of islands with intense sunlight and cool nights. Sauvignon Blanc may be the calling card, but Pinot Noir, Chardonnay and Syrah reveal the regional detail.",
    climate: "Mostly cool maritime, with dry rain-shadowed eastern regions and warmer far north.",
    vineyardLens: "Mountain rain shadows make Marlborough and Central Otago far drier than the surrounding ocean might imply.",
    regions: [
      region("nz-auckland-northland", "Auckland & Northland", [174.4, -36.4], "Warm, humid maritime.", "Volcanic clay and coastal hills.", ["Chardonnay", "Syrah", "Cabernet blends"], ["red", "white"], "Humidity makes canopy airflow and disease control central; island and coastal sites can still give fine wine.", [
        subregion("Waiheke Island", "Syrah, Cabernet blends, Chardonnay", "Warm, windy island east of Auckland."),
        subregion("Kumeu", "Chardonnay", "Clay hills west of the city produce structured white."),
      ]),
      region("nz-gisborne", "Gisborne", [178.0, -38.65], "Sunny, warm maritime with harvest-rain risk.", "Fertile alluvial plains and surrounding hills.", ["Chardonnay", "Gewürztraminer", "Pinot Gris"], ["aromatic white"], "Early sunshine and fertile soils make generous whites; hills provide lower vigour.", [
        subregion("Poverty Bay flats", "Chardonnay, aromatic whites", "Warm productive alluvium."),
        subregion("Ormond & Patutahi hills", "Chardonnay", "Better-drained elevated sites."),
      ]),
      region("nz-hawkes-bay", "Hawke’s Bay", [176.8, -39.6], "Warm, sunny maritime with varied coastal and inland conditions.", "Gravel river terraces, clay hills and limestone coast.", ["Merlot", "Cabernet Sauvignon", "Syrah", "Chardonnay"], ["red", "white"], "The Gimblett Gravels’ stony heat and Te Mata’s hills support distinct red styles.", [
        subregion("Gimblett Gravels", "Syrah, Merlot, Cabernet Sauvignon", "Free-draining stony former riverbed warms quickly."),
        subregion("Bridge Pa Triangle", "Merlot, Syrah", "Red-metal and alluvial soils beside the gravels."),
        subregion("Te Mata & coastal hills", "Chardonnay, Syrah", "Limestone and clay slopes with maritime air."),
      ]),
      region("nz-wairarapa", "Wairarapa", [175.45, -41.1], "Cool, dry and windy in the Tararua rain shadow.", "Gravel terraces and clay-limestone hills.", ["Pinot Noir", "Sauvignon Blanc"], ["red", "white"], "Martinborough’s tiny terrace built an outsized Pinot Noir reputation.", [
        subregion("Martinborough Terrace", "Pinot Noir", "Windy gravel terrace with low rainfall and small yields."),
        subregion("Gladstone & Masterton", "Pinot Noir, Sauvignon Blanc", "Broader northern valley sites."),
      ]),
      region("nz-marlborough", "Marlborough", [173.85, -41.55], "Cool, very sunny and dry, with strong diurnal range.", "Alluvial river valleys and clay-rich southern hills.", ["Sauvignon Blanc", "Pinot Noir", "Chardonnay", "Riesling"], ["aromatic white", "red", "sparkling"], "Sauvignon differs across the broad Wairau floor, cooler Awatere and clay Southern Valleys.", [
        subregion("Wairau Valley", "Sauvignon Blanc", "Stony alluvial floor gives pungent, fruit-forward wine."),
        subregion("Awatere Valley", "Sauvignon Blanc, Pinot Noir", "Cooler, windier and drier with more herbal, saline styles."),
        subregion("Southern Valleys", "Pinot Noir, Sauvignon Blanc", "Clay-rich hills give more texture and red-wine potential."),
      ]),
      region("nz-nelson-canterbury", "Nelson & North Canterbury", [172.6, -42.2], "Sunny maritime Nelson; cooler dry Canterbury rain shadow.", "Clay-gravel hills, river terraces and limestone around Waipara.", ["Sauvignon Blanc", "Pinot Noir", "Riesling", "Chardonnay"], ["white", "red"], "Limestone and dry north-westerly winds distinguish North Canterbury from nearby Marlborough.", [
        subregion("Moutere Hills", "Pinot Noir, Chardonnay", "Clay-gravel hills west of Nelson."),
        subregion("Waipara Valley", "Pinot Noir, Riesling", "Dry basin with limestone-clay slopes."),
        subregion("Waikari", "Pinot Noir, Chardonnay", "High limestone country for taut, savoury wines."),
      ]),
      region("nz-central-otago", "Central Otago", [169.2, -45.0], "Cool, dry continental by New Zealand standards, with frost risk and intense sunlight.", "Glacial valleys, schist slopes and loess.", ["Pinot Noir", "Riesling", "Pinot Gris"], ["red", "white"], "Separate basins ripen differently; the regional name hides meaningful shifts in elevation and temperature.", [
        subregion("Bannockburn", "Pinot Noir", "Warm, dry schist terraces produce dark, structured wine."),
        subregion("Gibbston", "Pinot Noir", "Cool, high gorge gives lighter, perfumed styles."),
        subregion("Bendigo", "Pinot Noir", "Warm north-facing slopes and terraces."),
        subregion("Wanaka", "Pinot Noir, Riesling", "Cool, high northern edge near the lake."),
      ]),
    ],
  },
  {
    iso: "CHN",
    name: "China",
    summary: "China’s modern wine regions are widely separated experiments in dry continental farming, high-altitude sunlight and coastal humidity. Winter burial and irrigation can matter as much as grape choice.",
    climate: "From cold, arid continental north-west to humid maritime Shandong and high-altitude Yunnan.",
    vineyardLens: "Many northern vines must be buried for winter survival, adding cost and shaping trunk architecture.",
    regions: [
      region("cn-ningxia", "Ningxia", [106.0, 38.4], "Dry continental with hot summers, cold winters and large diurnal range.", "Gravelly alluvial fans below the Helan Mountains.", ["Cabernet Sauvignon", "Marselan", "Cabernet Gernischt"], ["structured red"], "Mountain shelter, irrigation from the Yellow River and winter vine burial define the region.", [
        subregion("Eastern Helan Mountain foothills", "Cabernet Sauvignon, Marselan", "A long strip of gravel fans divided into emerging subzones."),
      ]),
      region("cn-xinjiang", "Xinjiang", [86.0, 43.5], "Very dry continental with extreme winter cold.", "Desert oases and high mountain basins.", ["Cabernet Sauvignon", "Marselan", "Saperavi", "Riesling"], ["red", "white", "sweet"], "Sun and dryness reduce disease, while irrigation and winter protection are non-negotiable.", [
        subregion("Tianshan foothills", "Cabernet Sauvignon, Marselan", "Irrigated northern oases with strong diurnal range."),
        subregion("Turpan", "Table and wine grapes", "Extremely hot basin with a long grape-drying tradition."),
      ]),
      region("cn-shandong", "Shandong", [120.5, 37.3], "Humid maritime with monsoon rain near harvest.", "Coastal hills and mixed granite-clay soils.", ["Cabernet Sauvignon", "Cabernet Gernischt", "Chardonnay"], ["red", "white"], "The sea moderates winter but summer humidity makes disease and dilution major risks.", [
        subregion("Penglai", "Cabernet Sauvignon, Chardonnay", "Breezy peninsula vineyards near the Bohai Sea."),
        subregion("Yantai", "Cabernet Gernischt, Cabernet Sauvignon", "Historic centre of the modern Chinese industry."),
      ]),
      region("cn-yunnan", "Yunnan", [99.2, 28.0], "High-altitude continental-monsoon climate.", "Very steep dry valleys near the Himalayas and upper Mekong.", ["Cabernet Sauvignon", "Cabernet Franc", "local hybrids"], ["red"], "Extreme elevation and rain-shadowed valleys create intense UV, cool nights and difficult logistics.", [
        subregion("Shangri-La / Deqin", "Cabernet Sauvignon, Cabernet Franc", "Remote terraces around 2,000–2,800 metres."),
      ]),
      region("cn-hebei", "Hebei", [115.5, 40.2], "Continental with cold winters; coastal sectors are more moderate.", "Mountain foothills, loess and alluvial plains around Beijing.", ["Cabernet Sauvignon", "Marselan", "Chardonnay"], ["red", "white"], "Several separate zones supply the capital, from Huailai’s dry basin to coastal Qinhuangdao.", [
        subregion("Huailai", "Cabernet Sauvignon, Marselan", "Dry mountain basin north-west of Beijing."),
        subregion("Qinhuangdao", "Cabernet Sauvignon, Chardonnay", "More humid coast near Bohai Bay."),
      ]),
    ],
  },
  {
    iso: "GBR",
    name: "United Kingdom",
    summary: "English and Welsh wine is built around a warming but still marginal climate. Chalk continuations of the Paris Basin and long, cool seasons make traditional-method sparkling the clearest fit.",
    climate: "Cool maritime with frost, rain and highly variable seasons; the warmest, driest conditions are in the south-east.",
    vineyardLens: "Free drainage, slope, shelter and air movement matter because excess water and spring frost can erase the benefit of a warm summer.",
    regions: [
      region("gb-sussex", "Sussex", [-0.3, 50.92], "Cool maritime, relatively sunny and dry for Britain.", "South Downs chalk plus Wealden clay and greensand.", ["Chardonnay", "Pinot Noir", "Meunier"], ["traditional-method sparkling", "still wine"], "Chalk slopes echo Champagne geologically, but producer choices and the British climate create their own style.", [
        subregion("South Downs", "Chardonnay, Pinot Noir, Meunier", "Chalk escarpment with strong drainage and exposure."),
        subregion("Weald", "Pinot varieties", "Clay, sandstone and sheltered inland sites."),
      ]),
      region("gb-kent", "Kent", [0.7, 51.15], "Cool maritime with comparatively warm, dry summers.", "North Downs chalk and clay-sand Wealden hills.", ["Chardonnay", "Pinot Noir", "Meunier", "Bacchus"], ["traditional-method sparkling", "aromatic still white"], "Eastern sunshine and chalk attracted many large sparkling-wine plantings.", [
        subregion("North Downs", "Chardonnay, Pinot Noir, Meunier", "Chalk belt south-east of London."),
        subregion("High Weald", "Pinot varieties, Bacchus", "Rolling clay-sand terrain toward Sussex."),
      ]),
      region("gb-hampshire-surrey", "Hampshire & Surrey", [-1.0, 51.05], "Cool maritime with frost-prone valleys.", "Chalk downs and well-drained slopes.", ["Chardonnay", "Pinot Noir", "Meunier"], ["traditional-method sparkling"], "Some of England’s longest-established sparkling estates sit on this western chalk belt.", [
        subregion("Hampshire Downs", "Chardonnay, Pinot Noir, Meunier", "Rolling chalk vineyards around the Itchen and Test."),
        subregion("Surrey Hills", "Chardonnay, Pinot Noir", "Chalk continuation closer to London."),
      ]),
      region("gb-thames-east", "Thames & East Anglia", [0.5, 51.8], "Cool maritime; East Anglia is among Britain’s driest areas.", "Clay, gravel and chalky loam on low rolling land.", ["Bacchus", "Pinot Noir", "Chardonnay"], ["still white", "sparkling"], "Drier summers suit aromatic still wine as well as sparkling production.", [
        subregion("Essex", "Pinot Noir, Chardonnay, Bacchus", "Warm, dry eastern sites are increasingly important for still wine."),
        subregion("Thames & Chilterns", "Bacchus, Chardonnay", "Mixed gravel and chalk west of London."),
      ]),
      region("gb-wales-west", "Wales & the West", [-3.2, 51.65], "Cool, wetter maritime with sheltered local pockets.", "Limestone, sandstone and protected river or coastal slopes.", ["Pinot Noir", "Chardonnay", "Seyval Blanc", "Solaris"], ["sparkling", "still white"], "Small vineyards use shelter and disease-resistant hybrids to work beyond the south-east core.", [
        subregion("South Wales", "Pinot varieties, hybrids", "Sheltered Vale of Glamorgan and Wye Valley sites."),
        subregion("South West England", "Chardonnay, Pinot Noir, Bacchus", "Cornwall, Devon and Dorset mix maritime shelter with high rainfall."),
      ]),
    ],
  },
];

export const burgundyPlots: BurgundyPlot[] = [
  { id: "chablis-les-clos", name: "Les Clos", village: "Chablis", area: "Chablis", classification: "Grand Cru", grapes: "Chardonnay", colour: "white", soilAspect: "Steep south-west-facing Kimmeridgian marl above the Serein.", style: "Usually the broadest and most forceful Chablis grand cru, with enough structure for long ageing.", x: 336, y: 54, width: 96, height: 38 },
  { id: "chablis-vaudesir", name: "Vaudésir", village: "Chablis", area: "Chablis", classification: "Grand Cru", grapes: "Chardonnay", colour: "white", soilAspect: "A curved, sheltered Kimmeridgian amphitheatre with mixed exposures.", style: "Ripe and aromatic, often softer in outline than Les Clos.", x: 438, y: 60, width: 92, height: 34 },
  { id: "chablis-montee-tonnerre", name: "Montée de Tonnerre", village: "Chablis", area: "Chablis", classification: "Premier Cru", grapes: "Chardonnay", colour: "white", soilAspect: "Right-bank Kimmeridgian slope immediately beside the grand-cru hill.", style: "A particularly precise premier cru that can approach grand-cru depth.", x: 348, y: 99, width: 168, height: 30 },
  { id: "chambertin", name: "Chambertin", village: "Gevrey-Chambertin", area: "Côte de Nuits", classification: "Grand Cru", grapes: "Pinot Noir", colour: "red", soilAspect: "Mid-slope east-facing limestone and marl with balanced drainage.", style: "Dense, complete Pinot Noir whose tannin and savoury depth are built for ageing.", x: 346, y: 218, width: 114, height: 35 },
  { id: "clos-de-beze", name: "Chambertin-Clos de Bèze", village: "Gevrey-Chambertin", area: "Côte de Nuits", classification: "Grand Cru", grapes: "Pinot Noir", colour: "red", soilAspect: "A slightly higher, gently sloping neighbour to Chambertin.", style: "Power with more immediate perfume and lift than its neighbour in many vintages.", x: 466, y: 211, width: 146, height: 39 },
  { id: "clos-de-tart", name: "Clos de Tart", village: "Morey-Saint-Denis", area: "Côte de Nuits", classification: "Grand Cru", grapes: "Pinot Noir", colour: "red", soilAspect: "A walled monopole climbing a limestone-marl slope.", style: "Structured, dark-fruited and spicy, with marked variation from top to bottom.", x: 358, y: 270, width: 108, height: 34 },
  { id: "clos-de-la-roche", name: "Clos de la Roche", village: "Morey-Saint-Denis", area: "Côte de Nuits", classification: "Grand Cru", grapes: "Pinot Noir", colour: "red", soilAspect: "Rocky upper-slope limestone with shallow soils.", style: "Firm, mineral and long-lived Morey Pinot Noir.", x: 474, y: 263, width: 138, height: 40 },
  { id: "bonnes-mares", name: "Bonnes-Mares", village: "Chambolle-Musigny / Morey-Saint-Denis", area: "Côte de Nuits", classification: "Grand Cru", grapes: "Pinot Noir", colour: "red", soilAspect: "Redder clay and paler marl sectors cross a commune boundary.", style: "More muscular than the stereotype of Chambolle, but still highly aromatic.", x: 350, y: 320, width: 122, height: 36 },
  { id: "musigny", name: "Musigny", village: "Chambolle-Musigny", area: "Côte de Nuits", classification: "Grand Cru", grapes: "Pinot Noir; a tiny amount of Chardonnay is authorised", colour: "mixed", soilAspect: "Steep limestone slope above Clos de Vougeot with thin, stony soils.", style: "Silky, floral and intense Pinot Noir; rare white Musigny also exists.", x: 480, y: 314, width: 126, height: 40 },
  { id: "clos-vougeot", name: "Clos de Vougeot", village: "Vougeot", area: "Côte de Nuits", classification: "Grand Cru", grapes: "Pinot Noir", colour: "red", soilAspect: "A large walled vineyard running from shallow upper limestone to deeper lower clay.", style: "Producer and position inside the clos matter enormously because the plot is unusually large.", x: 358, y: 370, width: 248, height: 43 },
  { id: "romanee-conti", name: "Romanée-Conti", village: "Vosne-Romanée", area: "Côte de Nuits", classification: "Grand Cru · monopole", grapes: "Pinot Noir", colour: "red", soilAspect: "Gentle east-facing mid-slope with fine limestone-clay soils.", style: "A tiny, intensely perfumed and complete Pinot Noir site; rarity magnifies its fame.", x: 360, y: 428, width: 112, height: 34 },
  { id: "la-tache", name: "La Tâche", village: "Vosne-Romanée", area: "Côte de Nuits", classification: "Grand Cru · monopole", grapes: "Pinot Noir", colour: "red", soilAspect: "A long mid-to-upper slope with changing soil depth.", style: "Usually broader and more spicy than Romanée-Conti, with powerful length.", x: 480, y: 421, width: 126, height: 42 },
  { id: "les-saint-georges", name: "Les Saint-Georges", village: "Nuits-Saint-Georges", area: "Côte de Nuits", classification: "Premier Cru", grapes: "Pinot Noir", colour: "red", soilAspect: "Mid-slope limestone and clay south of the town.", style: "A benchmark, deeply structured premier cru often discussed as grand-cru calibre.", x: 356, y: 478, width: 126, height: 38 },
  { id: "les-vaucrains", name: "Les Vaucrains", village: "Nuits-Saint-Georges", area: "Côte de Nuits", classification: "Premier Cru", grapes: "Pinot Noir", colour: "red", soilAspect: "Higher, steeper and stonier than many neighbouring premiers crus.", style: "Firm, mineral and slow to soften.", x: 490, y: 473, width: 118, height: 40 },
  { id: "corton", name: "Corton", village: "Aloxe-Corton / Ladoix / Pernand", area: "Côte de Beaune", classification: "Grand Cru", grapes: "Mostly Pinot Noir", colour: "red", soilAspect: "A large hill with exposures wrapping from southeast to southwest and varied marl.", style: "Burgundy’s only major red grand cru in the Côte de Beaune; robust and site-dependent.", x: 348, y: 560, width: 128, height: 40 },
  { id: "corton-charlemagne", name: "Corton-Charlemagne", village: "Aloxe-Corton / Pernand / Ladoix", area: "Côte de Beaune", classification: "Grand Cru", grapes: "Chardonnay", colour: "white", soilAspect: "Pale marl and limestone on the cooler upper hill.", style: "Powerful, mineral Chardonnay with high acid and long development.", x: 484, y: 553, width: 128, height: 45 },
  { id: "clos-des-mouches", name: "Clos des Mouches", village: "Beaune", area: "Côte de Beaune", classification: "Premier Cru", grapes: "Pinot Noir and Chardonnay", colour: "mixed", soilAspect: "Warm south-facing slope at the southern end of Beaune.", style: "One of Beaune’s best-known premiers crus, made in both colours.", x: 352, y: 617, width: 126, height: 37 },
  { id: "beaune-greves", name: "Les Grèves", village: "Beaune", area: "Côte de Beaune", classification: "Premier Cru", grapes: "Mostly Pinot Noir", colour: "red", soilAspect: "Gravelly, well-drained mid-slope above the town.", style: "Concentrated yet refined red Beaune.", x: 486, y: 611, width: 122, height: 41 },
  { id: "pommard-rugiens", name: "Les Rugiens", village: "Pommard", area: "Côte de Beaune", classification: "Premier Cru", grapes: "Pinot Noir", colour: "red", soilAspect: "Iron-rich red clay and limestone on the southern side of the village.", style: "Pommard at its most mineral and long-lived, with assertive tannin.", x: 350, y: 668, width: 120, height: 38 },
  { id: "clos-epeneaux", name: "Clos des Épeneaux", village: "Pommard", area: "Côte de Beaune", classification: "Premier Cru · monopole", grapes: "Pinot Noir", colour: "red", soilAspect: "A walled mid-slope parcel spanning subtle soil changes.", style: "Broad, savoury and structured Pommard.", x: 478, y: 662, width: 130, height: 42 },
  { id: "volnay-caillerets", name: "Les Caillerets", village: "Volnay", area: "Côte de Beaune", classification: "Premier Cru", grapes: "Pinot Noir", colour: "red", soilAspect: "Stony, pale limestone soils on a fine mid-slope.", style: "Perfumed, fine-boned and persistent Pinot Noir.", x: 350, y: 717, width: 122, height: 38 },
  { id: "clos-des-chenes", name: "Clos des Chênes", village: "Volnay", area: "Côte de Beaune", classification: "Premier Cru", grapes: "Pinot Noir", colour: "red", soilAspect: "Higher, rockier limestone-clay slope.", style: "A firmer, more structured face of Volnay.", x: 480, y: 711, width: 128, height: 42 },
  { id: "meursault-perrieres", name: "Perrières", village: "Meursault", area: "Côte de Beaune", classification: "Premier Cru", grapes: "Chardonnay", colour: "white", soilAspect: "Thin, stony limestone immediately beside Puligny’s grand-cru slope.", style: "Tense, mineral and long-lived; often considered Meursault’s most grand-cru-like site.", x: 350, y: 770, width: 118, height: 38 },
  { id: "meursault-genevrieres", name: "Genevrières", village: "Meursault", area: "Côte de Beaune", classification: "Premier Cru", grapes: "Chardonnay", colour: "white", soilAspect: "Limestone-marl mid-slope with good drainage.", style: "Fragrant, silky and nutty Chardonnay with depth.", x: 476, y: 764, width: 132, height: 42 },
  { id: "montrachet", name: "Montrachet", village: "Puligny / Chassagne-Montrachet", area: "Côte de Beaune", classification: "Grand Cru", grapes: "Chardonnay", colour: "white", soilAspect: "A perfectly exposed, gently sloping limestone-marl band across two communes.", style: "Exceptionally concentrated Chardonnay balancing power, acid and length.", x: 348, y: 821, width: 126, height: 40 },
  { id: "batard-montrachet", name: "Bâtard-Montrachet", village: "Puligny / Chassagne-Montrachet", area: "Côte de Beaune", classification: "Grand Cru", grapes: "Chardonnay", colour: "white", soilAspect: "Lower, deeper clay-limestone soils below Montrachet.", style: "Usually broader, richer and more immediately powerful than Montrachet.", x: 482, y: 815, width: 130, height: 44 },
  { id: "en-remilly", name: "En Remilly", village: "Saint-Aubin", area: "Côte de Beaune", classification: "Premier Cru", grapes: "Chardonnay", colour: "white", soilAspect: "Cool, high limestone slope tucked behind the Montrachet hill.", style: "Lean, incisive Chardonnay that often gives unusually strong value for its position.", x: 382, y: 867, width: 194, height: 34 },
  { id: "bouzeron", name: "Bouzeron", village: "Bouzeron", area: "Côte Chalonnaise", classification: "Village appellation", grapes: "Aligoté", colour: "white", soilAspect: "Limestone and marl slopes at the northern end of the Côte Chalonnaise.", style: "The only Burgundian village appellation devoted to Aligoté: fresh, herbal and more textured than simple regional examples.", x: 348, y: 956, width: 112, height: 37 },
  { id: "rully", name: "Rully", village: "Rully", area: "Côte Chalonnaise", classification: "Village & Premier Cru", grapes: "Chardonnay, Pinot Noir", colour: "mixed", soilAspect: "Limestone-clay slopes with cooler exposures.", style: "Especially known for Chardonnay and Crémant base wine, with supple red as well.", x: 468, y: 950, width: 142, height: 41 },
  { id: "mercurey", name: "Mercurey", village: "Mercurey", area: "Côte Chalonnaise", classification: "Village & Premier Cru", grapes: "Mostly Pinot Noir", colour: "red", soilAspect: "A broad amphitheatre of limestone-marl hills.", style: "The Côte Chalonnaise’s largest red-wine village, usually firmer than Givry.", x: 350, y: 1005, width: 122, height: 38 },
  { id: "givry", name: "Givry", village: "Givry", area: "Côte Chalonnaise", classification: "Village & Premier Cru", grapes: "Mostly Pinot Noir", colour: "red", soilAspect: "East- and southeast-facing limestone-clay slopes.", style: "Fragrant, approachable Pinot Noir with enough structure to age.", x: 480, y: 999, width: 126, height: 42 },
  { id: "montagny", name: "Montagny", village: "Montagny and neighbours", area: "Côte Chalonnaise", classification: "Village & Premier Cru", grapes: "Chardonnay", colour: "white", soilAspect: "South- and east-facing Bajocian limestone slopes.", style: "A white-only appellation producing bright, floral Chardonnay.", x: 382, y: 1052, width: 194, height: 35 },
  { id: "pouilly-fuisse", name: "Pouilly-Fuissé", village: "Fuissé, Solutré, Vergisson & Chaintré", area: "Mâconnais", classification: "Village & Premier Cru", grapes: "Chardonnay", colour: "white", soilAspect: "Limestone amphitheatres around the Roche de Solutré and Roche de Vergisson.", style: "Ripe Mâconnais fruit with enough limestone structure for serious, site-specific Chardonnay.", x: 348, y: 1142, width: 132, height: 42 },
  { id: "saint-veran", name: "Saint-Véran", village: "Villages around Pouilly-Fuissé", area: "Mâconnais", classification: "Village appellation", grapes: "Chardonnay", colour: "white", soilAspect: "Broken limestone hills flanking Pouilly-Fuissé.", style: "Generous citrus and stone fruit with a fresh chalky line.", x: 488, y: 1136, width: 122, height: 46 },
  { id: "vire-clesse", name: "Viré-Clessé", village: "Viré, Clessé, Montbellet & Laizé", area: "Mâconnais", classification: "Village appellation", grapes: "Chardonnay", colour: "white", soilAspect: "North-Mâconnais limestone ridges with clay and marl.", style: "Broad, floral Chardonnay; some traditional wines retain a little natural sweetness.", x: 382, y: 1194, width: 194, height: 36 },
];

export const bordeauxMapSites: BordeauxMapSite[] = [
  { id: "bordeaux-medoc", name: "Médoc & Haut-Médoc", kind: "zone", bank: "Left Bank", appellation: "Médoc / Haut-Médoc", classification: "Regional and communal appellations", coordinates: [-0.74, 45.18], grapes: "Cabernet Sauvignon-led blends with Merlot, Cabernet Franc and Petit Verdot", ground: "A long gravelly peninsula between Atlantic forest and Gironde estuary, with the best-drained croupes standing only slightly above surrounding land.", style: "Cassis-led, tannic reds whose exact balance changes from the more delicate south to the firmer north.", radiusKm: 24 },
  { id: "bordeaux-st-estephe", name: "Saint-Estèphe", kind: "zone", bank: "Left Bank", appellation: "Saint-Estèphe", classification: "Communal appellation", coordinates: [-0.772, 45.264], grapes: "Cabernet Sauvignon, Merlot, Cabernet Franc, Petit Verdot", ground: "Gravel over a greater share of clay than the communes immediately south, helping vines through dry years.", style: "Firm, savoury and slow-developing Médoc, often with substantial Merlot beside Cabernet.", radiusKm: 6.5 },
  { id: "bordeaux-pauillac", name: "Pauillac", kind: "zone", bank: "Left Bank", appellation: "Pauillac", classification: "Communal appellation · three red First Growths", coordinates: [-0.748, 45.205], grapes: "Cabernet Sauvignon dominant; Merlot, Cabernet Franc, Petit Verdot", ground: "Deep Garonne gravel ridges close to the Gironde, broken by small streams and lower clay pockets.", style: "Blackcurrant, cedar, graphite and powerful tannin; home to Lafite, Mouton and Latour.", radiusKm: 6.8 },
  { id: "bordeaux-st-julien", name: "Saint-Julien", kind: "zone", bank: "Left Bank", appellation: "Saint-Julien", classification: "Communal appellation", coordinates: [-0.736, 45.158], grapes: "Cabernet Sauvignon-led blends", ground: "Compact, consistently gravelly terraces between Pauillac and Margaux.", style: "Often read as a midpoint between Pauillac’s power and Margaux’s perfume.", radiusKm: 5.5 },
  { id: "bordeaux-margaux", name: "Margaux", kind: "zone", bank: "Left Bank", appellation: "Margaux", classification: "Communal appellation · one red First Growth", coordinates: [-0.675, 45.045], grapes: "Cabernet Sauvignon, Merlot, Cabernet Franc, Petit Verdot", ground: "A broad set of fine gravel islands spread across five communes, with meaningful clay and sand between them.", style: "Perfumed, finely textured Cabernet blends; estate position matters in this geographically spread appellation.", radiusKm: 8.5 },
  { id: "bordeaux-pessac", name: "Pessac-Léognan", kind: "zone", bank: "Left Bank", appellation: "Pessac-Léognan", classification: "Communal appellation · Graves classification · Haut-Brion is a red First Growth of 1855", coordinates: [-0.64, 44.735], grapes: "Cabernet Sauvignon and Merlot; Sauvignon Blanc and Sémillon", ground: "Gravel terraces immediately south of Bordeaux city, increasingly surrounded by urban development.", style: "Gravel-smoke red blends and structured dry whites shaped by lees and oak.", radiusKm: 14 },
  { id: "bordeaux-sauternes", name: "Sauternes & Barsac", kind: "zone", bank: "Left Bank", appellation: "Sauternes / Barsac", classification: "1855 sweet-wine classification", coordinates: [-0.34, 44.54], grapes: "Sémillon, Sauvignon Blanc, Muscadelle", ground: "Gravel, clay and Barsac limestone near the cold Ciron’s meeting with the warmer Garonne, producing autumn mist.", style: "Botrytised sweet wine balancing immense sugar with acid, bitterness and saffron-citrus complexity.", radiusKm: 10 },
  { id: "bordeaux-graves", name: "Graves", kind: "zone", bank: "Left Bank", appellation: "Graves", classification: "Regional appellation", coordinates: [-0.44, 44.58], grapes: "Cabernet Sauvignon, Merlot; Sauvignon Blanc, Sémillon", ground: "A continuation of gravel terraces south of Pessac-Léognan, mixed with sand and clay.", style: "Red, dry white and sweet wines across a large transitional zone.", radiusKm: 14 },
  { id: "bordeaux-pomerol", name: "Pomerol", kind: "zone", bank: "Right Bank", appellation: "Pomerol", classification: "No formal château classification", coordinates: [-0.202, 44.93], grapes: "Merlot dominant with Cabernet Franc", ground: "A small plateau of gravel and clay, including dense iron-rich clay traditionally called crasse de fer.", style: "Plush Merlot with violet, plum and truffle development; the plateau is finer-grained than the appellation name alone suggests.", radiusKm: 3.1 },
  { id: "bordeaux-st-emilion", name: "Saint-Émilion", kind: "zone", bank: "Right Bank", appellation: "Saint-Émilion / Saint-Émilion Grand Cru", classification: "Revisable château classification inside Saint-Émilion Grand Cru", coordinates: [-0.157, 44.893], grapes: "Merlot and Cabernet Franc; Cabernet Sauvignon in warmer gravel sectors", ground: "Limestone plateau and côtes, clay slopes, gravel toward Pomerol, then sandier plains.", style: "Limestone can emphasise freshness and line; clay supports Merlot body; gravel favours a larger Cabernet share.", radiusKm: 6.8 },
  { id: "bordeaux-fronsac", name: "Fronsac & Canon-Fronsac", kind: "zone", bank: "Right Bank", appellation: "Fronsac / Canon-Fronsac", classification: "Communal appellations", coordinates: [-0.273, 44.925], grapes: "Merlot, Cabernet Franc", ground: "Limestone and clay hills above the Dordogne and Isle.", style: "Structured Right Bank Merlot with a cool limestone spine.", radiusKm: 5.5 },
  { id: "bordeaux-satellites", name: "Saint-Émilion satellites", kind: "zone", bank: "Right Bank", appellation: "Montagne, Lussac, Puisseguin and Saint-Georges-Saint-Émilion", classification: "Four satellite appellations", coordinates: [-0.092, 44.955], grapes: "Merlot, Cabernet Franc", ground: "North-eastern limestone and clay plateaux continuing beyond Saint-Émilion.", style: "Merlot-led reds with related geology and usually earlier accessibility.", radiusKm: 9 },
  { id: "bordeaux-castillon", name: "Castillon & Francs", kind: "zone", bank: "Right Bank", appellation: "Castillon Côtes de Bordeaux / Francs Côtes de Bordeaux", classification: "Côtes de Bordeaux appellations", coordinates: [-0.03, 44.87], grapes: "Merlot, Cabernet Franc, Cabernet Sauvignon", ground: "East-facing limestone escarpments and clay plateaux beyond Saint-Émilion.", style: "Firm, fresh Merlot blends, especially from limestone slopes.", radiusKm: 9 },
  { id: "bordeaux-entre-deux-mers", name: "Entre-Deux-Mers", kind: "zone", bank: "Between the rivers", appellation: "Entre-Deux-Mers and overlapping red appellations", classification: "Regional dry-white appellation", coordinates: [-0.19, 44.72], grapes: "Sauvignon Blanc, Sémillon, Muscadelle; Merlot-led reds under other appellations", ground: "Rolling clay-limestone country between the Garonne and Dordogne.", style: "Fresh dry white under the Entre-Deux-Mers name; red from the same ground is labelled through broader Bordeaux appellations.", radiusKm: 24 },
  { id: "bordeaux-blaye-bourg", name: "Blaye & Bourg", kind: "zone", bank: "Right Bank", appellation: "Blaye Côtes de Bordeaux / Côtes de Bourg", classification: "Côtes appellations", coordinates: [-0.6, 45.12], grapes: "Merlot, Cabernet Sauvignon, Cabernet Franc, Malbec", ground: "Limestone and clay hills across the Gironde from the Médoc.", style: "Merlot-led reds, often with a substantial Cabernet or Malbec contribution.", radiusKm: 13 },

  { id: "estate-lafite", name: "Château Lafite Rothschild", kind: "estate", bank: "Left Bank", appellation: "Pauillac", classification: "Premier Cru Classé · 1855", coordinates: [-0.7725, 45.2252], grapes: "Cabernet Sauvignon dominant; Merlot, Cabernet Franc, Petit Verdot", ground: "Fine, deep gravel croupes at Pauillac’s northern edge, beside Saint-Estèphe.", style: "A particularly aromatic, linear face of Pauillac with fine but persistent tannin.", radiusKm: 1.05 },
  { id: "estate-mouton", name: "Château Mouton Rothschild", kind: "estate", bank: "Left Bank", appellation: "Pauillac", classification: "Premier Cru Classé · 1855, promoted in 1973", coordinates: [-0.7736, 45.2146], grapes: "Cabernet Sauvignon dominant; Merlot, Cabernet Franc, Petit Verdot", ground: "High gravel mounds in north Pauillac, immediately south of Lafite’s sector.", style: "Rich, expansive Cabernet with Pauillac graphite and strong new-oak integration in youth.", radiusKm: 0.92 },
  { id: "estate-latour", name: "Château Latour", kind: "estate", bank: "Left Bank", appellation: "Pauillac", classification: "Premier Cru Classé · 1855", coordinates: [-0.7501, 45.1763], grapes: "Cabernet Sauvignon dominant; Merlot, Cabernet Franc, Petit Verdot", ground: "The Enclos sits on gravel close to the Gironde, where the estuary tempers frost and heat.", style: "Dense, powerful and exceptionally long-lived Pauillac built around Cabernet tannin.", radiusKm: 0.9 },
  { id: "estate-margaux", name: "Château Margaux", kind: "estate", bank: "Left Bank", appellation: "Margaux", classification: "Premier Cru Classé · 1855", coordinates: [-0.6682, 45.0444], grapes: "Cabernet Sauvignon dominant; Merlot, Petit Verdot, Cabernet Franc; Sauvignon Blanc for Pavillon Blanc", ground: "Deep fine gravel around the estate with clay lenses and a separate white-grape holding.", style: "Perfume and very fine tannin rather than lack of power; the white is Sauvignon-led and separately farmed.", radiusKm: 1.1 },
  { id: "estate-haut-brion", name: "Château Haut-Brion", kind: "estate", bank: "Left Bank", appellation: "Pessac-Léognan", classification: "Premier Cru Classé · 1855; the only red First Growth outside the Médoc", coordinates: [-0.6186, 44.8167], grapes: "Cabernet Sauvignon, Merlot, Cabernet Franc, Petit Verdot; Sauvignon Blanc and Sémillon for white", ground: "Warm, well-drained gravel rises now enclosed by the Bordeaux suburbs.", style: "Smoky, savoury red with a larger Merlot role than many Médoc First Growths; tiny, powerful dry white production.", radiusKm: 0.62 },
  { id: "estate-yquem", name: "Château d’Yquem", kind: "estate", bank: "Left Bank", appellation: "Sauternes", classification: "Premier Cru Supérieur · 1855 sweet-wine classification", coordinates: [-0.3352, 44.5392], grapes: "Sémillon with Sauvignon Blanc", ground: "A high, well-drained gravel-clay hill within the mist-prone Sauternes basin.", style: "Botrytised sweetness with exceptional concentration, acid and bitter-citrus balance; many selective picking passes.", radiusKm: 0.82 },
  { id: "estate-petrus", name: "Pétrus", kind: "estate", bank: "Right Bank", appellation: "Pomerol", classification: "Unclassified · Pomerol has no formal château hierarchy", coordinates: [-0.1987, 44.9296], grapes: "Almost entirely Merlot", ground: "Dense blue clay on the high Pomerol plateau, with strong water retention.", style: "Concentrated Merlot whose power comes with unusually persistent structure.", radiusKm: 0.3 },
  { id: "estate-lafleur", name: "Château Lafleur", kind: "estate", bank: "Right Bank", appellation: "Pomerol", classification: "Unclassified · Pomerol", coordinates: [-0.1956, 44.9277], grapes: "Merlot and a very large Cabernet Franc share", ground: "Gravel and clay mosaic on the Pomerol plateau.", style: "Cabernet Franc brings perfume, line and longevity beside dense Merlot.", radiusKm: 0.24 },
  { id: "estate-le-pin", name: "Le Pin", kind: "estate", bank: "Right Bank", appellation: "Pomerol", classification: "Unclassified · Pomerol", coordinates: [-0.2009, 44.9259], grapes: "Merlot dominant with Cabernet Franc", ground: "Tiny gravel-and-clay parcels on the plateau.", style: "Small-production, opulent Merlot with silky texture.", radiusKm: 0.18 },
  { id: "estate-figeac", name: "Château Figeac", kind: "estate", bank: "Right Bank", appellation: "Saint-Émilion Grand Cru", classification: "Premier Grand Cru Classé A · 2022", coordinates: [-0.1926, 44.9106], grapes: "Cabernet Sauvignon, Cabernet Franc and Merlot in unusually even importance", ground: "Three gravel rises near Pomerol, warmer and freer-draining than much of Saint-Émilion.", style: "Cabernet-led freshness and graphite distinguish it from clay-limestone Merlot neighbours.", radiusKm: 0.48 },
  { id: "estate-pavie", name: "Château Pavie", kind: "estate", bank: "Right Bank", appellation: "Saint-Émilion Grand Cru", classification: "Premier Grand Cru Classé A · 2022", coordinates: [-0.1398, 44.8872], grapes: "Merlot dominant with Cabernet Franc and Cabernet Sauvignon", ground: "Limestone plateau, steep south-facing côte and clay-limestone foot slope.", style: "Powerful, ripe Saint-Émilion with substantial limestone-derived freshness and tannin.", radiusKm: 0.56 },
  { id: "estate-ausone", name: "Château Ausone", kind: "estate", bank: "Right Bank", appellation: "Saint-Émilion Grand Cru", classification: "Historic Premier Grand Cru Classé A; did not enter the 2022 classification", coordinates: [-0.1559, 44.8894], grapes: "Cabernet Franc and Merlot", ground: "Tiny limestone terrace and steep côtes directly below the town.", style: "Dense but lifted, with a particularly strong Cabernet Franc and limestone signature.", radiusKm: 0.27 },
  { id: "estate-cheval-blanc", name: "Château Cheval Blanc", kind: "estate", bank: "Right Bank", appellation: "Saint-Émilion Grand Cru", classification: "Historic Premier Grand Cru Classé A; did not enter the 2022 classification", coordinates: [-0.1869, 44.9176], grapes: "Cabernet Franc and Merlot", ground: "Gravel, clay and sand at Saint-Émilion’s border with Pomerol.", style: "Cabernet Franc perfume and freshness over a supple Merlot frame.", radiusKm: 0.52 },
];

export const wineRegionCount = wineCountries.reduce((total, country) => total + country.regions.length, 0);
export const wineCountryCount = wineCountries.length;
export const wineSubregionCount = wineCountries.reduce(
  (total, country) => total + country.regions.reduce((countryTotal, item) => countryTotal + item.subregions.length, 0),
  0,
);

export const wineCountryByIso = new Map(wineCountries.map((country) => [country.iso, country]));
