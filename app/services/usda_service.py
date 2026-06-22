"""
USDA FoodData Central service — zweistufiger Flow:
1. search_ingredients()  → Liste von Treffern
2. get_ingredient_by_id() → Makros für einen konkreten Eintrag
"""

import os
import httpx
from typing import Optional

FDC_API_KEY = os.getenv("FDC_API_KEY", "DEMO_KEY")
FDC_BASE_URL = "https://api.nal.usda.gov/fdc/v1"

NUTRIENT_MAP = {
    "calories": 1008,
    "protein":  1003,
    "fat":      1004,
    "carbs":    1005,
}

PREFERRED_DATA_TYPES = {"Foundation", "SR Legacy"}


def _extract_macros(food_nutrients: list) -> dict:
    nutrients = {}
    for n in food_nutrients:
        # Detail-Endpunkt: {"nutrient": {"id": 1008, ...}, "amount": 389}
        # Search-Endpunkt: {"nutrientId": 1008, "value": 389}
        nid = n.get("nutrientId") or n.get("nutrient", {}).get("id")
        val = n.get("value") or n.get("amount", 0)
        if nid:
            nutrients[int(nid)] = val

    return {
        "calories": round(nutrients.get(NUTRIENT_MAP["calories"], 0)),
        "protein":  round(nutrients.get(NUTRIENT_MAP["protein"], 0), 1),
        "fat":      round(nutrients.get(NUTRIENT_MAP["fat"], 0), 1),
        "carbs":    round(nutrients.get(NUTRIENT_MAP["carbs"], 0), 1),
    }



def search_ingredients(query: str) -> list:
    """
    Schritt 1: Gibt bis zu 5 Treffer zurück (fdcId + Name + dataType).
    Bevorzugt Foundation und SR Legacy Foods.
    """
    params = {
        "query": query,
        "api_key": FDC_API_KEY,
        "pageSize": 10,
        "dataType": "Foundation,SR Legacy",
    }

    response = httpx.get(f"{FDC_BASE_URL}/foods/search", params=params)
    response.raise_for_status()
    foods = response.json().get("foods", [])

    # Sortiere: Foundation zuerst, dann SR Legacy
    def sort_key(f):
        dt = f.get("dataType", "")
        return 0 if dt == "Foundation" else 1 if dt == "SR Legacy" else 2

    foods.sort(key=sort_key)

    return [
        {
            "fdc_id":     food["fdcId"],
            "name":       food.get("description", ""),
            "data_type":  food.get("dataType", ""),
        }
        for food in foods[:5]
    ]


def get_ingredient_by_id(fdc_id: int) -> Optional[dict]:
    """
    Schritt 2: Holt die genauen Makros für eine konkrete fdcId.
    """
    params = {"api_key": FDC_API_KEY}
    response = httpx.get(f"{FDC_BASE_URL}/food/{fdc_id}", params=params)

    if response.status_code == 404:
        return None

    response.raise_for_status()
    food = response.json()

    macros = _extract_macros(food.get("foodNutrients", []))

    return {
        "fdc_id": fdc_id,
        "name":   food.get("description", ""),
        **macros,
    }
