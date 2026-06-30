import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMealById } from "../../services/mealService";
import styles from "./MealDetails.module.css";

function MealDetails() {
  const { id } = useParams();
  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    getMealById(id).then((m) => {
      if (!mounted) return;
      setMeal(m);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) return <div className="container py-8">Loading…</div>;
  if (!meal) return <div className="container py-8">Meal not found.</div>;

  return (
    <div className="container py-8">
      <div className={styles.wrapper}>
        <div className={styles.imageCol}>
          <img src={meal.image} alt={meal.name} className={styles.image} />
        </div>
        <div className={styles.infoCol}>
          <h1 className={styles.title}>{meal.name}</h1>
          <p className={styles.description}>{meal.description}</p>

          <div className={styles.metaRow}>
            <div className={styles.price}>€{meal.price.toFixed(2)}</div>
            <div className={styles.calories}>🔥 {meal.calories} kcal</div>
          </div>

          <div className={styles.actions}>
            <button
              className={styles.btnPrimary}
              onClick={() =>
                navigate("/preorder", { state: { mealId: meal.id } })
              }
            >
              Pre-Order This Meal
            </button>
            <button
              className={styles.btnOutline}
              onClick={() => navigate("/reservation")}
            >
              Reserve Table
            </button>
          </div>

          <hr className="divider" />

          <h3>Nutrition</h3>
          <table className={styles.nutritionTable}>
            <tbody>
              <tr>
                <td>Calories</td>
                <td>{meal.nutrition?.calories ?? meal.calories} kcal</td>
              </tr>
              <tr>
                <td>Protein</td>
                <td>{meal.nutrition?.protein ?? "-"} g</td>
              </tr>
              <tr>
                <td>Carbs</td>
                <td>{meal.nutrition?.carbs ?? "-"} g</td>
              </tr>
              <tr>
                <td>Fat</td>
                <td>{meal.nutrition?.fat ?? "-"} g</td>
              </tr>
            </tbody>
          </table>

          <h4 className="mt-4">Allergens</h4>
          <div className={styles.allergens}>
            {(meal.allergens || []).map((a) => (
              <span key={a} className={styles.allergen}>
                {a}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MealDetails;
