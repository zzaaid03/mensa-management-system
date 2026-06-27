// mealService.js – provides meal data fetched from the SQLite backend
import api from './api';

export async function getMeals() {
  try {
    const response = await api.get('/meals');
    return response.data.map(meal => ({
      id: meal.id,
      name: meal.name,
      description: meal.description,
      image: meal.image_url,
      price: meal.price,
      calories: meal.calories,
      category: meal.category ? meal.category.charAt(0).toUpperCase() + meal.category.slice(1) : 'Other',
      allergens: meal.allergens || [],
      rating: 4.5, // Standard fallback rating since DB doesn't track it
      available: meal.is_available,
      nutrition: {
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat
      }
    }));
  } catch (error) {
    console.error('Failed to fetch meals from SQLite backend', error);
    return [];
  }
}

export async function getMealById(id) {
  try {
    const response = await api.get(`/meals/${id}`);
    const meal = response.data;
    return {
      id: meal.id,
      name: meal.name,
      description: meal.description,
      image: meal.image_url,
      price: meal.price,
      calories: meal.calories,
      category: meal.category ? meal.category.charAt(0).toUpperCase() + meal.category.slice(1) : 'Other',
      allergens: meal.allergens || [],
      rating: 4.5,
      available: meal.is_available,
      nutrition: {
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat
      }
    };
  } catch (error) {
    console.error(`Failed to fetch meal ${id} from SQLite backend`, error);
    return null;
  }
}

export default {
  getMeals,
  getMealById,
};
