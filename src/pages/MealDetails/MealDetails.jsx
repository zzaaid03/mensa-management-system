import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMealById, getMealReviews } from "../../services/mealService";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import styles from "./MealDetails.module.css";

function MealDetails() {
  const { id } = useParams();
  const [meal, setMeal] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [reviewMsg, setReviewMsg] = useState("");
  const [reviewError, setReviewError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    let mounted = true;
    Promise.all([getMealById(id), getMealReviews(id)]).then(([m, r]) => {
      if (!mounted) return;
      setMeal(m);
      setReviews(r || []);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewMsg("");
    setReviewError("");
    // Find a completed order with this meal to attach feedback to
    try {
      const ordersRes = await api.get("/orders/my");
      const completed = ordersRes.data.find(
        (o) =>
          o.status === "completed" &&
          o.items.some((it) => it.meal_id === parseInt(id, 10)),
      );
      if (!completed) {
        setReviewError("You can only review meals from your completed orders.");
        return;
      }
      await api.post(`/orders/${completed.id}/feedback`, {
        rating: parseInt(reviewForm.rating, 10),
        comment: reviewForm.comment || undefined,
      });
      setReviewMsg("Review submitted! Thank you.");
      setReviewForm({ rating: 5, comment: "" });
      // Refresh reviews
      const r = await getMealReviews(id);
      setReviews(r || []);
    } catch (err) {
      setReviewError(err.response?.data?.detail || "Failed to submit review");
    }
  };

  if (loading) return <div className="container py-8">Loading…</div>;
  if (!meal) return <div className="container py-8">Meal not found.</div>;

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <div className="container py-8">
      {/* ── Back button ────────────────────────────────────────────── */}
      <button className={styles.backBtn} onClick={() => navigate(-1)}>
        ← Back
      </button>

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
            {avgRating && (
              <div className={styles.avgRating}>
                ⭐ {avgRating} ({reviews.length})
              </div>
            )}
          </div>

          {/* Availability badges */}
          <div className={styles.availRow}>
            <span className={meal.available ? styles.availYes : styles.availNo}>
              {meal.available ? "✓ Available Today" : "✗ Not Available Today"}
            </span>
            <span
              className={
                meal.is_available_tomorrow ? styles.availYes : styles.availNo
              }
            >
              {meal.is_available_tomorrow
                ? "✓ Available Tomorrow"
                : "✗ Not Available Tomorrow"}
            </span>
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

          <h3>Nutrition Information</h3>
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

      {/* ── Reviews section (Amazon-style) ─────────────────────────── */}
      <section className={styles.reviewsSection}>
        <h2 className={styles.reviewsTitle}>Customer Reviews</h2>

        {avgRating && (
          <div className={styles.reviewsSummary}>
            <span className={styles.bigRating}>⭐ {avgRating}</span>
            <span className={styles.reviewsCount}>
              based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* ── Review form (only for logged-in users) ──────────────── */}
        {user ? (
          <form className={styles.reviewForm} onSubmit={handleReviewSubmit}>
            <h4>Write a Review</h4>
            {reviewMsg && <div className={styles.okBanner}>{reviewMsg}</div>}
            {reviewError && (
              <div className={styles.errBanner}>{reviewError}</div>
            )}
            <label className={styles.label}>Rating:</label>
            <select
              className={styles.select}
              value={reviewForm.rating}
              onChange={(e) =>
                setReviewForm((p) => ({ ...p, rating: e.target.value }))
              }
            >
              <option value={5}>⭐⭐⭐⭐⭐ (5)</option>
              <option value={4}>⭐⭐⭐⭐ (4)</option>
              <option value={3}>⭐⭐⭐ (3)</option>
              <option value={2}>⭐⭐ (2)</option>
              <option value={1}>⭐ (1)</option>
            </select>
            <label className={styles.label}>Comment (optional):</label>
            <textarea
              className={styles.textarea}
              rows={3}
              placeholder="Share your experience..."
              value={reviewForm.comment}
              onChange={(e) =>
                setReviewForm((p) => ({ ...p, comment: e.target.value }))
              }
            />
            <button type="submit" className={styles.submitReviewBtn}>
              Submit Review
            </button>
          </form>
        ) : (
          <p className={styles.loginHint}>Please log in to write a review.</p>
        )}

        {/* ── Review list ──────────────────────────────────────────── */}
        {reviews.length === 0 ? (
          <p className={styles.noReviews}>
            No reviews yet. Be the first to review!
          </p>
        ) : (
          <div className={styles.reviewList}>
            {reviews.map((r) => (
              <div key={r.id} className={styles.reviewItem}>
                <div className={styles.reviewHeader}>
                  <span className={styles.reviewStars}>
                    {"⭐".repeat(r.rating)}
                  </span>
                  <span className={styles.reviewAuthor}>
                    {r.user_name || "Anonymous"}
                  </span>
                  <span className={styles.reviewDate}>
                    {new Date(r.created_at).toLocaleDateString("en-US", {
                      dateStyle: "medium",
                    })}
                  </span>
                </div>
                {r.comment && (
                  <p className={styles.reviewComment}>{r.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default MealDetails;
