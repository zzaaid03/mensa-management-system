// mealService.js – provides meal data (mock) and will be replaced with API calls later
import api from './api';

const MOCK_MEALS = [
  {
    id: 1,
    name: 'Spaghetti Bolognese',
    description: 'Traditional beef ragù with al dente spaghetti.',
    image: 'https://picsum.photos/seed/spaghetti/800/520',
    price: 3.9,
    calories: 680,
    category: 'Meat',
    allergens: ['gluten', 'milk'],
    rating: 4.4,
    available: true,
    nutrition: { calories: 680, protein: 32, carbs: 78, fat: 24 },
  },
  {
    id: 2,
    name: 'Veggie Buddha Bowl',
    description: 'Roasted vegetables, quinoa, chickpeas & tahini dressing.',
    image: 'https://picsum.photos/seed/bowl/800/520',
    price: 4.5,
    calories: 520,
    category: 'Vegan',
    allergens: ['sesame'],
    rating: 4.7,
    available: true,
    nutrition: { calories: 520, protein: 18, carbs: 62, fat: 16 },
  },
  {
    id: 3,
    name: 'Grilled Salmon Fillet',
    description: 'Pan-seared salmon with herb butter and seasonal greens.',
    image: 'https://picsum.photos/seed/salmon/800/520',
    price: 5.9,
    calories: 450,
    category: 'Fish',
    allergens: ['fish'],
    rating: 4.6,
    available: true,
    nutrition: { calories: 450, protein: 34, carbs: 8, fat: 28 },
  },
  {
    id: 4,
    name: 'Classic Cheese Burger',
    description: 'Beef patty, cheddar, lettuce, tomato & burger sauce.',
    image: 'https://picsum.photos/seed/burger/800/520',
    price: 4.2,
    calories: 760,
    category: 'Meat',
    allergens: ['gluten', 'milk'],
    rating: 4.2,
    available: false,
    nutrition: { calories: 760, protein: 38, carbs: 58, fat: 40 },
  },
  {
    id: 5,
    name: 'Lentil Soup + Bread',
    description: 'Hearty lentil soup served with freshly baked bread.',
    image: 'https://picsum.photos/seed/lentil/800/520',
    price: 2.8,
    calories: 320,
    category: 'Vegetarian',
    allergens: ['gluten'],
    rating: 4.1,
    available: true,
    nutrition: { calories: 320, protein: 14, carbs: 46, fat: 6 },
  },
  {
    id: 6,
    name: 'Greek Salad',
    description: 'Tomatoes, cucumber, olives, feta cheese & olive oil.',
    image: 'https://picsum.photos/seed/salad/800/520',
    price: 3.4,
    calories: 280,
    category: 'Vegetarian',
    allergens: ['milk'],
    rating: 4.3,
    available: true,
    nutrition: { calories: 280, protein: 8, carbs: 14, fat: 20 },
  },
];

export async function getMeals() {
  // Placeholder: will call backend API when ready
  // return api.get('/meals').then(res => res.data);
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_MEALS), 300));
}

export async function getMealById(id) {
  // Placeholder: will call backend API when ready
  // return api.get(`/meals/${id}`).then(res => res.data);
  const m = MOCK_MEALS.find((x) => String(x.id) === String(id));
  return new Promise((resolve) => setTimeout(() => resolve(m || null), 200));
}

export default {
  getMeals,
  getMealById,
};
