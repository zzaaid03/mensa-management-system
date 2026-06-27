import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MealCard from '../../components/MealCard/MealCard';
import { getMeals } from '../../services/mealService';
import styles from './Menu.module.css';

const CATEGORIES = [
  { id: 'all', label: 'All Dishes' },
  { id: 'main', label: 'Mains' },
  { id: 'side', label: 'Sides' },
  { id: 'drink', label: 'Drinks' },
  { id: 'dessert', label: 'Desserts' },
];

function Menu() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [availableOnly, setAvailableOnly] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchMenu() {
      setLoading(true);
      const data = await getMeals();
      setMeals(data);
      setLoading(false);
    }
    fetchMenu();
  }, []);

  const handlePreOrder = (meal) => {
    navigate('/preorder', { state: { mealId: meal.id } });
  };

  // Local filtering
  const filteredMeals = meals.filter((meal) => {
    const matchesSearch = meal.name.toLowerCase().includes(search.toLowerCase()) || 
      (meal.description && meal.description.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCategory = activeCategory === 'all' || 
      (meal.category && meal.category.toLowerCase() === activeCategory.toLowerCase());
    
    const matchesAvailability = !availableOnly || meal.available;

    return matchesSearch && matchesCategory && matchesAvailability;
  });

  return (
    <div className="container py-8">
      <h1 className="section-title">UniMensa Menu</h1>
      <p className="section-subtitle">Browse and filter our daily selection of nutritious meals.</p>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.searchWrapper}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search meals (e.g. curry, salad)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            className={styles.checkboxInput}
            checked={availableOnly}
            onChange={(e) => setAvailableOnly(e.target.checked)}
          />
          Available Today Only
        </label>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`${styles.tab} ${activeCategory === cat.id ? styles.tabActive : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p>Loading the daily menu...</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredMeals.length > 0 ? (
            filteredMeals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                onPreOrder={handlePreOrder}
              />
            ))
          ) : (
            <div className={styles.noResults}>
              <h3>No dishes match your filter criteria</h3>
              <p className="text-muted mt-2">Try clearing your search or switching categories.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Menu;
