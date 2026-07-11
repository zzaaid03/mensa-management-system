import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import MealCard from "../../components/MealCard/MealCard";
import { getMeals } from "../../services/mealService";
import styles from "./Menu.module.css";

const CATEGORIES = [
  { id: "all", label: "All Dishes" },
  { id: "main", label: "Mains" },
  { id: "side", label: "Sides" },
  { id: "drink", label: "Drinks" },
  { id: "dessert", label: "Desserts" },
];

const DAY_FILTERS = [
  { id: "all", label: "All Menu" },
  { id: "today", label: "Today's Menu" },
  { id: "tomorrow", label: "Tomorrow's Menu" },
];

function Menu() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeDay, setActiveDay] = useState("all");
  const [availableOnly, setAvailableOnly] = useState(false);
  const navigate = useNavigate();

  /* Fetch meals whenever the day filter changes */
  const fetchMeals = useCallback(async () => {
    setLoading(true);
    const data = await getMeals({
      day: activeDay === "all" ? undefined : activeDay,
    });
    setMeals(data);
    setLoading(false);
  }, [activeDay]);

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

  /* Local filtering (search + category + availability) */
  const filteredMeals = meals.filter((meal) => {
    const matchesSearch =
      meal.name.toLowerCase().includes(search.toLowerCase()) ||
      (meal.description &&
        meal.description.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory =
      activeCategory === "all" ||
      (meal.category &&
        meal.category.toLowerCase() === activeCategory.toLowerCase());
    const matchesAvailability = !availableOnly || meal.available;
    return matchesSearch && matchesCategory && matchesAvailability;
  });

  return (
    <div className="container py-8">
      <h1 className="section-title">UniMensa Menu</h1>
      <p className="section-subtitle">
        Browse and filter our daily selection of nutritious meals.
      </p>

      {/* ── Day filter tabs (Today / Tomorrow / All) ─────────────────────── */}
      <div className={styles.dayTabs}>
        {DAY_FILTERS.map((d) => (
          <button
            key={d.id}
            className={`${styles.dayTab} ${activeDay === d.id ? styles.dayTabActive : ""}`}
            onClick={() => setActiveDay(d.id)}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* ── Search + availability toggle ─────────────────────────────────── */}
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

      {/* ── Category tabs ────────────────────────────────────────────────── */}
      <div className={styles.tabs}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`${styles.tab} ${activeCategory === cat.id ? styles.tabActive : ""}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ── Menu Grid ────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="text-center py-12">
          <p>Loading the daily menu...</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredMeals.length > 0 ? (
            filteredMeals.map((meal) => <MealCard key={meal.id} meal={meal} />)
          ) : (
            <div className={styles.noResults}>
              <h3>No dishes match your filter criteria</h3>
              <p className="text-muted mt-2">
                Try clearing your search or switching categories.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Menu;
