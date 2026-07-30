#!/usr/bin/env python3
"""Build the compact boundary layer used by the wine guide.

The inputs are deliberately kept outside the repository because the original
GIS files are large. The resulting JSON is a simplified, screen-scale atlas:
legal PDO/GI/AVA geometry where an open layer exists, and real administrative
geometry grouped into an explicitly labelled atlas redraw elsewhere.
"""

from __future__ import annotations

import csv
import json
import math
import sqlite3
from collections import defaultdict
from pathlib import Path

from pyproj import Transformer
from shapely import wkb
from shapely.geometry import GeometryCollection, MultiPolygon, Polygon, box, mapping, shape
from shapely.ops import transform, unary_union


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "data" / "wine-region-boundaries.json"

PDO_GPKG = Path("/tmp/EU_PDO.gpkg")
PDO_CSV = Path("/tmp/PDO_EU_id.csv")
AUSTRALIA_REGIONS = Path("/tmp/wine-australia-regions.geojson")
AUSTRALIA_TASMANIA = Path("/tmp/wine-australia-tasmania.geojson")
USA_AVAS = Path("/tmp/ucd-ava/avas_aggregated_files/avas.geojson")
ADMIN = Path("/tmp/wine-admin")


EUROPE_CENTRES: dict[str, dict[str, tuple[float, float]]] = {
    "FR": {
        "fr-bordeaux": (-0.58, 44.84),
        "fr-burgundy": (4.84, 47.05),
        "fr-champagne": (4.0, 49.05),
        "fr-beaujolais": (4.7, 46.12),
        "fr-alsace": (7.3, 48.2),
        "fr-loire": (0.7, 47.4),
        "fr-northern-rhone": (4.82, 45.25),
        "fr-southern-rhone": (4.83, 44.05),
        "fr-provence": (5.75, 43.45),
        "fr-languedoc-roussillon": (3.0, 43.3),
        "fr-southwest": (0.5, 44.0),
        "fr-jura": (5.72, 46.72),
    },
    "IT": {
        "it-alto-adige": (11.35, 46.5),
        "it-trentino": (11.12, 46.08),
        "it-friuli": (13.2, 46.0),
        "it-veneto": (11.0, 45.55),
        "it-piedmont": (8.0, 44.7),
        "it-lombardy": (10.1, 45.5),
        "it-liguria": (8.5, 44.1),
        "it-emilia-romagna": (11.0, 44.5),
        "it-tuscany": (11.25, 43.1),
        "it-marche-abruzzo": (13.2, 43.0),
        "it-umbria-lazio": (12.55, 42.5),
        "it-campania": (14.85, 40.9),
        "it-puglia-basilicata": (16.3, 40.6),
        "it-sicily": (14.1, 37.6),
        "it-sardinia": (9.0, 40.0),
    },
    "ES": {
        "es-rioja": (-2.55, 42.45),
        "es-ribera": (-3.7, 41.65),
        "es-rueda-toro": (-5.0, 41.2),
        "es-rias-baixas": (-8.7, 42.35),
        "es-ribeira-sacra": (-7.5, 42.45),
        "es-bierzo": (-6.65, 42.6),
        "es-priorat-montsant": (0.75, 41.15),
        "es-penedes-cava": (1.7, 41.4),
        "es-jerez": (-6.15, 36.7),
        "es-levant": (-0.8, 38.5),
    },
    "PT": {
        "pt-vinho-verde": (-8.35, 41.5),
        "pt-douro": (-7.55, 41.15),
        "pt-dao": (-7.9, 40.55),
        "pt-bairrada": (-8.5, 40.4),
        "pt-lisboa": (-9.15, 39.1),
        "pt-setubal": (-8.8, 38.55),
        "pt-tejo": (-8.55, 39.2),
        "pt-alentejo": (-7.7, 38.3),
        "pt-madeira": (-16.95, 32.75),
    },
    "DE": {
        "de-mosel": (6.75, 49.8),
        "de-rheingau": (8.0, 50.0),
        "de-rheinhessen": (8.2, 49.8),
        "de-pfalz": (8.05, 49.35),
        "de-nahe": (7.7, 49.85),
        "de-ahr": (7.1, 50.5),
        "de-baden": (8.3, 48.0),
        "de-franken": (10.1, 49.8),
    },
    "AT": {
        "at-wachau": (15.42, 48.38),
        "at-kremstal-kamptal": (15.65, 48.48),
        "at-weinviertel": (16.4, 48.6),
        "at-thermenregion": (16.25, 48.0),
        "at-burgenland": (16.75, 47.8),
        "at-styria": (15.55, 46.75),
    },
    "HU": {
        "hu-tokaj": (21.2, 48.15),
        "hu-eger-balaton": (19.8, 47.2),
    },
    "GR": {
        "gr-santorini": (25.43, 36.4),
        "gr-naoussa-amyndeon": (22.05, 40.62),
        "gr-nemea": (22.67, 37.82),
        "gr-mantinia": (22.4, 37.62),
        "gr-crete": (25.1, 35.15),
    },
}

EUROPE_MAX_DISTANCE = {
    "FR": 1.75,
    "IT": 1.75,
    "ES": 2.5,
    "PT": 1.55,
    "DE": 1.25,
    "AT": 1.15,
    "HU": 2.5,
    "GR": 1.55,
}

REGION_LABELS: dict[str, tuple[float, float]] = {
    region_id: centre
    for country in EUROPE_CENTRES.values()
    for region_id, centre in country.items()
}


def load_json(path: Path):
    with path.open(encoding="utf-8") as source:
        return json.load(source)


def clean_name(value: str) -> str:
    try:
        return value.encode("latin1").decode("utf-8")
    except (UnicodeEncodeError, UnicodeDecodeError):
        return value


def gpkg_geometry(blob: bytes):
    envelope_type = (blob[3] >> 1) & 7
    envelope_size = {0: 0, 1: 32, 2: 48, 3: 48, 4: 64}[envelope_type]
    return wkb.loads(blob[8 + envelope_size :])


def polygonal(geometry):
    if geometry.is_empty:
        return MultiPolygon([])
    if not geometry.is_valid:
        geometry = geometry.buffer(0)
    if isinstance(geometry, Polygon):
        return MultiPolygon([geometry])
    if isinstance(geometry, MultiPolygon):
        return geometry
    if isinstance(geometry, GeometryCollection):
        parts = [part for part in geometry.geoms if isinstance(part, (Polygon, MultiPolygon))]
        return polygonal(unary_union(parts))
    return MultiPolygon([])


def rounded_coordinates(geometry, digits: int = 4):
    geometry_map = mapping(polygonal(geometry))

    def rounded(value):
        if isinstance(value, (list, tuple)):
            return [rounded(item) for item in value]
        return round(float(value), digits)

    return rounded(geometry_map["coordinates"])


def distance(first: tuple[float, float], second: tuple[float, float]) -> float:
    mean_latitude = math.radians((first[1] + second[1]) / 2)
    return math.hypot((first[0] - second[0]) * math.cos(mean_latitude), first[1] - second[1])


def nearest_region(country: str, point: tuple[float, float]) -> tuple[str, float]:
    centres = EUROPE_CENTRES[country]
    region_id = min(centres, key=lambda candidate: distance(point, centres[candidate]))
    return region_id, distance(point, centres[region_id])


def include_european_pdo(country: str, name: str, point: tuple[float, float], nearest: float) -> bool:
    if nearest > EUROPE_MAX_DISTANCE[country]:
        return False
    lowered = name.casefold()
    if country == "FR" and (
        point[0] > 8
        or any(term in lowered for term in ("corse", "ajaccio", "patrimonio", "cap corse"))
    ):
        return False
    if country == "ES" and (point[0] < -10 or (point[0] > 1.8 and point[1] < 40)):
        return False
    if country == "PT" and point[0] < -18:
        return False
    return True


def build_european_regions():
    pdo_info = {
        row["PDOid"]: row
        for row in csv.DictReader(PDO_CSV.open(encoding="utf-8-sig", newline=""))
    }
    connection = sqlite3.connect(PDO_GPKG)
    transformer = Transformer.from_crs(3035, 4326, always_xy=True)
    grouped: dict[str, list] = defaultdict(list)
    member_names: dict[str, list[str]] = defaultdict(list)

    for _, geometry_blob, pdo_id in connection.execute("select * from EU_PDO"):
        info = pdo_info.get(pdo_id)
        if not info or info["Country"] not in EUROPE_CENTRES:
            continue
        geometry_3035 = gpkg_geometry(geometry_blob)
        centroid = geometry_3035.centroid
        centroid_wgs84 = transformer.transform(centroid.x, centroid.y)
        region_id, nearest = nearest_region(info["Country"], centroid_wgs84)
        if not include_european_pdo(info["Country"], info["PDOnam"], centroid_wgs84, nearest):
            continue
        geometry_wgs84 = transform(transformer.transform, geometry_3035)
        grouped[region_id].append(geometry_wgs84)
        member_names[region_id].append(info["PDOnam"])

    result = {}
    for country_regions in EUROPE_CENTRES.values():
        for region_id, label in country_regions.items():
            geometry = unary_union(grouped.get(region_id, []))
            if geometry.is_empty:
                geometry = box(label[0] - 0.08, label[1] - 0.06, label[0] + 0.08, label[1] + 0.06)
            result[region_id] = region_record(
                geometry,
                label,
                "regulatory-group",
                "European wine PDO inventory",
                len(grouped.get(region_id, [])),
                member_names.get(region_id, []),
                0.0045,
            )
    return result


def union_features(features, predicate):
    geometries = [shape(item["geometry"]) for item in features if predicate(item)]
    return unary_union(geometries), len(geometries)


def region_record(
    geometry,
    label: tuple[float, float],
    precision: str,
    source: str,
    feature_count: int,
    members: list[str],
    tolerance: float,
):
    geometry = polygonal(geometry).simplify(tolerance, preserve_topology=True)
    return {
        "precision": precision,
        "source": source,
        "featureCount": feature_count,
        "members": sorted(set(members))[:16],
        "label": [round(label[0], 4), round(label[1], 4)],
        "bbox": [round(value, 4) for value in geometry.bounds],
        "polygons": rounded_coordinates(geometry),
    }


def build_australia_regions():
    region_features = load_json(AUSTRALIA_REGIONS)["features"]
    tasmania_features = load_json(AUSTRALIA_TASMANIA)["features"]
    by_name = {item["properties"]["GI_NAME"].casefold(): item for item in region_features}

    selections = {
        "au-hunter": (["Hunter"], (151.1, -32.8)),
        "au-barossa": (["Barossa Valley", "Eden Valley"], (139.0, -34.55)),
        "au-clare": (["Clare Valley"], (138.6, -33.9)),
        "au-mclaren": (["Mclaren Vale"], (138.55, -35.22)),
        "au-coonawarra": (["Coonawarra"], (140.83, -37.3)),
        "au-adelaide-hills": (["Adelaide Hills"], (138.85, -34.95)),
        "au-yarra": (["Yarra Valley"], (145.4, -37.65)),
        "au-mornington": (["Mornington Peninsula"], (145.05, -38.35)),
        "au-margaret-river": (["Margaret River"], (115.05, -33.8)),
        "au-great-southern": (["Great Southern"], (117.6, -34.5)),
        "au-rutherglen": (["Rutherglen"], (146.45, -36.05)),
    }

    result = {}
    for region_id, (names, label) in selections.items():
        matches = [by_name[name.casefold()] for name in names]
        geometry = unary_union([shape(item["geometry"]) for item in matches])
        result[region_id] = region_record(
            geometry,
            label,
            "regulatory",
            "Wine Australia GI boundary layer",
            len(matches),
            names,
            0.006,
        )

    tasmania_geometry = polygonal(unary_union([shape(item["geometry"]) for item in tasmania_features]))
    tasmania_geometry = MultiPolygon(
        [part for part in tasmania_geometry.geoms if part.area > 0.002]
    )
    result["au-tasmania"] = region_record(
        tasmania_geometry,
        (147.0, -42.0),
        "regulatory",
        "Wine Australia GI boundary layer",
        len(tasmania_features),
        ["Tasmania"],
        0.02,
    )
    return result


def build_usa_regions():
    features = load_json(USA_AVAS)["features"]

    def names_and_geometry(predicate):
        matching = [item for item in features if predicate(item)]
        return (
            unary_union([shape(item["geometry"]) for item in matching]),
            [item["properties"]["name"] for item in matching],
        )

    definitions = {
        "us-napa": (
            lambda item: item["properties"]["name"] == "Napa Valley",
            (-122.3, 38.5),
        ),
        "us-sonoma": (
            lambda item: (
                "Sonoma" in (item["properties"].get("county") or "")
                and item["properties"]["name"] not in {"North Coast", "California"}
            ),
            (-122.85, 38.45),
        ),
        "us-central-coast": (
            lambda item: item["properties"]["name"] == "Central Coast",
            (-121.25, 35.7),
        ),
        "us-sierra-lodi": (
            lambda item: item["properties"]["name"] in {"Sierra Foothills", "Lodi"},
            (-120.8, 38.1),
        ),
        "us-willamette": (
            lambda item: item["properties"]["name"] == "Willamette Valley",
            (-123.2, 45.2),
        ),
        "us-columbia": (
            lambda item: item["properties"]["name"] == "Columbia Valley",
            (-119.2, 46.3),
        ),
        "us-new-york": (
            lambda item: "NY" in (item["properties"].get("state") or "").split("|"),
            (-76.9, 42.7),
        ),
        "us-virginia-texas": (
            lambda item: (
                "VA" in (item["properties"].get("state") or "").split("|")
                or item["properties"]["name"] == "Texas High Plains"
            ),
            (-87.0, 34.0),
        ),
    }

    result = {}
    for region_id, (predicate, label) in definitions.items():
        geometry, names = names_and_geometry(predicate)
        result[region_id] = region_record(
            geometry,
            label,
            "regulatory",
            "UC Davis American Viticultural Areas project",
            len(names),
            names,
            0.008,
        )
    return result


def admin_features(filename: str):
    return load_json(ADMIN / filename)["features"]


def admin_name(item) -> str:
    return clean_name(item["properties"]["shapeName"])


def add_admin_region(
    result,
    region_id: str,
    label: tuple[float, float],
    features,
    names: set[str],
    source_level: str,
    tolerance: float = 0.008,
    clip=None,
):
    matches = [item for item in features if admin_name(item) in names]
    geometry = unary_union([shape(item["geometry"]) for item in matches])
    if clip is not None:
        geometry = geometry.intersection(clip)
    result[region_id] = region_record(
        geometry,
        label,
        "administrative-redraw",
        f"geoBoundaries {source_level}, grouped as an atlas guide",
        len(matches),
        sorted(names),
        tolerance,
    )


def build_admin_regions():
    result = {}

    nz = admin_features("NZL.geojson")
    add_admin_region(result, "nz-auckland-northland", (174.4, -36.4), nz, {"Auckland Region", "Northland Region"}, "ADM1", 0.01)
    add_admin_region(result, "nz-gisborne", (178.0, -38.65), nz, {"Gisborne Region"}, "ADM1", 0.008)
    add_admin_region(result, "nz-hawkes-bay", (176.8, -39.6), nz, {"Hawke's Bay Region"}, "ADM1", 0.008)
    add_admin_region(
        result,
        "nz-wairarapa",
        (175.45, -41.1),
        nz,
        {"Wellington Region"},
        "ADM1",
        0.006,
        box(174.85, -41.65, 176.5, -40.55),
    )
    add_admin_region(result, "nz-marlborough", (173.85, -41.55), nz, {"Marlborough Region"}, "ADM1", 0.008)
    add_admin_region(
        result,
        "nz-nelson-canterbury",
        (172.6, -42.2),
        nz,
        {"Nelson Region", "Tasman Region", "Canterbury Region"},
        "ADM1",
        0.01,
    )
    add_admin_region(result, "nz-central-otago", (169.2, -45.0), nz, {"Otago Region"}, "ADM1", 0.009)

    china = admin_features("CHN.geojson")
    add_admin_region(result, "cn-ningxia", (106.0, 38.4), china, {"Ningxia Ningxia Hui Autonomous Region"}, "ADM1", 0.02)
    add_admin_region(result, "cn-xinjiang", (86.0, 43.5), china, {"Xinjiang Uyghur Autonomous Region"}, "ADM1", 0.03)
    add_admin_region(result, "cn-shandong", (120.5, 37.3), china, {"Shandong Province"}, "ADM1", 0.015)
    add_admin_region(result, "cn-yunnan", (99.2, 28.0), china, {"Yunnan Province"}, "ADM1", 0.02)
    add_admin_region(result, "cn-hebei", (115.5, 40.2), china, {"Hebei Province"}, "ADM1", 0.015)

    canada_adm1 = admin_features("CAN.geojson")
    canada_adm2 = admin_features("CAN-ADM2.geojson")
    add_admin_region(result, "ca-niagara", (-79.25, 43.15), canada_adm2, {"Hamilton--Niagara Peninsula"}, "ADM2", 0.007)
    add_admin_region(result, "ca-okanagan", (-119.45, 49.5), canada_adm2, {"Thompson--Okanagan"}, "ADM2", 0.012)
    add_admin_region(result, "ca-nova-scotia", (-64.25, 45.05), canada_adm1, {"Nova Scotia"}, "ADM1", 0.012)

    chile = admin_features("CHL-ADM2.geojson")
    add_admin_region(result, "cl-limari-elqui", (-70.7, -30.0), chile, {"Provincia de Elqui", "Provincia de Limarí"}, "ADM2", 0.01)
    add_admin_region(result, "cl-aconcagua", (-71.1, -32.8), chile, {"Provincia de San Felipe de Aconcagua", "Provincia de Los Andes"}, "ADM2", 0.008)
    add_admin_region(result, "cl-casablanca-san-antonio", (-71.45, -33.55), chile, {"Provincia de Valparaíso", "Provincia de San Antonio"}, "ADM2", 0.008)
    add_admin_region(result, "cl-maipo", (-70.65, -33.6), chile, {"Provincia de Santiago", "Provincia de Maipo", "Provincia de Cordillera"}, "ADM2", 0.008)
    add_admin_region(result, "cl-rapel", (-71.1, -34.4), chile, {"Provincia de Cachapoal", "Provincia de Colchagua", "Provincia de Cardenal Caro"}, "ADM2", 0.009)
    add_admin_region(result, "cl-curico-maule", (-71.5, -35.2), chile, {"Provincia de Curicó", "Provincia de Talca", "Provincia de Linares", "Provincia de Cauquenes"}, "ADM2", 0.009)
    add_admin_region(result, "cl-itata-bio-bio", (-72.3, -36.6), chile, {"Provincia de Itata", "Provincia de Diguillín", "Provincia de Bío-Bío"}, "ADM2", 0.009)

    argentina_adm1 = admin_features("ARG.geojson")
    argentina_adm2 = admin_features("ARG-ADM2.geojson")
    salta_departments = [
        item
        for item in argentina_adm2
        if admin_name(item) in {"Cafayate", "Molinos", "San Carlos"}
        and -67.5 < shape(item["geometry"]).centroid.x < -64.5
        and -27.0 < shape(item["geometry"]).centroid.y < -23.5
    ]
    salta_geometry = unary_union([shape(item["geometry"]) for item in salta_departments])
    result["ar-salta"] = region_record(
        salta_geometry,
        (-65.95, -25.5),
        "administrative-redraw",
        "geoBoundaries ADM2, grouped as an atlas guide",
        len(salta_departments),
        [admin_name(item) for item in salta_departments],
        0.009,
    )
    add_admin_region(result, "ar-mendoza", (-68.85, -33.0), argentina_adm1, {"Mendoza"}, "ADM1", 0.012)
    uco_departments = [
        item
        for item in argentina_adm2
        if admin_name(item) in {"Tunuyán", "Tupungato", "San Carlos"}
        and -70.5 < shape(item["geometry"]).centroid.x < -67.5
        and -35.5 < shape(item["geometry"]).centroid.y < -32.0
    ]
    result["ar-uco"] = region_record(
        unary_union([shape(item["geometry"]) for item in uco_departments]),
        (-69.15, -33.6),
        "administrative-redraw",
        "geoBoundaries ADM2, grouped as an atlas guide",
        len(uco_departments),
        [admin_name(item) for item in uco_departments],
        0.006,
    )
    add_admin_region(result, "ar-san-juan", (-68.5, -31.5), argentina_adm1, {"San Juan"}, "ADM1", 0.012)
    add_admin_region(result, "ar-patagonia", (-68.7, -39.2), argentina_adm1, {"Neuquén", "Río Negro", "Chubut"}, "ADM1", 0.018)

    south_africa = admin_features("ZAF-ADM3.geojson")
    add_admin_region(result, "za-stellenbosch", (18.86, -33.93), south_africa, {"Stellenbosch"}, "ADM3", 0.004)
    add_admin_region(result, "za-paarl", (18.96, -33.72), south_africa, {"Drakenstein"}, "ADM3", 0.005)
    add_admin_region(result, "za-swartland", (18.65, -33.35), south_africa, {"Swartland"}, "ADM3", 0.006)
    add_admin_region(
        result,
        "za-constantia",
        (18.42, -34.02),
        south_africa,
        {"City of Cape Town"},
        "ADM3",
        0.002,
        box(18.32, -34.18, 18.58, -33.9),
    )
    add_admin_region(
        result,
        "za-walker-bay",
        (19.3, -34.4),
        south_africa,
        {"Overstrand", "Theewaterskloof", "Cape Agulhas", "Hessequa", "Bitou"},
        "ADM3",
        0.007,
    )
    add_admin_region(result, "za-robertson-breede", (19.9, -33.8), south_africa, {"Breede Valley", "Langeberg"}, "ADM3", 0.006)
    add_admin_region(result, "za-olifants", (19.05, -32.1), south_africa, {"Cederberg", "Matzikama", "Bergrivier"}, "ADM3", 0.008)

    britain_adm1 = admin_features("GBR.geojson")
    britain_adm2 = admin_features("GBR-ADM2.geojson")
    add_admin_region(result, "gb-sussex", (-0.3, 50.92), britain_adm2, {"East Sussex", "West Sussex"}, "ADM2", 0.004)
    add_admin_region(result, "gb-kent", (0.7, 51.15), britain_adm2, {"Kent"}, "ADM2", 0.004)
    add_admin_region(result, "gb-hampshire-surrey", (-1.0, 51.05), britain_adm2, {"Hampshire", "Surrey"}, "ADM2", 0.004)
    add_admin_region(
        result,
        "gb-thames-east",
        (0.5, 51.8),
        britain_adm2,
        {"Essex", "Suffolk", "Norfolk", "Cambridgeshire", "Hertfordshire", "Greater London", "Central Bedfordshire", "Bedford"},
        "ADM2",
        0.005,
    )
    west_names = {
        "Cornwall",
        "Devon",
        "Dorset",
        "Somerset",
        "Wiltshire",
        "Gloucestershire",
        "South Gloucestershire",
        "Bristol, City of",
        "Bath and North East Somerset",
        "North Somerset",
        "Herefordshire, County of",
    }
    west_matches = [item for item in britain_adm2 if admin_name(item) in west_names]
    wales_matches = [item for item in britain_adm1 if admin_name(item) == "Wales"]
    west_geometry = unary_union([shape(item["geometry"]) for item in west_matches + wales_matches])
    result["gb-wales-west"] = region_record(
        west_geometry,
        (-3.2, 51.65),
        "administrative-redraw",
        "geoBoundaries ADM1 and ADM2, grouped as an atlas guide",
        len(west_matches) + len(wales_matches),
        sorted(west_names | {"Wales"}),
        0.006,
    )

    return result


def main():
    regions = {}
    regions.update(build_european_regions())
    regions.update(build_australia_regions())
    regions.update(build_usa_regions())
    regions.update(build_admin_regions())

    payload = {
        "source": {
            "built": "2026-07-30",
            "note": "Screen-scale geometry: regulatory boundaries where open data exists; administrative atlas redraws elsewhere.",
        },
        "sources": {
            "europe": {
                "name": "Candiago et al., Wine PDO map",
                "license": "CC0",
                "url": "https://springernature.figshare.com/articles/dataset/Wine_PDO_map/19312094",
            },
            "australia": {
                "name": "Wine Australia Geographical Indications",
                "license": "CC BY 4.0",
                "url": "https://www.wineaustralia.com/labelling/register-of-protected-gis-and-other-terms/geographical-indications",
            },
            "usa": {
                "name": "UC Davis American Viticultural Areas Digitizing Project",
                "license": "CC0",
                "url": "https://ucdavislibrary.github.io/ava/data.html",
            },
            "administrative": {
                "name": "geoBoundaries gbOpen",
                "license": "CC BY 4.0",
                "url": "https://www.geoboundaries.org/api.html",
            },
        },
        "regions": dict(sorted(regions.items())),
    }
    OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"Wrote {len(regions)} regions to {OUTPUT}")


if __name__ == "__main__":
    main()
