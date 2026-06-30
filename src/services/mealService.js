// mealService.js – fetches meals from the FastAPI backend
import api from "./api";

/** Normalises a meal object from the backend API response */
function normalizeMeal(meal) {
  return {
    id: meal.id,
    name: meal.name,
    description: meal.description,
    image: meal.image_url,
    price: meal.price,
    calories: meal.calories,
    category: meal.category
      ? meal.category.charAt(0).toUpperCase() + meal.category.slice(1)
      : "Other",
    allergens: meal.allergens || [],
    rating: meal.rating || 4.0,
    available: meal.is_available ?? true,
    is_available: meal.is_available ?? true,
    nutrition: {
      calories: meal.calories || 0,
      protein: meal.protein || 0,
      carbs: meal.carbs || 0,
      fat: meal.fat || 0,
    },
  };
}

export async function getMeals() {
  const response = await api.get("/meals");
  return response.data.map(normalizeMeal);
}

export async function getMealById(id) {
  const response = await api.get(`/meals/${id}`);
  return normalizeMeal(response.data);
}

export default {
  getMeals,
  getMealById,
};
