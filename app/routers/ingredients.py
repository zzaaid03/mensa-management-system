from typing import List
from fastapi import APIRouter, HTTPException, Query
from app.schemas import IngredientMacroResponse, IngredientSearchResult
from app.services.usda_service import search_ingredients, get_ingredient_by_id

router = APIRouter(tags=["Ingredients"])


@router.get("/ingredients/search", response_model=List[IngredientSearchResult])
def search(query: str = Query(..., min_length=1, examples=["oats"])):
    """
    Schritt 1: Suche nach einem Lebensmittel.
    Gibt bis zu 5 Treffer mit fdc_id und Name zurück.
    FRONTEND: Zeige die Liste — User wählt den richtigen Eintrag aus.
    """
    results = search_ingredients(query)
    if not results:
        raise HTTPException(status_code=404, detail=f"Keine Ergebnisse für '{query}'")
    return results


@router.get("/ingredients/lookup", response_model=IngredientMacroResponse)
def lookup(fdc_id: int = Query(..., examples=[173904])):
    """
    Schritt 2: Makros für einen konkreten Eintrag laden.
    FRONTEND: Nach User-Auswahl aus Schritt 1 aufrufen.
    """
    result = get_ingredient_by_id(fdc_id)
    if not result:
        raise HTTPException(status_code=404, detail=f"Kein Eintrag für fdcId {fdc_id}")
    return result

