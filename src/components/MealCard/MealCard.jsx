/**
 * MealCard.jsx – Reusable card that displays a single meal's summary.
 *
 * Props:
 *  @param {object}   meal             - Meal data object
 *  @param {number}   meal.id          - Unique meal ID
 *  @param {string}   meal.name        - Meal name
 *  @param {string}   meal.description - Short description
 *  @param {string}   meal.image       - Image URL (or placeholder)
 *  @param {number}   meal.price       - Price in EUR
 *  @param {number}   meal.calories    - Total calories (kcal)
 *  @param {string}   meal.category    - e.g. "Vegan", "Vegetarian", "Meat"
 *  @param {string[]} meal.allergens   - List of allergen codes
 *  @param {number}   meal.rating      - Average rating 1–5
 *  @param {boolean}  meal.available   - Whether the meal is available today
 *  @param {function} [onPreOrder]     - Callback when "Pre-Order" is clicked
 */
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './MealCard.module.css';

/* ── Helpers ──────────────────────────────────────────────────────────────── */

/** Returns a category badge colour class */
function getCategoryClass(category) {
  const map = {
    vegan:      styles.badgeVegan,
    vegetarian: styles.badgeVegetarian,
    meat:       styles.badgeMeat,
    fish:       styles.badgeFish,
  };
  return map[(category || '').toLowerCase()] || styles.badgeDefault;
}

/** Renders filled / empty star icons */
function StarRating({ rating }) {
  return (
    <div className={styles.stars} aria-label={`Rating: ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= Math.round(rating) ? styles.starFilled : styles.starEmpty}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
      <span className={styles.ratingNumber}>({rating.toFixed(1)})</span>
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────────────────────── */
function MealCard({ meal, onPreOrder }) {
  const {
    id,
    name        = 'Unnamed Meal',
    description = '',
    image       = '',
    price       = 0,
    calories    = 0,
    category    = 'Other',
    allergens   = [],
    rating      = 0,
    available   = true,
  } = meal || {};

  /* Fallback to a colourful placeholder when no image is provided */
  const imageSrc = image || `https://picsum.photos/seed/${id}/400/260`;

  return (
    <article className={`${styles.card} ${!available ? styles.cardUnavailable : ''}`}>

      {/* ── Meal image ──────────────────────────────────────────────────── */}
      <div className={styles.imageWrapper}>
        <img
          src={imageSrc}
          alt={name}
          className={styles.image}
          loading="lazy"
        />

        {/* Availability ribbon */}
        {!available && (
          <div className={styles.unavailableRibbon} aria-label="Not available today">
            Unavailable Today
          </div>
        )}

        {/* Category badge */}
        <span className={`${styles.categoryBadge} ${getCategoryClass(category)}`}>
          {category}
        </span>
      </div>

      {/* ── Card body ───────────────────────────────────────────────────── */}
      <div className={styles.body}>
        <h3 className={styles.name}>{name}</h3>
        {description && (
          <p className={styles.description}>{description}</p>
        )}

        {/* Nutrition & price row */}
        <div className={styles.meta}>
          <span className={styles.calories}>
            🔥 <strong>{calories}</strong> kcal
          </span>
          <span className={styles.price}>
            €{price.toFixed(2)}
          </span>
        </div>

        {/* Star rating */}
        {rating > 0 && <StarRating rating={rating} />}

        {/* Allergen tags */}
        {allergens.length > 0 && (
          <div className={styles.allergens} aria-label="Allergens">
            <span className={styles.allergenLabel}>Allergens:</span>
            {allergens.map((a) => (
              <span key={a} className={styles.allergenTag}>{a}</span>
            ))}
          </div>
        )}
      </div>

      {/* ── Action buttons ──────────────────────────────────────────────── */}
      <div className={styles.actions}>
        <Link
          to={`/meal/${id}`}
          className={styles.btnDetails}
          aria-label={`View details for ${name}`}
        >
          View Details
        </Link>
        <button
          className={styles.btnPreOrder}
          onClick={() => onPreOrder && onPreOrder(meal)}
          disabled={!available}
          aria-label={`Pre-order ${name}`}
        >
          Pre-Order
        </button>
      </div>
    </article>
  );
}

export default MealCard;
