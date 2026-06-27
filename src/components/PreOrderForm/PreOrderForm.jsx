/**
 * PreOrderForm.jsx – Reusable meal pre-order form.
 *
 * Props:
 *  @param {object[]}  meals           - Array of available meal objects [{id, name, price}]
 *  @param {function}  onSubmit        - Called with form data object on valid submit
 *  @param {boolean}   [loading=false] - Shows spinner on submit button
 *  @param {string}    [successMsg]    - Success message after submission
 *  @param {string}    [errorMsg]      - Error message from API
 *
 * NOTE: No backend connection yet – form validation and controlled state only.
 */
import React, { useState, useEffect } from 'react';
import styles from './PreOrderForm.module.css';

/* ── Default mock meals (used when no meals prop is provided) ─────────────── */
const DEFAULT_MEALS = [
  { id: 1, name: 'Spaghetti Bolognese',   price: 3.90 },
  { id: 2, name: 'Veggie Buddha Bowl',    price: 4.50 },
  { id: 3, name: 'Grilled Salmon Fillet', price: 5.90 },
  { id: 4, name: 'Classic Cheese Burger', price: 4.20 },
  { id: 5, name: 'Lentil Soup + Bread',   price: 2.80 },
];

/* ── Helpers ──────────────────────────────────────────────────────────────── */
const todayISO = () => new Date().toISOString().split('T')[0];

function validate(fields) {
  const errors = {};
  if (!fields.pickupDate)  errors.pickupDate = 'Please select a pickup date.';
  if (!fields.pickupTime)  errors.pickupTime = 'Please select a pickup time.';
  if (!fields.mealId)      errors.mealId     = 'Please choose a meal.';
  if (!fields.quantity || fields.quantity < 1 || fields.quantity > 10)
    errors.quantity = 'Quantity must be between 1 and 10.';
  return errors;
}

/* ── Component ────────────────────────────────────────────────────────────── */
function PreOrderForm({
  meals    = DEFAULT_MEALS,
  onSubmit,
  loading  = false,
  successMsg = '',
  errorMsg   = '',
  initialMealId = '',
}) {
  const [fields, setFields] = useState({
    pickupDate: '',
    pickupTime: '',
    mealId:     initialMealId,
    quantity:   1,
    dietaryNotes: '',
  });

  useEffect(() => {
    if (initialMealId) {
      setFields((prev) => ({ ...prev, mealId: initialMealId }));
    }
  }, [initialMealId]);

  const [errors,  setErrors]  = useState({});
  const [touched, setTouched] = useState({});

  /* Derived: currently selected meal object */
  const selectedMeal = meals.find((m) => String(m.id) === String(fields.mealId));
  const totalCost = selectedMeal
    ? (selectedMeal.price * Number(fields.quantity)).toFixed(2)
    : null;

  const handleBlur = (e) =>
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate(fields);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setTouched({ pickupDate: true, pickupTime: true, mealId: true, quantity: true });
      return;
    }
    onSubmit && onSubmit({ ...fields, mealName: selectedMeal?.name, totalCost });
  };

  const showError = (field) => touched[field] && errors[field];

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
      noValidate
      aria-label="Meal pre-order form"
    >
      <h2 className={styles.title}>Pre-Order a Meal</h2>
      <p className={styles.subtitle}>
        Order ahead and skip the queue – ready for pickup at your chosen time.
      </p>

      {/* ── Global messages ──────────────────────────────────────────────── */}
      {successMsg && (
        <div className={styles.successBanner} role="alert">{successMsg}</div>
      )}
      {errorMsg && (
        <div className={styles.errorBanner} role="alert">{errorMsg}</div>
      )}

      {/* ── Pickup date and time ───────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
        <div className={styles.fieldGroup} style={{ flex: 1, minWidth: '150px', marginBottom: 0 }}>
          <label htmlFor="po-date" className={styles.label}>
            Pickup Date <span aria-hidden="true">*</span>
          </label>
          <input
            id="po-date"
            type="date"
            name="pickupDate"
            min={todayISO()}
            value={fields.pickupDate}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`${styles.input} ${showError('pickupDate') ? styles.inputError : ''}`}
            aria-invalid={!!showError('pickupDate')}
            aria-describedby={showError('pickupDate') ? 'po-date-error' : undefined}
          />
          {showError('pickupDate') && (
            <span id="po-date-error" className={styles.errorText} role="alert">
              {errors.pickupDate}
            </span>
          )}
        </div>

        <div className={styles.fieldGroup} style={{ flex: 1, minWidth: '150px', marginBottom: 0 }}>
          <label htmlFor="po-time" className={styles.label}>
            Pickup Time <span aria-hidden="true">*</span>
          </label>
          <input
            id="po-time"
            type="time"
            name="pickupTime"
            value={fields.pickupTime}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`${styles.input} ${showError('pickupTime') ? styles.inputError : ''}`}
            aria-invalid={!!showError('pickupTime')}
            aria-describedby={showError('pickupTime') ? 'po-time-error' : undefined}
          />
          {showError('pickupTime') && (
            <span id="po-time-error" className={styles.errorText} role="alert">
              {errors.pickupTime}
            </span>
          )}
        </div>
      </div>

      {/* ── Meal selection ───────────────────────────────────────────────── */}
      <div className={styles.fieldGroup}>
        <label htmlFor="po-meal" className={styles.label}>
          Choose Meal <span aria-hidden="true">*</span>
        </label>
        <select
          id="po-meal"
          name="mealId"
          value={fields.mealId}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`${styles.select} ${showError('mealId') ? styles.inputError : ''}`}
          aria-invalid={!!showError('mealId')}
          aria-describedby={showError('mealId') ? 'po-meal-error' : undefined}
        >
          <option value="">-- Select a meal --</option>
          {meals.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} – €{m.price.toFixed(2)}
            </option>
          ))}
        </select>
        {showError('mealId') && (
          <span id="po-meal-error" className={styles.errorText} role="alert">
            {errors.mealId}
          </span>
        )}
      </div>

      {/* ── Quantity ─────────────────────────────────────────────────────── */}
      <div className={styles.fieldGroup}>
        <label htmlFor="po-qty" className={styles.label}>
          Quantity <span aria-hidden="true">*</span>
        </label>
        <div className={styles.qtyRow}>
          <input
            id="po-qty"
            type="number"
            name="quantity"
            min="1"
            max="10"
            value={fields.quantity}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`${styles.input} ${styles.inputSmall} ${showError('quantity') ? styles.inputError : ''}`}
            aria-invalid={!!showError('quantity')}
            aria-describedby={showError('quantity') ? 'po-qty-error' : undefined}
          />
          {/* Live cost preview */}
          {totalCost && (
            <span className={styles.costPreview}>
              Total: <strong>€{totalCost}</strong>
            </span>
          )}
        </div>
        {showError('quantity') && (
          <span id="po-qty-error" className={styles.errorText} role="alert">
            {errors.quantity}
          </span>
        )}
      </div>

      {/* ── Dietary notes ────────────────────────────────────────────────── */}
      <div className={styles.fieldGroup}>
        <label htmlFor="po-notes" className={styles.label}>
          Dietary Notes <span className={styles.optional}>(optional)</span>
        </label>
        <textarea
          id="po-notes"
          name="dietaryNotes"
          rows="3"
          placeholder="e.g. no nuts, extra sauce…"
          value={fields.dietaryNotes}
          onChange={handleChange}
          className={styles.textarea}
        />
      </div>

      {/* ── Submit ───────────────────────────────────────────────────────── */}
      <button
        type="submit"
        className={styles.submitBtn}
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? <span className={styles.spinner} aria-hidden="true" /> : null}
        {loading ? 'Placing Order…' : 'Place Pre-Order'}
      </button>
    </form>
  );
}

export default PreOrderForm;
