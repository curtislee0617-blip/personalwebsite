export type WineGrapeColour = "red" | "white" | "pink";

export type WineGrape = {
  id: string;
  name: string;
  aliases: string[];
  colour: WineGrapeColour;
  origin: string;
  climate: string;
  profile: string;
  structure: string;
  regions: string[];
  lineage: string;
  roles: string[];
};

function grape(
  id: string,
  name: string,
  colour: WineGrapeColour,
  aliases: string[],
  origin: string,
  climate: string,
  profile: string,
  structure: string,
  regions: string[],
  lineage: string,
  roles: string[],
): WineGrape {
  return { id, name, colour, aliases, origin, climate, profile, structure, regions, lineage, roles };
}

export const wineGrapes: WineGrape[] = [
  grape("chardonnay", "Chardonnay", "white", [], "Burgundy, France", "Early-budding and vulnerable to spring frost; otherwise adaptable, with cool and moderate sites preserving the most acidity and site detail.", "Apple and citrus in cool sites; peach and tropical fruit when riper. Lees, malolactic conversion and oak can add bread, butter, nuts, smoke and cream.", "Medium to high acid; light to full body depending on ripeness and winemaking.", ["Burgundy", "Champagne", "California", "Australia", "New Zealand", "England"], "A natural Pinot × Gouais Blanc crossing, making it a sibling of Gamay, Aligoté and Melon.", ["still", "sparkling"]),
  grape("sauvignon-blanc", "Sauvignon Blanc", "white", ["Fumé Blanc"], "Loire Valley / western France", "Moderately late budburst and mid-season ripening; likes cool-to-moderate sites but needs enough sun to move beyond aggressively green flavours.", "Gooseberry, grapefruit, passion fruit and blackcurrant leaf; methoxypyrazines bring green pepper while volatile thiols drive tropical and citrus notes.", "High acid, usually light to medium body.", ["Loire", "Bordeaux", "Marlborough", "Coastal Chile", "Styria", "South Africa"], "Closely related to Savagnin; with Cabernet Franc it produced Cabernet Sauvignon.", ["still", "sweet"]),
  grape("riesling", "Riesling", "white", ["Rhine Riesling"], "Rhine region, Germany", "Late-budding, late-ripening and cold-hardy; excels in cool sites with a long autumn.", "Lime, green apple, white flowers and stone; bottle age can add wax, smoke and petrol-like TDN.", "Very high acid; light to medium body; dry to intensely sweet.", ["Mosel", "Rheingau", "Alsace", "Wachau", "Clare Valley", "Finger Lakes"], "One parent is Gouais Blanc; the other belongs close to the Savagnin/Traminer family.", ["still", "sweet", "sparkling"]),
  grape("chenin-blanc", "Chenin Blanc", "white", ["Pineau de la Loire", "Steen"], "Loire Valley, France", "Buds early but ripens late; high acid works from cool to warm climates if yields and rot are controlled.", "Apple, quince, chamomile and wool; noble rot adds honey and saffron, while age brings toast and lanolin.", "High acid and a broad texture; makes dry, sparkling and very sweet wine.", ["Vouvray", "Anjou-Saumur", "Savennières", "Stellenbosch", "Swartland"], "Likely an offspring of Savagnin and an unknown parent.", ["still", "sparkling", "sweet"]),
  grape("semillon", "Sémillon", "white", [], "South-west France", "Early budding, mid-ripening and thin-skinned; susceptible to noble rot in misty sites.", "Lemon, wax and grass when young; toast, honey and lanolin with age. Botrytis adds apricot, ginger and marmalade.", "Medium acid, medium to full body and a characteristically waxy texture.", ["Bordeaux", "Sauternes", "Hunter Valley", "Margaret River", "Constantia"], "An old south-western French variety of uncertain parentage.", ["still", "sweet"]),
  grape("pinot-gris", "Pinot Gris", "pink", ["Pinot Grigio", "Grauburgunder"], "Burgundy, France", "Early budding and ripening; performs best where nights or latitude retain acidity.", "Pear, apple, peach and subtle spice; skin contact can give copper colour and more phenolic grip.", "Medium acid and medium to full body; Italian Grigio is often lighter than Alsace-style Gris.", ["Alsace", "Alto Adige", "Friuli", "Germany", "Oregon", "New Zealand"], "A colour mutation of Pinot Noir, sharing essentially the same genetic identity.", ["still", "skin-contact", "sweet"]),
  grape("gewurztraminer", "Gewürztraminer", "pink", ["Traminer Aromatico"], "Alpine Europe", "Early budding and ripening; needs enough warmth for aroma but loses acid quickly.", "Rose, lychee, ginger and Turkish delight from abundant monoterpenes.", "Low to medium acid, high alcohol and full body; dry to sweet.", ["Alsace", "Alto Adige", "Germany", "Austria", "New Zealand"], "An aromatic pink-skinned mutation within the ancient Savagnin/Traminer family.", ["still", "sweet"]),
  grape("gruner-veltliner", "Grüner Veltliner", "white", [], "Lower Austria", "Mid-to-late ripening; works especially well in dry continental regions with cool nights.", "Green apple, citrus, herbs and white pepper; riper examples gain stone fruit and a creamy lees texture.", "High acid, light to full body depending on yield and site.", ["Wachau", "Kamptal", "Kremstal", "Weinviertel"], "A natural crossing of Savagnin with the rare St Georgen-Rebe.", ["still"]),
  grape("viognier", "Viognier", "white", [], "Northern Rhône, France", "Early budding but needs warmth to ripen; can lose acid and gain alcohol quickly.", "Apricot, peach, blossom and ginger; oak and lees can broaden the texture.", "Low to medium acid, high alcohol and full body.", ["Condrieu", "Côte-Rôtie blends", "California", "Australia", "South Africa"], "An old Rhône variety genetically close to Mondeuse and therefore part of Syrah’s extended family.", ["still"]),
  grape("marsanne", "Marsanne", "white", [], "Northern Rhône, France", "Late-ripening and productive; prefers warm, dry conditions.", "Pear, melon, almond and honeysuckle; develops wax and nuts with age.", "Medium acid and full, oily body.", ["Hermitage", "Crozes-Hermitage", "Saint-Joseph", "Australia"], "Old Rhône variety of uncertain parentage; commonly blended with Roussanne.", ["still"]),
  grape("roussanne", "Roussanne", "white", [], "Rhône Valley, France", "Late-ripening and irregular in yield; vulnerable to rot and wind.", "Pear, herbal tea, flowers and stone fruit, often with a savoury waxy note.", "Medium to high acid and medium to full body.", ["Northern Rhône", "Châteauneuf-du-Pape", "Languedoc", "California", "Australia"], "Old Rhône variety; despite the partnership, it is not a close sibling of Marsanne.", ["still"]),
  grape("muscat-blanc", "Muscat Blanc à Petits Grains", "white", ["Moscato Bianco", "Muscat de Frontignan", "Gelber Muskateller"], "Eastern Mediterranean, ancient", "Likes warmth but retains its most vivid perfume with cool nights and healthy skins.", "Fresh grapes, orange blossom, rose, citrus peel and spice—one of the clearest examples of terpene-driven aroma.", "Usually low to medium acid and overtly aromatic.", ["Asti", "Alsace", "Rutherglen", "Setúbal", "Beaumes-de-Venise", "Greece"], "One of the oldest named grape families; many Muscats are related but not identical.", ["still", "sparkling", "sweet", "fortified"]),
  grape("melon", "Melon de Bourgogne", "white", ["Melon B"], "Burgundy, France", "Early budding and ripening; well suited to cool Atlantic conditions.", "Subtle lemon, green apple and saline notes; lees ageing adds bread dough and cream.", "High acid, light body and deliberately restrained aroma.", ["Muscadet"], "A natural Pinot × Gouais Blanc crossing.", ["still"]),
  grape("aligote", "Aligoté", "white", [], "Burgundy, France", "Early ripening and productive; acidity stays vivid in cool continental sites.", "Lemon, green apple, herbs and chalk, sometimes with a rounder floral side in Bouzeron.", "High acid, light to medium body.", ["Bourgogne Aligoté", "Bouzeron", "Eastern Europe"], "A natural Pinot × Gouais Blanc crossing and sibling of Chardonnay.", ["still", "sparkling"]),
  grape("savagnin", "Savagnin", "white", ["Traminer"], "North-eastern France / Alpine Europe", "Late-ripening, thick-skinned and naturally high in acid.", "Citrus, apple and spice when topped up; walnut, curry and umami when aged under voile.", "High acid and medium to full body.", ["Jura", "Savoie"], "An ancient parent variety behind numerous European grapes, including Chenin and Grüner Veltliner.", ["still", "oxidative", "sweet"]),
  grape("albarino", "Albariño", "white", ["Alvarinho"], "North-west Iberia", "Thick skins cope with wet Atlantic conditions; needs canopy airflow to limit mildew.", "Lemon, grapefruit, peach, blossom and saline notes.", "High acid, medium body and sometimes light phenolic texture.", ["Rías Baixas", "Monção e Melgaço"], "Closely related to several north-western Iberian varieties; exact parentage remains unresolved.", ["still"]),
  grape("godello", "Godello", "white", ["Gouveio"], "North-west Spain", "Mid-ripening; works well on dry, elevated slate and granite sites.", "Apple, grapefruit, stone fruit, herbs and a waxy mineral texture.", "Medium to high acid and medium to full body.", ["Valdeorras", "Bierzo", "Ribeira Sacra", "Douro"], "An old Iberian variety; the Portuguese Gouveio is the same grape.", ["still"]),
  grape("verdejo", "Verdejo", "white", [], "Castilla y León, Spain", "Drought-tolerant in high, hot continental vineyards; cool nights retain aroma.", "Citrus, melon, fennel and a characteristic bitter-herbal finish.", "High acid, medium body.", ["Rueda"], "Old local variety of uncertain parentage.", ["still"]),
  grape("airen", "Airén", "white", [], "Castilla-La Mancha, Spain", "Very drought- and heat-tolerant, traditionally bush-trained at wide spacing.", "Neutral apple and citrus unless yields are low and fermentation carefully protected.", "Low to medium acid, light to medium body.", ["La Mancha", "Valdepeñas"], "Ancient central Spanish variety of uncertain origin.", ["still", "distillation"]),
  grape("palomino", "Palomino", "white", ["Listán Blanco"], "Andalusia, Spain", "Productive and well adapted to hot, dry Jerez; low grape acidity is useful for biologically aged styles.", "Intentionally neutral as a base, allowing flor, oxidation and solera ageing to dominate.", "Low acid and light body before fortification.", ["Jerez", "Sanlúcar", "Canary Islands"], "Old Iberian variety; the Canary Islands’ Listán Blanco is genetically the same.", ["fortified", "still"]),
  grape("pedro-ximenez", "Pedro Ximénez", "white", ["PX"], "Andalusia, Spain", "Warm, dry conditions suit sun-drying; thin skins are vulnerable in humidity.", "Raisin, fig, molasses, coffee and liquorice after drying and oxidative ageing.", "Very high sugar, low to medium acid and viscous body in fortified wine.", ["Montilla-Moriles", "Jerez"], "Old Iberian variety unrelated to Riesling despite a persistent legend.", ["sweet", "fortified"]),
  grape("macabeo", "Macabeo", "white", ["Viura", "Macabeu"], "North-eastern Spain", "Late budding helps avoid frost; productive and tolerant of warm, dry sites.", "Apple, lemon and herbs; oak and bottle age can add nuts and wax.", "Medium acid and body.", ["Rioja", "Cava", "Roussillon"], "Old Iberian variety of uncertain parentage.", ["still", "sparkling"]),
  grape("xarel-lo", "Xarel·lo", "white", ["Pansa Blanca"], "Catalunya, Spain", "Thick-skinned and drought-tolerant; retains acidity in warm Mediterranean conditions.", "Lemon, apple, fennel and earthy herbs, with notable phenolic texture.", "High acid and medium to full body.", ["Penedès", "Cava", "Alella"], "Local Catalan variety of uncertain parentage.", ["still", "sparkling"]),
  grape("parellada", "Parellada", "white", [], "Catalunya, Spain", "Late-ripening and best at higher, cooler elevations.", "Delicate apple, blossom and citrus.", "High acid and light body.", ["Upper Penedès", "Cava"], "Old Catalan variety of uncertain parentage.", ["sparkling", "still"]),
  grape("furmint", "Furmint", "white", ["Šipon"], "Hungary", "Late-ripening, high-acid and thin-skinned; readily develops noble rot.", "Apple, quince, lime and smoke; botrytis adds apricot, honey and saffron.", "Very high acid and medium to full body, from bone dry to intensely sweet.", ["Tokaj", "Somló", "Burgenland", "Slovenia"], "A likely Gouais Blanc descendant with close Central European relatives.", ["still", "sweet"]),
  grape("harslevelu", "Hárslevelű", "white", ["Lipovina"], "Hungary", "Late-ripening and aromatic, usually softer in acid than Furmint.", "Linden blossom, honey, peach and spice.", "Medium acid and body.", ["Tokaj", "Somló", "Eger"], "A natural offspring of Furmint.", ["still", "sweet"]),
  grape("assyrtiko", "Assyrtiko", "white", [], "Santorini, Greece", "Late-ripening, drought- and wind-tolerant, with an unusual ability to keep acid in heat.", "Lemon, salt, smoke and crushed stone; bottle age can bring honey and nuts.", "Very high acid, medium to full body and often high alcohol.", ["Santorini", "mainland Greece"], "Ancient Aegean variety with many old ungrafted vines on Santorini.", ["still", "sweet"]),
  grape("moschofilero", "Moschofilero", "pink", [], "Peloponnese, Greece", "Late-ripening and best in cool high plateaux.", "Rose, orange blossom, lemon peel and grape skin.", "High acid, light body and pronounced perfume.", ["Mantinia"], "Member of Greece’s genetically varied Fileri family.", ["still", "sparkling", "rosé"]),
  grape("garganega", "Garganega", "white", [], "Veneto, Italy", "Late-ripening, vigorous and capable of retaining acidity on hillside sites.", "Pear, lemon, chamomile and almond; dried grapes bring apricot and honey.", "Medium to high acid and medium body.", ["Soave", "Gambellara"], "One of Italy’s important parent varieties; genetically identical to Sicily’s Grecanico Dorato.", ["still", "sweet"]),
  grape("glera", "Glera", "white", ["Prosecco"], "North-east Italy / Slovenia", "Late-ripening and vigorous; hill sites and cool nights protect delicate aroma.", "Pear, green apple, melon and white flowers.", "High acid, light body and moderate aroma intensity.", ["Conegliano-Valdobbiadene", "Asolo", "Prosecco DOC"], "Old north-eastern variety with several local biotypes.", ["sparkling", "still"]),
  grape("cortese", "Cortese", "white", [], "Piemonte, Italy", "Late-ripening and naturally high in acid; needs crop control to avoid neutrality.", "Lemon, green apple, herbs and almond.", "High acid, light to medium body.", ["Gavi"], "Old Piedmontese variety of uncertain parentage.", ["still"]),
  grape("arneis", "Arneis", "white", [], "Roero, Piemonte", "Early-ripening and relatively low in acid, so harvest timing matters.", "Pear, peach, blossom and almond.", "Low to medium acid and medium body.", ["Roero", "Langhe"], "Old Piedmontese variety; its name is sometimes translated as ‘little rascal’ because it can be difficult to grow.", ["still"]),
  grape("verdicchio", "Verdicchio", "white", ["Trebbiano di Soave", "Turbiana"], "Central / north-east Italy", "Late-ripening and capable of retaining high acidity.", "Lemon, apple, fennel, almond and sea-spray notes.", "High acid, medium body and often phenolic grip.", ["Castelli di Jesi", "Matelica", "Lugana", "Soave blends"], "Genetically the same broad variety as Trebbiano di Soave and Turbiana, with regional biotypes.", ["still", "sparkling"]),
  grape("vermentino", "Vermentino", "white", ["Rolle", "Pigato"], "Western Mediterranean", "Mid-season ripening, tolerant of heat, drought and coastal wind.", "Lemon, pear, herbs and salt, often with a pleasantly bitter finish.", "Medium to high acid and medium body.", ["Sardinia", "Liguria", "Corsica", "Provence", "Tuscany"], "Vermentino, Rolle and Pigato are genetically the same variety, though local selections differ.", ["still"]),
  grape("trebbiano-toscano", "Trebbiano Toscano", "white", ["Ugni Blanc"], "Central Italy", "Late-ripening, vigorous and naturally high in acid.", "Usually neutral citrus and apple; valued more for freshness than perfume.", "High acid, light body.", ["Tuscany", "Abruzzo blends", "Cognac", "Armagnac"], "Ancient Italian variety; unrelated grapes also carry the loose Trebbiano name.", ["still", "distillation"]),
  grape("fiano", "Fiano", "white", [], "Campania, Italy", "Late-ripening, low-yielding and suited to warm sites with cool nights.", "Pear, citrus, hazelnut, honey and smoke.", "Medium to high acid, medium to full body and waxy texture.", ["Fiano di Avellino", "Puglia", "Australia"], "Ancient southern Italian variety of uncertain parentage.", ["still"]),
  grape("greco", "Greco", "white", [], "Southern Italy", "Late-ripening and thick-skinned; works best at elevation.", "Lemon, green apple, peach and dried herbs, with marked phenolic grip.", "High acid and medium to full body.", ["Greco di Tufo", "Campania", "Calabria"], "The Greco name covers more than one local vine; Greco di Tufo is a distinct principal variety.", ["still"]),
  grape("falanghina", "Falanghina", "white", [], "Campania, Italy", "Late-ripening and well adapted to warm coastal and volcanic sites.", "Lemon, apple, white flowers and herbs.", "Medium to high acid and medium body.", ["Campania", "Campi Flegrei", "Sannio"], "Several biotypes exist; the name is not one perfectly uniform clone.", ["still"]),
  grape("carricante", "Carricante", "white", [], "Mount Etna, Sicily", "Late-ripening; high elevation and strong light preserve acidity.", "Lemon, anise, smoke and wet stone.", "Very high acid, medium body and firm mineral texture.", ["Etna Bianco"], "Old eastern Sicilian variety often blended with Catarratto.", ["still"]),
  grape("catarratto", "Catarratto", "white", [], "Sicily, Italy", "Productive, drought-tolerant and well suited to hot conditions.", "Citrus, herbs and yellow apple, usually restrained in perfume.", "Medium acid and body.", ["Western Sicily", "Etna blends", "Marsala"], "A group of closely related Sicilian biotypes; a parent of Garganega according to DNA work.", ["still", "fortified"]),
  grape("grillo", "Grillo", "white", [], "Sicily, Italy", "Heat- and drought-tolerant while retaining more aroma and acid than many warm-climate grapes.", "Lemon, grapefruit, herbs and sea salt.", "Medium to high acid and medium body.", ["Western Sicily", "Marsala"], "A crossing of Catarratto and Muscat of Alexandria.", ["still", "fortified"]),
  grape("ribolla-gialla", "Ribolla Gialla", "white", ["Rebula"], "Friuli / Slovenia", "Late-ripening and naturally high in acid; wet sites require careful disease control.", "Lemon, apple and flowers; skin contact adds tea, nuts and firm phenolics.", "High acid, light body without skins and much more grip with them.", ["Collio", "Colli Orientali", "Brda"], "Old Adriatic-border variety of uncertain parentage.", ["still", "skin-contact", "sparkling"]),
  grape("friulano", "Friulano", "white", ["Sauvignonasse", "Jakot"], "Friuli / north-east Italy", "Early to mid-ripening and prone to losing acid in excess heat.", "Pear, herbs and almond with a gently bitter finish.", "Medium acid and body.", ["Friuli", "Collio", "Colli Orientali"], "Genetically Sauvignonasse, not Sauvignon Blanc and not Tocai/Furmint.", ["still"]),
  grape("encruzado", "Encruzado", "white", [], "Dão, Portugal", "Mid-ripening; granite altitude helps retain acidity.", "Lemon, pear, flowers and mineral smoke; responds well to lees and oak.", "Medium to high acid and full texture.", ["Dão"], "Old Portuguese variety of uncertain parentage.", ["still"]),
  grape("antao-vaz", "Antão Vaz", "white", [], "Alentejo, Portugal", "Heat- and drought-tolerant, but can lose acid if picked too late.", "Ripe citrus, peach and tropical fruit.", "Medium acid and full body.", ["Vidigueira", "Alentejo"], "Old southern Portuguese variety of uncertain parentage.", ["still"]),
  grape("loureiro", "Loureiro", "white", [], "Minho, Portugal", "Early-ripening and well adapted to cool, rainy Atlantic valleys.", "Bay leaf, orange blossom, lime and green apple.", "High acid and light to medium body.", ["Vinho Verde", "Lima Valley"], "Old north-west Iberian variety whose name refers to laurel-like aroma.", ["still"]),
  grape("arinto", "Arinto", "white", ["Pedernã"], "Portugal", "Late-ripening and unusually good at retaining acidity in warmth.", "Lemon, green apple and chalk, becoming honeyed with age.", "Very high acid and medium body.", ["Bucelas", "Vinho Verde", "Alentejo", "Azores"], "Old Portuguese variety with many regional names.", ["still", "sparkling"]),
  grape("torrontes", "Torrontés Riojano", "white", ["Torrontés"], "Argentina", "Early to mid-ripening; high sites preserve perfume and acid.", "Rose, orange blossom, grape and peach, sometimes with a lightly bitter finish.", "Medium acid and body; intensely aromatic.", ["Salta", "La Rioja", "Mendoza"], "A natural crossing of Muscat of Alexandria and Criolla Chica (País).", ["still"]),
  grape("bacchus", "Bacchus", "white", [], "Germany", "Early-ripening and useful in very cool climates, though acid can fall quickly when overripe.", "Elderflower, blackcurrant leaf, citrus and herbs.", "Medium acid and light to medium body.", ["England", "Germany"], "A 20th-century crossing involving Silvaner × Riesling and Müller-Thurgau.", ["still"]),
  grape("silvaner", "Silvaner", "white", ["Sylvaner"], "Central Europe", "Early budding and mid-ripening; neutral aroma makes site and texture prominent.", "Green apple, herbs, earth and subtle smoke.", "Medium acid and medium body.", ["Franken", "Alsace", "Rheinhessen"], "A natural crossing of Savagnin and Österreichisch Weiss.", ["still"]),
  grape("sercial", "Sercial", "white", ["Esgana Cão"], "Portugal", "Late-ripening and extremely high in acid; planted in Madeira’s cooler sites.", "Citrus peel, green apple and nuts after oxidative ageing.", "Very high acid; traditionally the driest named Madeira style.", ["Madeira", "mainland Portugal"], "Madeiran Sercial is genetically the mainland grape Esgana Cão.", ["fortified"]),
  grape("verdelho", "Verdelho", "white", [], "Madeira / Portugal", "Earlier and slightly easier to ripen than Sercial; keeps useful acidity.", "Citrus, dried fruit, smoke and spice after heating and oxidation.", "High acid; traditionally medium-dry Madeira.", ["Madeira", "Azores", "Australia"], "Old Portuguese island variety, distinct from Spanish Verdejo and Italian Verdicchio.", ["still", "fortified"]),
  grape("boal", "Boal", "white", ["Bual", "Malvasia Fina"], "Portugal", "Riper and fuller than Sercial or Verdelho in warm Madeiran sites.", "Raisin, caramel, citrus peel and nuts.", "High acid despite substantial sweetness; traditionally medium-sweet Madeira.", ["Madeira"], "Most Boal on Madeira is the mainland variety Malvasia Fina.", ["fortified"]),
  grape("malvasia", "Malvasia", "white", ["Malmsey"], "Mediterranean family", "Generally warm-climate and aromatic, but the name covers several genetically distinct grapes.", "Orange blossom, peach, raisin and spice; Madeira ageing adds caramel and nuts.", "Usually medium acid and full body.", ["Madeira", "Italy", "Iberia", "Greece"], "A historic family name rather than one single grape; Madeira’s Malvasia Cândida and Malvasia de São Jorge are distinct.", ["still", "sweet", "fortified"]),
  grape("muscadelle", "Muscadelle", "white", ["Tokay in old Australian usage"], "South-west France", "Early-ripening, aromatic and vulnerable to rot.", "Grape, flowers and musk, despite having no close relationship to the Muscat family.", "Low to medium acid and medium body.", ["Bordeaux", "Monbazillac", "Rutherglen"], "An old French variety unrelated to Muscat; in Rutherglen it makes Topaque.", ["still", "sweet", "fortified"]),
  grape("cabernet-sauvignon", "Cabernet Sauvignon", "red", [], "Bordeaux, France", "Late-budding and late-ripening; needs moderate-to-warm seasons and benefits from freely draining soils.", "Blackcurrant, cedar and mint; methoxypyrazines can give green pepper when less ripe. Oak adds spice and smoke.", "High tannin, high acid, deep colour and medium to full body.", ["Bordeaux Left Bank", "Napa Valley", "Coonawarra", "Maipo", "Stellenbosch", "Ningxia"], "A natural Cabernet Franc × Sauvignon Blanc crossing.", ["still"]),
  grape("merlot", "Merlot", "red", [], "Bordeaux, France", "Early-ripening and drought-sensitive; clay can retain the water it needs.", "Plum, black cherry and chocolate, becoming tobacco and dried fruit with age.", "Medium acid, medium to high tannin and full, plush body.", ["Bordeaux Right Bank", "Napa", "Washington", "Hawke’s Bay", "Chile"], "A natural offspring of Cabernet Franc and Magdeleine Noire des Charentes.", ["still"]),
  grape("cabernet-franc", "Cabernet Franc", "red", ["Breton"], "Basque country / south-west France", "Earlier-ripening than Cabernet Sauvignon; useful in cool regions but sensitive to water stress.", "Redcurrant, raspberry, violet, graphite and leafy pyrazine notes.", "High acid, medium tannin and medium body.", ["Loire", "Saint-Émilion", "Ontario", "Finger Lakes", "Argentina"], "Parent of Cabernet Sauvignon, Merlot and Carménère, making it one of the great founder varieties.", ["still"]),
  grape("petit-verdot", "Petit Verdot", "red", [], "Bordeaux, France", "Very late-ripening; unreliable in cool wet autumns but successful in warmer regions.", "Blackberry, violet, spice and graphite.", "Deep colour, high tannin and high acid.", ["Bordeaux", "Spain", "Australia", "California", "Virginia"], "Old south-western French variety of uncertain parentage.", ["still"]),
  grape("malbec", "Malbec", "red", ["Côt", "Auxerrois in Cahors"], "South-west France", "Early budding and susceptible to frost; warmth and dry conditions improve ripening.", "Black plum, violet and blackberry; high-altitude versions can be particularly floral.", "Deep colour, medium acid and medium to high tannin.", ["Mendoza", "Cahors", "Salta", "Chile"], "A natural Prunelard × Magdeleine Noire des Charentes crossing.", ["still"]),
  grape("carmenere", "Carménère", "red", ["Cabernet Gernischt in much of China"], "Bordeaux, France", "Late-ripening and needs a long dry autumn to move from green to ripe.", "Black plum, red pepper, herbs and spice.", "Deep colour, medium acid and medium tannin.", ["Chile", "Ningxia", "north-east Italy"], "A natural Cabernet Franc × Gros Cabernet crossing; long mistaken for Merlot in Chile.", ["still"]),
  grape("syrah", "Syrah", "red", ["Shiraz"], "Northern Rhône, France", "Mid-ripening and adaptable; style shifts strongly with heat and water availability.", "Blackberry, violet and smoked meat; rotundone produces black-pepper aroma, especially in cooler sites.", "Medium to high acid, medium to high tannin and deep colour.", ["Northern Rhône", "Barossa", "McLaren Vale", "Stellenbosch", "California", "Chile"], "A natural Mondeuse Blanche × Dureza crossing from south-eastern France.", ["still"]),
  grape("grenache", "Grenache", "red", ["Garnacha", "Cannonau"], "Aragón, Spain", "Late-ripening, heat- and drought-tolerant; thin skins can struggle to provide colour.", "Red cherry, strawberry, dried herbs and white pepper.", "High alcohol, medium tannin, low to medium acid and pale-to-medium colour.", ["Southern Rhône", "Priorat", "Sardinia", "McLaren Vale", "Roussillon"], "Old western Mediterranean variety with red, white and grey colour mutations.", ["still", "rosé", "fortified"]),
  grape("mourvedre", "Mourvèdre", "red", ["Monastrell", "Mataro"], "South-east Spain", "Very late-ripening and happiest in hot, sunny climates near the sea.", "Blackberry, plum, game, herbs and black pepper.", "Deep colour, high tannin, medium acid and high alcohol.", ["Bandol", "Jumilla", "Southern Rhône", "McLaren Vale"], "Old Spanish variety that travelled around the western Mediterranean.", ["still"]),
  grape("cinsault", "Cinsault", "red", ["Cinsaut"], "Southern France", "Heat- and drought-tolerant, productive and valued for soft perfume.", "Strawberry, red cherry, flowers and spice.", "Low tannin, medium acid and pale colour.", ["Southern France", "South Africa", "Lebanon", "Maule"], "Old Mediterranean variety; with Pinot Noir it produced Pinotage.", ["still", "rosé"]),
  grape("carignan", "Carignan", "red", ["Cariñena", "Mazuelo", "Carignano"], "Aragón, Spain", "Very late-ripening, drought-tolerant and naturally productive; old vines give the best balance.", "Black cherry, dried herbs, liquorice and earth.", "High acid, high tannin and deep colour.", ["Priorat", "Languedoc", "Maule", "Sardinia"], "Old Aragonese variety spread through the western Mediterranean.", ["still"]),
  grape("pinot-noir", "Pinot Noir", "red", ["Spätburgunder", "Blauburgunder"], "Burgundy, France", "Early budding and ripening; thin skins make it sensitive to rot, heat and sunburn.", "Red cherry, raspberry and violet, developing forest floor, mushroom and spice.", "High acid, low to medium tannin, pale colour and light to medium body.", ["Burgundy", "Champagne", "Oregon", "New Zealand", "Germany", "Tasmania"], "Ancient founder variety with many mutations; parent of Chardonnay, Gamay, Aligoté and Melon.", ["still", "sparkling"]),
  grape("meunier", "Meunier", "red", ["Pinot Meunier", "Schwarzriesling"], "France", "Buds later and ripens earlier than Pinot Noir, useful in frost-prone cool sites.", "Red apple, plum and floral fruit, usually softer and earlier-drinking than Pinot Noir.", "Medium acid and low to medium tannin.", ["Champagne", "England", "Germany"], "A chimeric mutation of Pinot, named for the flour-like white underside of its leaves.", ["sparkling", "still"]),
  grape("gamay", "Gamay", "red", ["Gamay Noir à Jus Blanc"], "Burgundy, France", "Early budding and ripening; granite and a moderate climate restrain its vigour.", "Red cherry, raspberry, violet and pepper; carbonic methods can add banana or kirsch-like esters.", "High acid, low tannin and light to medium body.", ["Beaujolais", "Loire", "Switzerland"], "A natural Pinot × Gouais Blanc crossing.", ["still", "rosé"]),
  grape("nebbiolo", "Nebbiolo", "red", ["Spanna", "Chiavennasca"], "Piemonte, Italy", "Early budding but extremely late-ripening; needs favourable exposures and a long autumn.", "Sour cherry, rose, tar, anise and dried herbs.", "Very high acid and tannin despite pale colour.", ["Barolo", "Barbaresco", "Valtellina", "Gattinara"], "Old Alpine-Piedmontese variety with several local biotypes and close relatives.", ["still"]),
  grape("barbera", "Barbera", "red", [], "Piemonte, Italy", "Late-ripening, productive and adaptable; retains acid in warm sites.", "Sour cherry, plum and liquorice.", "Very high acid, low to medium tannin and deep colour.", ["Asti", "Alba", "Monferrato", "Sierra Foothills"], "Old Piedmontese variety of uncertain parentage.", ["still"]),
  grape("dolcetto", "Dolcetto", "red", [], "Piemonte, Italy", "Early-ripening and useful in cooler sites where Nebbiolo would struggle.", "Black cherry, violet, almond and liquorice.", "Low to medium acid, medium to high tannin and deep colour.", ["Alba", "Dogliani", "Diano d’Alba"], "Old Piedmontese variety; the name refers to grape sweetness, not a sweet finished wine.", ["still"]),
  grape("sangiovese", "Sangiovese", "red", ["Brunello", "Prugnolo Gentile", "Morellino"], "Central Italy", "Late-ripening and site-sensitive; performs best with a long, warm season and cool nights.", "Sour cherry, red plum, tea, dried herbs and earth.", "High acid, medium to high tannin and medium colour.", ["Chianti Classico", "Montalcino", "Montepulciano", "Romagna"], "A genetically diverse old Tuscan family, likely involving Ciliegiolo and Calabrese di Montenuovo.", ["still"]),
  grape("montepulciano", "Montepulciano", "red", [], "Central Italy", "Late-ripening, productive and well adapted to Adriatic warmth.", "Black plum, blackberry, herbs and cocoa.", "Medium acid, medium to high tannin and deep colour.", ["Abruzzo", "Marche", "Molise"], "Unrelated to the Tuscan town of Montepulciano and to Sangiovese.", ["still", "rosé"]),
  grape("corvina", "Corvina", "red", ["Corvina Veronese"], "Veneto, Italy", "Late-ripening with thick skins; loose bunches and acidity suit appassimento drying.", "Sour cherry, red plum, dried herbs and almond.", "High acid, low to medium tannin and pale to medium colour.", ["Valpolicella", "Bardolino"], "Closely related to Corvinone but genetically distinct; commonly blended with Rondinella.", ["still", "sweet"]),
  grape("rondinella", "Rondinella", "red", [], "Veneto, Italy", "Productive, disease-resistant and well suited to drying.", "Red cherry, herbs and a restrained aromatic profile.", "Medium acid and tannin; valued for colour and reliability in blends.", ["Valpolicella", "Bardolino"], "A natural Corvina × unknown crossing.", ["still", "sweet"]),
  grape("aglianico", "Aglianico", "red", [], "Southern Italy", "Buds early and ripens very late; altitude extends the season without losing acid.", "Black cherry, plum, smoke, leather and dried herbs.", "Very high acid and tannin, deep colour and full body.", ["Taurasi", "Aglianico del Vulture"], "Ancient southern Italian variety; the romantic Greek-origin story is unproven.", ["still"]),
  grape("primitivo", "Primitivo", "red", ["Zinfandel", "Tribidrag"], "Dalmatian coast / Croatia", "Early and uneven ripening; accumulates sugar rapidly in warm climates.", "Blackberry, raspberry jam, pepper and dried fruit.", "Medium acid and tannin, high alcohol and full body.", ["Puglia", "California", "Dalmatia"], "Genetically the same as Zinfandel and Croatia’s Tribidrag/Crljenak Kaštelanski.", ["still", "rosé", "sweet"]),
  grape("negroamaro", "Negroamaro", "red", [], "Puglia, Italy", "Heat- and drought-tolerant, keeping useful acid in Salento.", "Black cherry, plum, dried herbs and a bittersweet finish.", "Medium to high tannin, medium acid and deep colour.", ["Salice Salentino", "Brindisi", "Squinzano"], "Old southern Italian variety of uncertain parentage.", ["still", "rosé"]),
  grape("nero-davola", "Nero d’Avola", "red", ["Calabrese"], "Sicily, Italy", "Heat- and drought-tolerant; night cooling and earlier picking protect freshness.", "Black cherry, plum, liquorice and Mediterranean herbs.", "Medium acid and tannin, deep colour and full body.", ["Noto", "Vittoria blends", "Sicily"], "Old Sicilian variety; Calabrese is its historic synonym, not evidence of Calabrian origin.", ["still"]),
  grape("nerello-mascalese", "Nerello Mascalese", "red", [], "Mount Etna, Sicily", "Very late-ripening; high volcanic elevation preserves acidity.", "Red cherry, rose, dried herbs, smoke and earth.", "High acid and tannin with relatively pale colour.", ["Etna Rosso"], "Likely a Sangiovese × Mantonico Bianco crossing, with many old field selections.", ["still"]),
  grape("frappato", "Frappato", "red", [], "South-east Sicily", "Warm-climate but aromatic, especially on sandy soils.", "Strawberry, pomegranate, flowers and herbs.", "High acid, low tannin and pale colour.", ["Vittoria", "Cerasuolo di Vittoria"], "Old Sicilian variety with uncertain parentage.", ["still"]),
  grape("tempranillo", "Tempranillo", "red", ["Tinto Fino", "Tinta del País", "Tinta de Toro", "Tinta Roriz", "Aragonez"], "Northern Spain", "Early-ripening for a black grape; altitude helps retain acid in hot continental sites.", "Strawberry, plum, leather and tobacco; American oak can add coconut and dill.", "Medium acid and tannin, medium to full body.", ["Rioja", "Ribera del Duero", "Toro", "Douro", "Alentejo"], "A natural Albillo Mayor × Benedicto crossing.", ["still"]),
  grape("graciano", "Graciano", "red", [], "Northern Spain", "Late-ripening, low-yielding and drought-resistant.", "Blackberry, violet and spice.", "High acid and tannin with deep colour.", ["Rioja", "Navarra"], "Old Iberian variety; genetically the same as Sardinia’s Bovale Sardo.", ["still"]),
  grape("bobal", "Bobal", "red", [], "Utiel-Requena, Spain", "Late-ripening, drought-resistant and productive.", "Blackberry, plum and herbs.", "High acid and tannin, very deep colour.", ["Utiel-Requena", "Manchuela"], "Old south-eastern Spanish variety of uncertain parentage.", ["still", "rosé", "sparkling"]),
  grape("mencia", "Mencía", "red", ["Jaen in Portugal"], "North-west Iberia", "Early budding and ripening; best on well-drained slopes where yields stay controlled.", "Red cherry, violet, herbs and graphite.", "High acid, medium tannin and medium body.", ["Bierzo", "Ribeira Sacra", "Valdeorras"], "Genetically the same as Portugal’s Jaen; likely descended from Alfrocheiro and Patorra.", ["still"]),
  grape("touriga-nacional", "Touriga Nacional", "red", [], "Portugal", "Late-ripening, low-yielding and heat-tolerant; small berries give high skin-to-juice ratio.", "Blackberry, violet, bergamot and herbs.", "Deep colour, high tannin and high acid.", ["Douro", "Dão", "Alentejo"], "One of Portugal’s great indigenous varieties; exact parentage remains uncertain.", ["still", "fortified"]),
  grape("touriga-franca", "Touriga Franca", "red", [], "Douro, Portugal", "Late-ripening and well adapted to hot, dry slopes.", "Blackberry, rose and herbs.", "Deep colour, medium to high tannin and a fragrant, supple frame.", ["Douro"], "Likely a natural Touriga Nacional × Marufo crossing.", ["still", "fortified"]),
  grape("tinta-barroca", "Tinta Barroca", "red", [], "Douro, Portugal", "Early-ripening and productive; best on cooler slopes because berries can shrivel in heat.", "Black plum and dark berries.", "High sugar, soft tannin and full body.", ["Douro", "South Africa"], "Old Portuguese variety used mainly as a blending component.", ["fortified", "still"]),
  grape("tinto-cao", "Tinto Cão", "red", [], "Douro, Portugal", "Late-ripening, low-yielding and resistant to heat and rot.", "Floral red fruit and spice.", "High acid and firm tannin despite modest colour.", ["Douro", "Dão"], "Ancient Portuguese variety valued as a small blending component.", ["fortified", "still"]),
  grape("baga", "Baga", "red", [], "Bairrada, Portugal", "Late-ripening and vulnerable to autumn rain; needs good exposure and crop control.", "Sour cherry, black plum, tea and smoke.", "Very high acid and tannin, deep colour.", ["Bairrada", "Dão"], "Old Portuguese variety of uncertain parentage.", ["still", "sparkling"]),
  grape("castelao", "Castelão", "red", ["Periquita"], "Southern Portugal", "Late-ripening, productive and particularly successful on warm sandy soils.", "Redcurrant, plum, herbs and leather.", "High acid, medium tannin and medium body.", ["Palmela", "Setúbal", "Tejo"], "Old Portuguese variety with many local names.", ["still"]),
  grape("trincadeira", "Trincadeira", "red", ["Tinta Amarela"], "Portugal", "Late-ripening and heat-tolerant but highly susceptible to rot if autumn turns wet.", "Black plum, herbs, pepper and flowers.", "High acid and tannin, medium colour.", ["Alentejo", "Douro"], "Old Portuguese variety; Tinta Amarela is its Douro name.", ["still", "fortified"]),
  grape("tannat", "Tannat", "red", ["Harriague"], "South-west France", "Mid-season ripening and thick-skinned; thrives in warm, sunny regions.", "Blackberry, plum, liquorice and smoke.", "Very high tannin, high acid and deep colour.", ["Madiran", "Uruguay", "Argentina"], "Old Pyrenean variety with numerous offspring in south-west France.", ["still"]),
  grape("negrette", "Négrette", "red", [], "South-west France", "Early-ripening and susceptible to rot; warm, ventilated sites suit it.", "Violet, strawberry, liquorice and pepper.", "Low acid, medium tannin and medium colour.", ["Fronton"], "Old variety whose supposed Cypriot origin is not genetically established.", ["still", "rosé"]),
  grape("xinomavro", "Xinomavro", "red", [], "Northern Greece", "Late-ripening and demanding; needs a long dry autumn.", "Sour cherry, tomato leaf, olive and rose, developing leather and earth.", "Very high acid and tannin with pale colour.", ["Naoussa", "Amyndeon", "Goumenissa"], "Ancient Greek variety with no proven relationship to Nebbiolo despite sensory similarities.", ["still", "rosé", "sparkling"]),
  grape("agiorgitiko", "Agiorgitiko", "red", ["St George"], "Nemea, Greece", "Mid-ripening and adaptable across Nemea’s elevation bands.", "Red cherry, plum, sweet spice and dried herbs.", "Medium acid and tannin, deep colour and soft texture.", ["Nemea"], "Old Peloponnesian variety of uncertain parentage.", ["still", "rosé"]),
  grape("blaufrankisch", "Blaufränkisch", "red", ["Kékfrankos", "Lemberger"], "Central Europe", "Late-ripening and vigorous; warm days and cool nights bring full flavour without losing acid.", "Black cherry, blackberry, violet and black pepper.", "High acid and tannin, deep colour.", ["Burgenland", "Hungary", "Slovenia", "Washington"], "A natural Gouais Blanc × Blaue Zimmettraube crossing; parent of Zweigelt.", ["still"]),
  grape("zweigelt", "Zweigelt", "red", [], "Austria", "Early-ripening, productive and cold-hardy; overcropping dilutes it.", "Red cherry, blackberry and pepper.", "Medium acid and tannin, medium to deep colour.", ["Burgenland", "Lower Austria", "Canada"], "A 1922 crossing of Blaufränkisch and Sankt Laurent.", ["still", "rosé"]),
  grape("sankt-laurent", "Sankt Laurent", "red", ["St. Laurent"], "Central Europe", "Early budding and mid-ripening; sensitive to frost and poor flowering.", "Sour cherry, blackberry and savoury spice.", "High acid, medium tannin and deep colour.", ["Austria", "Czech Republic", "Germany"], "A probable natural offspring or close relative of Pinot.", ["still"]),
  grape("pinotage", "Pinotage", "red", [], "South Africa", "Early-ripening and adaptable to dry, warm conditions; bunch architecture needs disease control.", "Blackberry, plum, smoke and savoury spice; stressed ferments can produce volatile nail-polish notes.", "Medium acid and high tannin with deep colour.", ["Stellenbosch", "Swartland", "Paarl"], "A 1925 Pinot Noir × Cinsault crossing made in South Africa.", ["still", "sparkling"]),
  grape("pais", "País", "red", ["Listán Prieto", "Mission", "Criolla Chica"], "Castile, Spain; spread through the Americas", "Heat- and drought-tolerant, vigorous and productive.", "Red cherry, dried herbs and earth.", "High acid, low tannin and pale colour.", ["Maule", "Itata", "Canary Islands", "California history", "Argentina"], "The same old Iberian grape travelled through the Americas under several names and parented many Criolla varieties.", ["still", "rosé"]),
  grape("marselan", "Marselan", "red", [], "Southern France", "Late-ripening, heat-tolerant and resistant to some bunch diseases.", "Blackberry, cassis, violet and spice.", "Deep colour, medium to high tannin and good acid retention.", ["Languedoc", "Ningxia", "Hebei", "Mediterranean regions"], "A 1961 Cabernet Sauvignon × Grenache crossing.", ["still"]),
  grape("lambrusco", "Lambrusco family", "red", ["Sorbara", "Salamino", "Grasparossa"], "Emilia, Italy", "Generally vigorous and high-acid; individual family members ripen and colour differently.", "Sorbara is pale and floral; Salamino gives bright berry fruit; Grasparossa is darker and more tannic.", "Naturally high acid; from light rosato to deeply coloured frothy red.", ["Modena", "Reggio Emilia", "Parma"], "A family of distinct local varieties rather than one grape; the three headline members are not synonyms.", ["sparkling", "still"]),
  grape("schiava", "Schiava", "red", ["Vernatsch", "Trollinger"], "Alpine north-east Italy", "Late-ripening and vigorous; warm sheltered valleys are needed.", "Strawberry, red cherry and almond.", "High acid, low tannin and pale colour.", ["Alto Adige", "Württemberg"], "A group of closely related Alpine varieties rather than one uniform clone.", ["still"]),
  grape("lagrein", "Lagrein", "red", [], "Alto Adige, Italy", "Late-ripening and best in the warm basin around Bolzano.", "Blackberry, violet, cocoa and earth.", "High tannin, medium to high acid and very deep colour.", ["Alto Adige"], "A natural Teroldego × unknown crossing and therefore related to Syrah through the Alpine family.", ["still", "rosé"]),
  grape("teroldego", "Teroldego", "red", [], "Trentino, Italy", "Late-ripening and best on warm, stony valley floors.", "Black cherry, blackberry, violet and herbs.", "High acid, medium tannin and deep colour.", ["Campo Rotaliano"], "A parent of Lagrein and a close relative within the Mondeuse/Syrah extended family.", ["still"]),
  grape("sagrantino", "Sagrantino", "red", [], "Umbria, Italy", "Late-ripening, thick-skinned and adapted to warm inland hills.", "Black plum, blackberry, dried herbs and spice.", "Exceptionally high tannin, medium to high acid and deep colour.", ["Montefalco"], "Old Umbrian variety of uncertain parentage.", ["still", "sweet"]),
  grape("blauburgunder-family", "Pinot-family colour mutations", "pink", ["Pinot Blanc", "Pinot Gris", "Pinot Noir"], "Burgundy, France", "Early budding and ripening; highly sensitive to site and clonal material.", "The same underlying genome can express red, grey-pink or white berries, producing very different-looking wines.", "Structure depends on berry colour and winemaking, but the family generally preserves lively acidity.", ["Burgundy", "Alsace", "Germany", "Alto Adige", "Champagne"], "Pinot Blanc and Pinot Gris are colour mutations of Pinot Noir, not crosses with another parent.", ["still", "sparkling"]),
];

export const wineGrapeCount = wineGrapes.length;

export type WineGrapeUse = {
  areaHectares: number | null;
  dataYear: 2000 | 2010 | 2016 | 2023 | null;
  kind?: "variety" | "family-total" | "family-reference";
  sourceName?: string;
};

/**
 * Global bearing area is the clearest comparable proxy for how commonly a
 * variety is used. Figures come from the University of Adelaide's 2025
 * release of the global winegrape bearing-area database. Most are 2023
 * estimates; Carricante uses the latest reported figure in that series.
 *
 * Family labels are handled separately. The Lambrusco figure combines the
 * five principal named Lambrusco varieties in the dataset. Malvasia and the
 * Pinot colour-mutation reference are not single varieties, so assigning one
 * area or ordinal rank would be misleading.
 */
export const wineGrapeUseById: Record<string, WineGrapeUse> = {
  "chardonnay": { areaHectares: 222926.5, dataYear: 2023 },
  "sauvignon-blanc": { areaHectares: 144031.0, dataYear: 2023 },
  "riesling": { areaHectares: 53420.8, dataYear: 2023 },
  "chenin-blanc": { areaHectares: 30859.3, dataYear: 2023 },
  "semillon": { areaHectares: 16986.1, dataYear: 2023 },
  "pinot-gris": { areaHectares: 67930.4, dataYear: 2023 },
  "gewurztraminer": { areaHectares: 14089.0, dataYear: 2023 },
  "gruner-veltliner": { areaHectares: 19082.4, dataYear: 2023 },
  "viognier": { areaHectares: 13556.6, dataYear: 2023 },
  "marsanne": { areaHectares: 1450.2, dataYear: 2023 },
  "roussanne": { areaHectares: 2367.1, dataYear: 2023 },
  "muscat-blanc": { areaHectares: 36052.2, dataYear: 2023 },
  "melon": { areaHectares: 8594.1, dataYear: 2023, sourceName: "Melon" },
  "aligote": { areaHectares: 24989.6, dataYear: 2023 },
  "savagnin": { areaHectares: 1343.7, dataYear: 2023, sourceName: "Savagnin Blanc" },
  "albarino": { areaHectares: 10657.1, dataYear: 2023, sourceName: "Alvarinho" },
  "godello": { areaHectares: 3061.2, dataYear: 2023 },
  "verdejo": { areaHectares: 25320.1, dataYear: 2023 },
  "airen": { areaHectares: 190426.0, dataYear: 2023 },
  "palomino": { areaHectares: 14217.3, dataYear: 2023, sourceName: "Palomino Fino" },
  "pedro-ximenez": { areaHectares: 7161.4, dataYear: 2023 },
  "macabeo": { areaHectares: 58160.2, dataYear: 2023 },
  "xarel-lo": { areaHectares: 11229.0, dataYear: 2023 },
  "parellada": { areaHectares: 9351.0, dataYear: 2023 },
  "furmint": { areaHectares: 4218.9, dataYear: 2023 },
  "harslevelu": { areaHectares: 1315.0, dataYear: 2023 },
  "assyrtiko": { areaHectares: 2164.5, dataYear: 2023 },
  "moschofilero": { areaHectares: 1824.4, dataYear: 2023 },
  "garganega": { areaHectares: 13389.1, dataYear: 2023 },
  "glera": { areaHectares: 41990.1, dataYear: 2023, sourceName: "Prosecco" },
  "cortese": { areaHectares: 3363.0, dataYear: 2023 },
  "arneis": { areaHectares: 1269.6, dataYear: 2023 },
  "verdicchio": { areaHectares: 4701.6, dataYear: 2023, sourceName: "Verdicchio Bianco" },
  "vermentino": { areaHectares: 18128.8, dataYear: 2023 },
  "trebbiano-toscano": { areaHectares: 148576.3, dataYear: 2023 },
  "fiano": { areaHectares: 2798.9, dataYear: 2023 },
  "greco": { areaHectares: 2391.4, dataYear: 2023 },
  "falanghina": { areaHectares: 5353.0, dataYear: 2023, sourceName: "Falanghina Flegrea" },
  "carricante": { areaHectares: 34.8, dataYear: 2016 },
  "catarratto": { areaHectares: 31125.0, dataYear: 2023, sourceName: "Catarratto Bianco" },
  "grillo": { areaHectares: 9482.0, dataYear: 2023 },
  "ribolla-gialla": { areaHectares: 2050.2, dataYear: 2023 },
  "friulano": { areaHectares: 3532.4, dataYear: 2023, sourceName: "Sauvignonasse" },
  "encruzado": { areaHectares: 737.5, dataYear: 2023 },
  "antao-vaz": { areaHectares: 1768.0, dataYear: 2023 },
  "loureiro": { areaHectares: 7536.8, dataYear: 2023 },
  "arinto": { areaHectares: 6440.3, dataYear: 2023, sourceName: "Arinto de Bucelas" },
  "torrontes": { areaHectares: 7914.0, dataYear: 2023 },
  "bacchus": { areaHectares: 2985.2, dataYear: 2023 },
  "silvaner": { areaHectares: 6249.2, dataYear: 2023 },
  "sercial": { areaHectares: 85.3, dataYear: 2023 },
  "verdelho": { areaHectares: 1566.2, dataYear: 2023 },
  "boal": { areaHectares: 2541.5, dataYear: 2023, sourceName: "Malvasia Fina" },
  "malvasia": { areaHectares: null, dataYear: null, kind: "family-reference" },
  "muscadelle": { areaHectares: 1594.9, dataYear: 2023 },
  "cabernet-sauvignon": { areaHectares: 279478.5, dataYear: 2023 },
  "merlot": { areaHectares: 257778.3, dataYear: 2023 },
  "cabernet-franc": { areaHectares: 45294.7, dataYear: 2023 },
  "petit-verdot": { areaHectares: 9606.0, dataYear: 2023 },
  "malbec": { areaHectares: 60411.6, dataYear: 2023, sourceName: "Côt" },
  "carmenere": { areaHectares: 14824.1, dataYear: 2023 },
  "syrah": { areaHectares: 189409.0, dataYear: 2023 },
  "grenache": { areaHectares: 154374.8, dataYear: 2023, sourceName: "Garnacha Tinta" },
  "mourvedre": { areaHectares: 44051.3, dataYear: 2023, sourceName: "Monastrell" },
  "cinsault": { areaHectares: 27189.2, dataYear: 2023, sourceName: "Cinsaut" },
  "carignan": { areaHectares: 43601.9, dataYear: 2023, sourceName: "Mazuelo" },
  "pinot-noir": { areaHectares: 131982.6, dataYear: 2023 },
  "meunier": { areaHectares: 23037.1, dataYear: 2023, sourceName: "Pinot Meunier" },
  "gamay": { areaHectares: 23127.0, dataYear: 2023, sourceName: "Gamay Noir" },
  "nebbiolo": { areaHectares: 7364.2, dataYear: 2023 },
  "barbera": { areaHectares: 19661.6, dataYear: 2023 },
  "dolcetto": { areaHectares: 4264.8, dataYear: 2023 },
  "sangiovese": { areaHectares: 66769.4, dataYear: 2023 },
  "montepulciano": { areaHectares: 30889.1, dataYear: 2023 },
  "corvina": { areaHectares: 7362.0, dataYear: 2023, sourceName: "Corvina Veronese" },
  "rondinella": { areaHectares: 2784.1, dataYear: 2023 },
  "aglianico": { areaHectares: 9603.9, dataYear: 2023 },
  "primitivo": { areaHectares: 30675.1, dataYear: 2023, sourceName: "Tribidrag" },
  "negroamaro": { areaHectares: 10852.1, dataYear: 2023 },
  "nero-davola": { areaHectares: 20192.5, dataYear: 2023 },
  "nerello-mascalese": { areaHectares: 2990.0, dataYear: 2023 },
  "frappato": { areaHectares: 821.0, dataYear: 2023 },
  "tempranillo": { areaHectares: 226804.9, dataYear: 2023 },
  "graciano": { areaHectares: 3225.3, dataYear: 2023 },
  "bobal": { areaHectares: 53452.0, dataYear: 2023 },
  "mencia": { areaHectares: 11628.7, dataYear: 2023 },
  "touriga-nacional": { areaHectares: 13591.3, dataYear: 2023 },
  "touriga-franca": { areaHectares: 15145.9, dataYear: 2023 },
  "tinta-barroca": { areaHectares: 3235.5, dataYear: 2023 },
  "tinto-cao": { areaHectares: 367.0, dataYear: 2023 },
  "baga": { areaHectares: 7202.7, dataYear: 2023 },
  "castelao": { areaHectares: 8989.8, dataYear: 2023 },
  "trincadeira": { areaHectares: 6897.5, dataYear: 2023 },
  "tannat": { areaHectares: 4862.0, dataYear: 2023 },
  "negrette": { areaHectares: 400.0, dataYear: 2023 },
  "xinomavro": { areaHectares: 2167.2, dataYear: 2023 },
  "agiorgitiko": { areaHectares: 3157.7, dataYear: 2023 },
  "blaufrankisch": { areaHectares: 15713.7, dataYear: 2023 },
  "zweigelt": { areaHectares: 8483.3, dataYear: 2023 },
  "sankt-laurent": { areaHectares: 2749.1, dataYear: 2023 },
  "pinotage": { areaHectares: 6628.5, dataYear: 2023 },
  "pais": { areaHectares: 10968.5, dataYear: 2023, sourceName: "Listán Prieto" },
  "marselan": { areaHectares: 10322.2, dataYear: 2023 },
  "lambrusco": { areaHectares: 15308.9, dataYear: 2023, kind: "family-total", sourceName: "five principal Lambrusco varieties" },
  "schiava": { areaHectares: 2089.2, dataYear: 2023, sourceName: "Schiava Grossa" },
  "lagrein": { areaHectares: 636.7, dataYear: 2023 },
  "teroldego": { areaHectares: 1223.0, dataYear: 2023 },
  "sagrantino": { areaHectares: 1117.4, dataYear: 2023 },
  "blauburgunder-family": { areaHectares: null, dataYear: null, kind: "family-reference" },
};

const rankedWineGrapeIds = wineGrapes
  .filter((grapeItem) => {
    const usage = wineGrapeUseById[grapeItem.id];
    return usage?.areaHectares != null && usage.kind !== "family-total";
  })
  .sort((left, right) => {
    const leftArea = wineGrapeUseById[left.id]?.areaHectares ?? -1;
    const rightArea = wineGrapeUseById[right.id]?.areaHectares ?? -1;
    return rightArea - leftArea;
  })
  .map((grapeItem) => grapeItem.id);

export const wineGrapeUseRankById = Object.fromEntries(
  rankedWineGrapeIds.map((id, index) => [id, index + 1]),
) as Record<string, number>;
