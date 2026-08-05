/**
 * Photographs and ampelography plates for the grape atlas.
 *
 * Every image here comes from Wikimedia Commons under a free licence — public
 * domain, CC0, CC BY or CC BY-SA. Roughly a quarter are plates from Viala and
 * Vermorel's Ampelographie (1901-1910), which is out of copyright and, being
 * drawn rather than photographed, shows bunch and leaf shape far more clearly
 * than a snapshot does.
 *
 * Each image was checked by eye before being committed: an earlier automated
 * pass happily returned wine bottles, a road sign and a painting of Bacchus.
 * Varieties with no verified image are simply absent here, and the atlas falls
 * back to its colour marker for those.
 *
 * CC BY-SA requires the credit and licence to travel with the image, which is
 * why both are stored alongside the file and rendered by WineGrapeAtlas.
 */
export type WineGrapeImage = {
  file: string;
  thumb: string;
  credit: string;
  license: string;
  sourceUrl: string;
};

export const wineGrapeImages: Record<string, WineGrapeImage> = {
  "agiorgitiko": { file: "/grapes/agiorgitiko.webp", thumb: "/grapes/thumbs/agiorgitiko.webp", credit: "Elisavetch at Greek Wikipedia", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:AGIORGITIKO.jpg" },
  "aglianico": { file: "/grapes/aglianico.webp", thumb: "/grapes/thumbs/aglianico.webp", credit: "Alexis Kreyder", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:Aglianico_Viala_Vermorel.jpg" },
  "albarino": { file: "/grapes/albarino.webp", thumb: "/grapes/thumbs/albarino.webp", credit: "Miguel Queimado", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:Cacho.JPG" },
  "aligote": { file: "/grapes/aligote.webp", thumb: "/grapes/thumbs/aligote.webp", credit: "Jules Troncy", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:Aligot%C3%A9_Viala_Vermorel.jpg" },
  "antao-vaz": { file: "/grapes/antao-vaz.webp", thumb: "/grapes/thumbs/antao-vaz.webp", credit: "Wines of Portugal, i.V. Marie-Luise Bächle", license: "CC BY 3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Antao_Vaz.jpg" },
  "arinto": { file: "/grapes/arinto.webp", thumb: "/grapes/thumbs/arinto.webp", credit: "Jules Troncy", license: "CC0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Arintho_-_Amp%C3%A9lographie.png" },
  "bacchus": { file: "/grapes/bacchus.webp", thumb: "/grapes/thumbs/bacchus.webp", credit: "Dr. Joachim Schmid, FG RZ, FA Geisenheim", license: "CC BY-SA 3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Bacchus_04c_3.jpg" },
  "baga": { file: "/grapes/baga.webp", thumb: "/grapes/thumbs/baga.webp", credit: "Wines of Portugal, i. V. Marie-Luise Bächle", license: "CC BY 3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Baga.jpg" },
  "barbera": { file: "/grapes/barbera.webp", thumb: "/grapes/thumbs/barbera.webp", credit: "Giorgio Gallesio", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:Uva_Barbera_-_Giorgio_Gallesio.jpg" },
  "blauburgunder-family": { file: "/grapes/blauburgunder-family.webp", thumb: "/grapes/thumbs/blauburgunder-family.webp", credit: "Jules Troncy", license: "CC0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Pinot_blanc_-_Amp%C3%A9lographie.jpg" },
  "blaufrankisch": { file: "/grapes/blaufrankisch.webp", thumb: "/grapes/thumbs/blaufrankisch.webp", credit: "Alexis Kreyder", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:Blaufrankisch_Viala_Vermorel.jpg" },
  "boal": { file: "/grapes/boal.webp", thumb: "/grapes/thumbs/boal.webp", credit: "Alexis Kreyder", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:Boal.jpg" },
  "bobal": { file: "/grapes/bobal.webp", thumb: "/grapes/thumbs/bobal.webp", credit: "No machine-readable author provided. Chateau bobal~commonswiki assumed (based on copyright", license: "CC BY-SA 2.5", sourceUrl: "https://commons.wikimedia.org/wiki/File:Racimo_bobal_PERFECTO.jpg" },
  "cabernet-franc": { file: "/grapes/cabernet-franc.webp", thumb: "/grapes/thumbs/cabernet-franc.webp", credit: "Rosenzweig", license: "CC BY-SA 3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Cabernet_Franc_Weinsberg_20060909.jpg" },
  "cabernet-sauvignon": { file: "/grapes/cabernet-sauvignon.webp", thumb: "/grapes/thumbs/cabernet-sauvignon.webp", credit: "Jules Troncy", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:Cabernet_sauvignon_Viala_Vermorel.jpg" },
  "carignan": { file: "/grapes/carignan.webp", thumb: "/grapes/thumbs/carignan.webp", credit: "Viala et Vermorel", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:Carignan_Viala_et_Vermorel.jpg" },
  "carmenere": { file: "/grapes/carmenere.webp", thumb: "/grapes/thumbs/carmenere.webp", credit: "Jules Troncy", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:Carm%C3%A9n%C3%A8re_Viala_Vermorel.jpg" },
  "chardonnay": { file: "/grapes/chardonnay.webp", thumb: "/grapes/thumbs/chardonnay.webp", credit: "Victor Vermorel, Pierre Viala", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:Chardonnay_Viala_u._Vermorel_1901_-_1910.jpg" },
  "chenin-blanc": { file: "/grapes/chenin-blanc.webp", thumb: "/grapes/thumbs/chenin-blanc.webp", credit: "Viala et Vermorel", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:Chenin_blanc_Viala_et_Vermorel.jpg" },
  "cinsault": { file: "/grapes/cinsault.webp", thumb: "/grapes/thumbs/cinsault.webp", credit: "JPS68 via photoshop", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:Cinsault.jpg" },
  "corvina": { file: "/grapes/corvina.webp", thumb: "/grapes/thumbs/corvina.webp", credit: "Jonathanischoice at English Wikipedia", license: "CC BY-SA 4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Corvina_bunches_in_august_valpolicella_region.jpg" },
  "dolcetto": { file: "/grapes/dolcetto.webp", thumb: "/grapes/thumbs/dolcetto.webp", credit: "Agne27", license: "CC BY-SA 3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Dolcetto_grapes.JPG" },
  "encruzado": { file: "/grapes/encruzado.webp", thumb: "/grapes/thumbs/encruzado.webp", credit: "Wines of Portugal, i.V. Marie-Luise Bächle", license: "CC BY 3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Encruzado.jpg" },
  "fiano": { file: "/grapes/fiano.webp", thumb: "/grapes/thumbs/fiano.webp", credit: "Viala et Vermorel", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:Fiano.jpg" },
  "friulano": { file: "/grapes/friulano.webp", thumb: "/grapes/thumbs/friulano.webp", credit: "Please note: This photo can be reproduced. Please quote the source as indicated below: Urs", license: "CC BY-SA 4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:VIVC12543_FRIULANO_Cluster_in_the_field_17025.jpg" },
  "furmint": { file: "/grapes/furmint.webp", thumb: "/grapes/thumbs/furmint.webp", credit: "Vermorel et Viala", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:Furmint.jpg" },
  "gamay": { file: "/grapes/gamay.webp", thumb: "/grapes/thumbs/gamay.webp", credit: "Viking59", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:Gamay.jpg" },
  "garganega": { file: "/grapes/garganega.webp", thumb: "/grapes/thumbs/garganega.webp", credit: "Giacomino Timillero", license: "CC BY-SA 3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Garganega_Recioto_di_Gambellara.png" },
  "gewurztraminer": { file: "/grapes/gewurztraminer.webp", thumb: "/grapes/thumbs/gewurztraminer.webp", credit: "Viala et Vermorel", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:Gew%C3%BCrztramine_Viala_et_Vermorelr.jpg" },
  "graciano": { file: "/grapes/graciano.webp", thumb: "/grapes/thumbs/graciano.webp", credit: "Jules Troncy", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:Graciano_Viala_et_Vermorel.jpg" },
  "grenache": { file: "/grapes/grenache.webp", thumb: "/grapes/thumbs/grenache.webp", credit: "Jules Troncy", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:Grenache_N.jpg" },
  "gruner-veltliner": { file: "/grapes/gruner-veltliner.webp", thumb: "/grapes/thumbs/gruner-veltliner.webp", credit: "Rosenzweig", license: "CC BY-SA 3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Gruener_Veltliner_Weinsberg_20060909.jpg" },
  "harslevelu": { file: "/grapes/harslevelu.webp", thumb: "/grapes/thumbs/harslevelu.webp", credit: "Monika", license: "CC BY-SA 2.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:H%C3%A1rslevelu_grapes.jpg" },
  "lagrein": { file: "/grapes/lagrein.webp", thumb: "/grapes/thumbs/lagrein.webp", credit: "Nathan Jones", license: "CC BY 2.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Lagrein_vines_at_Gisborne_Peak.jpg" },
  "macabeo": { file: "/grapes/macabeo.webp", thumb: "/grapes/thumbs/macabeo.webp", credit: "Viala et Vermorel", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:Maccabeo_blanc.jpg" },
  "malbec": { file: "/grapes/malbec.webp", thumb: "/grapes/thumbs/malbec.webp", credit: "Ian L", license: "CC BY 2.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Malbec_grapes.jpg" },
  "malvasia": { file: "/grapes/malvasia.webp", thumb: "/grapes/thumbs/malvasia.webp", credit: "No machine-readable author provided. Scops~commonswiki assumed (based on copyright claims)", license: "CC BY-SA 3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Malvasia_grapes_(cropped).JPG" },
  "marsanne": { file: "/grapes/marsanne.webp", thumb: "/grapes/thumbs/marsanne.webp", credit: "Jules Troncy", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:Marsanne_viala_et_vermorel.jpg" },
  "marselan": { file: "/grapes/marselan.webp", thumb: "/grapes/thumbs/marselan.webp", credit: "Vbecart", license: "CC BY-SA 3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Marselan.jpg" },
  "melon": { file: "/grapes/melon.webp", thumb: "/grapes/thumbs/melon.webp", credit: "Cyril5555", license: "CC BY-SA 3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Melon_de_bourgogne.jpg" },
  "mencia": { file: "/grapes/mencia.webp", thumb: "/grapes/thumbs/mencia.webp", credit: "SanchoPanzaXXI", license: "CC BY-SA 3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Uva_Mencia.JPG" },
  "merlot": { file: "/grapes/merlot.webp", thumb: "/grapes/thumbs/merlot.webp", credit: "Unknown author", license: "CC BY-SA 3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Merlot_Grape.jpg" },
  "meunier": { file: "/grapes/meunier.webp", thumb: "/grapes/thumbs/meunier.webp", credit: "Igor Zemljič (IgorvonLenart at sl.wikipedia)", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:22_Mullerrebe.jpg" },
  "montepulciano": { file: "/grapes/montepulciano.webp", thumb: "/grapes/thumbs/montepulciano.webp", credit: "Ra Boe", license: "CC BY-SA 3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Montepulciano_d_Abruzzo_03_(RaBoe).jpg" },
  "moschofilero": { file: "/grapes/moschofilero.webp", thumb: "/grapes/thumbs/moschofilero.webp", credit: "Elisavetch at Greek Wikipedia", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:MOSCHOFILERO.jpg" },
  "mourvedre": { file: "/grapes/mourvedre.webp", thumb: "/grapes/thumbs/mourvedre.webp", credit: "Pancrat", license: "CC BY-SA 3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Balzac_noir-mourvedre.jpg" },
  "muscat-blanc": { file: "/grapes/muscat-blanc.webp", thumb: "/grapes/thumbs/muscat-blanc.webp", credit: "Viala et Vermorel", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:Muscat_blanc_%C3%A0_petits_grains_Viala_et_Vermorel.jpg" },
  "nebbiolo": { file: "/grapes/nebbiolo.webp", thumb: "/grapes/thumbs/nebbiolo.webp", credit: "Hanna", license: "CC BY 2.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Close_up_of_Nebbiolo_cluster_in_Italy.jpg" },
  "negroamaro": { file: "/grapes/negroamaro.webp", thumb: "/grapes/thumbs/negroamaro.webp", credit: "Please note: This photo can be reproduced. Please quote the source as indicated below: Dor", license: "CC BY-SA 4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:VIVC8456_NEGRO_AMARO_Cluster_in_the_laboratory_7744.jpg" },
  "nero-davola": { file: "/grapes/nero-davola.webp", thumb: "/grapes/thumbs/nero-davola.webp", credit: "Fabio Ingrosso from Italy", license: "CC BY 2.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Grappolo_di_Nero_d%27Avola.jpg" },
  "pais": { file: "/grapes/pais.webp", thumb: "/grapes/thumbs/pais.webp", credit: "Alexis Kreyder", license: "CC0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Mission_-_Amp%C3%A9lographie.jpg" },
  "palomino": { file: "/grapes/palomino.webp", thumb: "/grapes/thumbs/palomino.webp", credit: "Viala et Vermorel", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:Palomino_Viala_et_Vermorel.jpg" },
  "parellada": { file: "/grapes/parellada.webp", thumb: "/grapes/thumbs/parellada.webp", credit: "Justus Hayes", license: "CC BY 2.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:St._Sadurni_d%27Anoia_-_white_grapes.jpg" },
  "pedro-ximenez": { file: "/grapes/pedro-ximenez.webp", thumb: "/grapes/thumbs/pedro-ximenez.webp", credit: "Viala et Vermorel", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:Pedro-ximenes_Viala_et_Vermorel.jpg" },
  "petit-verdot": { file: "/grapes/petit-verdot.webp", thumb: "/grapes/thumbs/petit-verdot.webp", credit: "Eric 先魁 Hwang", license: "CC BY 2.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:01_Petit_verdot.jpg" },
  "pinot-gris": { file: "/grapes/pinot-gris.webp", thumb: "/grapes/thumbs/pinot-gris.webp", credit: "Andy / Andrew Fogg", license: "CC BY 2.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Pinot_Gris_close.JPG" },
  "pinot-noir": { file: "/grapes/pinot-noir.webp", thumb: "/grapes/thumbs/pinot-noir.webp", credit: "Pierre Viala (1859-1936), Victor Vermorel (1848-1927)", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:Pinot_Noir_(Viala_Vermorel).jpg" },
  "pinotage": { file: "/grapes/pinotage.webp", thumb: "/grapes/thumbs/pinotage.webp", credit: "Please note: This photo can be reproduced. Please quote the source as indicated below: Dor", license: "CC BY-SA 4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:VIVC9286_PINOTAGE_Full_plant_3638.jpg" },
  "primitivo": { file: "/grapes/primitivo.webp", thumb: "/grapes/thumbs/primitivo.webp", credit: "Anachronist", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:Zinfandel_grapes.jpg" },
  "riesling": { file: "/grapes/riesling.webp", thumb: "/grapes/thumbs/riesling.webp", credit: "No machine-readable author provided. T.o.m.~commonswiki assumed (based on copyright claims", license: "CC BY-SA 3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Riesling_grapes_leaves.jpg" },
  "roussanne": { file: "/grapes/roussanne.webp", thumb: "/grapes/thumbs/roussanne.webp", credit: "Jules Troncy", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:Roussanne.jpg" },
  "sagrantino": { file: "/grapes/sagrantino.webp", thumb: "/grapes/thumbs/sagrantino.webp", credit: "Zyance", license: "CC BY-SA 2.5", sourceUrl: "https://commons.wikimedia.org/wiki/File:Montefalco_z09.jpg" },
  "sangiovese": { file: "/grapes/sangiovese.webp", thumb: "/grapes/thumbs/sangiovese.webp", credit: "Francesco Sgroi", license: "CC BY 2.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Sangiovese_grapevine.jpg" },
  "sankt-laurent": { file: "/grapes/sankt-laurent.webp", thumb: "/grapes/thumbs/sankt-laurent.webp", credit: "Viala et Vermorel", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:Pinot_Saint_Laurent.jpg" },
  "sauvignon-blanc": { file: "/grapes/sauvignon-blanc.webp", thumb: "/grapes/thumbs/sauvignon-blanc.webp", credit: "User:Vl", license: "CC BY-SA 3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Sauvignon_blanc_vlasotince_vineyards.jpg" },
  "savagnin": { file: "/grapes/savagnin.webp", thumb: "/grapes/thumbs/savagnin.webp", credit: "Arnaud 25", license: "CC BY-SA 4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:C%C3%A9page_savagnin.JPG" },
  "schiava": { file: "/grapes/schiava.webp", thumb: "/grapes/thumbs/schiava.webp", credit: "Jules Troncy", license: "CC0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Schiava_-_Amp%C3%A9lographie.jpg" },
  "semillon": { file: "/grapes/semillon.webp", thumb: "/grapes/thumbs/semillon.webp", credit: "Alison Parks-Whitfield", license: "CC BY 2.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Semillon_wine_grapes.jpg" },
  "sercial": { file: "/grapes/sercial.webp", thumb: "/grapes/thumbs/sercial.webp", credit: "Alexis Kreyder", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:Sercial.jpg" },
  "silvaner": { file: "/grapes/silvaner.webp", thumb: "/grapes/thumbs/silvaner.webp", credit: "Viala et Vermorel", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:Sylvaner_Viala_et_Vermorel.jpg" },
  "syrah": { file: "/grapes/syrah.webp", thumb: "/grapes/thumbs/syrah.webp", credit: "JPS68 via photoshop", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:Syrah.jpg" },
  "tannat": { file: "/grapes/tannat.webp", thumb: "/grapes/thumbs/tannat.webp", credit: "Viala et Verlorel", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:Tannat_Viala_et_Vermorel.jpg" },
  "tempranillo": { file: "/grapes/tempranillo.webp", thumb: "/grapes/thumbs/tempranillo.webp", credit: "Viala et Vermorel", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:Tempranillo_Viala_et_Vermorel.jpg" },
  "tinta-barroca": { file: "/grapes/tinta-barroca.webp", thumb: "/grapes/thumbs/tinta-barroca.webp", credit: "Wines of Portugal, i. V. Marie-Luise Bächle", license: "CC BY 3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Tinta_Barroca.jpg" },
  "tinto-cao": { file: "/grapes/tinto-cao.webp", thumb: "/grapes/thumbs/tinto-cao.webp", credit: "Alexis Kreyder", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:Tinto_c%C3%A3o_par_Alexis_Kreyder.jpg" },
  "torrontes": { file: "/grapes/torrontes.webp", thumb: "/grapes/thumbs/torrontes.webp", credit: "Jnurin Justin Nurin", license: "CC BY-SA 3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Torrontes.JPG" },
  "touriga-nacional": { file: "/grapes/touriga-nacional.webp", thumb: "/grapes/thumbs/touriga-nacional.webp", credit: "Wines of Portugal, i. V. Marie-Luise Bächle", license: "CC BY 3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Touriga_Nacional.jpg" },
  "trebbiano-toscano": { file: "/grapes/trebbiano-toscano.webp", thumb: "/grapes/thumbs/trebbiano-toscano.webp", credit: "Giaccai", license: "CC BY-SA 3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Grappolo_di_uva_trebbiano.jpg" },
  "trincadeira": { file: "/grapes/trincadeira.webp", thumb: "/grapes/thumbs/trincadeira.webp", credit: "Alexis Kreyder", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:Tinta_amarella_Viala_et_Vermorel.jpg" },
  "verdelho": { file: "/grapes/verdelho.webp", thumb: "/grapes/thumbs/verdelho.webp", credit: "José Luís Ávila Silveira/Pedro Noronha e Costa", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:Cacho_de_uvas_da_Casta_Verdelho.JPG" },
  "verdicchio": { file: "/grapes/verdicchio.webp", thumb: "/grapes/thumbs/verdicchio.webp", credit: "tongeron91", license: "CC BY-SA 2.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Grappe_de_Verdicchio_(Marche_-Italie).jpg" },
  "vermentino": { file: "/grapes/vermentino.webp", thumb: "/grapes/thumbs/vermentino.webp", credit: "Giorgio Gallesio", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:Uva_Vermentino_-_Giorgio_Gallesio.jpg" },
  "viognier": { file: "/grapes/viognier.webp", thumb: "/grapes/thumbs/viognier.webp", credit: "Viala et Vermorel", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:Viognier_Viala_et_Vermorel.jpg" },
  "xarel-lo": { file: "/grapes/xarel-lo.webp", thumb: "/grapes/thumbs/xarel-lo.webp", credit: "batega", license: "CC BY 2.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Xarel_lo_Cava_grapes.jpg" },
  "zweigelt": { file: "/grapes/zweigelt.webp", thumb: "/grapes/thumbs/zweigelt.webp", credit: "Bauer Karl", license: "CC BY 3.0 at", sourceUrl: "https://commons.wikimedia.org/wiki/File:Zweigelt_DSC_4458.JPG" },
};

export const wineGrapeImageCount = Object.keys(wineGrapeImages).length;
