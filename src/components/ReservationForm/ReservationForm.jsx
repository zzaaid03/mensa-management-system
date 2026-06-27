/**
 * ReservationForm.jsx – Reusable table-reservation form.
 *
 * Props:
 *  @param {function} onSubmit        - Called with form data object on valid submit
 *  @param {boolean}  [loading=false] - Shows a spinner on the submit button
 *  @param {string}   [successMsg]    - Displayed after successful submission
 *  @param {string}   [errorMsg]      - Displayed when an API error occurs
 *
 * NOTE: No backend connection yet – form validation only.
 */
import React, { useState } from 'react';
import styles from './ReservationForm.module.css';
import DateTimePicker from '../DateTimePicker/DateTimePicker';

/* ── Time slot options ────────────────────────────────────────────────────── */
const TIME_SLOTS = [
  '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30',
  '17:00', '17:30', '18:00',
];

/* ── Helpers ──────────────────────────────────────────────────────────────── */
/** Returns today's date in YYYY-MM-DD format – used as min for the date picker */
const todayISO = () => new Date().toISOString().split('T')[0];

/** Simple field-level validation */
function validate(fields, tables) {
  const errors = {};
  if (!fields.date)        errors.date    = 'Please select a date.';
  if (!fields.timeSlot)    errors.timeSlot = 'Please select a time slot.';
  if (!fields.tableId)     errors.tableId = 'Please choose a table.';
  if (!fields.seats || fields.seats < 1 || fields.seats > 20) {
    errors.seats = 'Enter a number between 1 and 20.';
  } else if (fields.tableId && tables) {
    const selected = tables.find(t => String(t.id) === String(fields.tableId));
    if (selected && fields.seats > selected.seats) {
      errors.seats = `Table only has ${selected.seats} seats.`;
    }
  }
  if (!fields.name.trim()) errors.name    = 'Name is required.';
  if (!fields.email.trim() || !/\S+@\S+\.\S+/.test(fields.email))
    errors.email = 'Enter a valid email address.';
  return errors;
}

/* ── Component ────────────────────────────────────────────────────────────── */
function ReservationForm({ tables = [], onSubmit, loading = false, successMsg = '', errorMsg = '' }) {
  const [fields, setFields] = useState({
    date:     todayISO(),
    timeSlot: '12:00',
    tableId:  '',
    seats:    2,
    name:     '',
    email:    '',
    notes:    '',
  });

  const [errors,  setErrors]  = useState({});
  const [touched, setTouched] = useState({});

  /* Mark a field as touched when the user leaves it */
  const handleBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    /* Clear the error for this field while the user is correcting it */
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate(fields, tables);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      /* Touch all fields so errors become visible */
      setTouched({ date: true, timeSlot: true, tableId: true, seats: true, name: true, email: true });
      return;
    }
    onSubmit && onSubmit(fields);
  };

  /* Show error only when the field has been touched */
  const showError = (field) => touched[field] && errors[field];

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
      noValidate
      aria-label="Table reservation form"
    >
      <h2 className={styles.title}>Reserve a Table</h2>
      <p className={styles.subtitle}>
        Choose your preferred date, time, and party size.
      </p>

      {/* ── Global messages ──────────────────────────────────────────────── */}
      {successMsg && (
        <div className={styles.successBanner} role="alert">{successMsg}</div>
      )}
      {errorMsg && (
        <div className={styles.errorBanner} role="alert">{errorMsg}</div>
      )}

      {/* ── Custom Date & Time Picker ─────────────────────────────────────── */}
      <DateTimePicker
        selectedDate={fields.date}
        onDateChange={(val) => {
          setFields(prev => ({ ...prev, date: val }));
          if (errors.date) setErrors(prev => ({ ...prev, date: undefined }));
        }}
        selectedTime={fields.timeSlot}
        onTimeChange={(val) => {
          setFields(prev => ({ ...prev, timeSlot: val }));
          if (errors.timeSlot) setErrors(prev => ({ ...prev, timeSlot: undefined }));
        }}
        dateLabel="Reservation Day"
        timeLabel="Reservation Time"
      />

      {/* ── Table & Seats ────────────────────────────────────────────────── */}
      <div className={styles.row}>
        <div className={styles.fieldGroup} style={{ flex: 2 }}>
          <label htmlFor="res-table" className={styles.label}>
            Choose Table <span aria-hidden="true">*</span>
          </label>
          <select
            id="res-table"
            name="tableId"
            value={fields.tableId}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`${styles.select} ${showError('tableId') ? styles.inputError : ''}`}
            aria-invalid={!!showError('tableId')}
            aria-describedby={showError('tableId') ? 'table-error' : undefined}
          >
            <option value="">-- Choose a table --</option>
            {tables.map((t) => (
              <option key={t.id} value={t.id}>
                Table {t.table_number} ({t.seats} seats, {t.location})
              </option>
            ))}
          </select>
          {showError('tableId') && (
            <span id="table-error" className={styles.errorText} role="alert">
              {errors.tableId}
            </span>
          )}
        </div>

        <div className={styles.fieldGroup} style={{ flex: 1 }}>
          <label htmlFor="res-seats" className={styles.label}>
            Number of Seats <span aria-hidden="true">*</span>
          </label>
          <input
            id="res-seats"
            type="number"
            name="seats"
            min="1"
            max="20"
            value={fields.seats}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`${styles.input} ${styles.inputSmall} ${showError('seats') ? styles.inputError : ''}`}
            aria-invalid={!!showError('seats')}
            aria-describedby={showError('seats') ? 'seats-error' : undefined}
            style={{ width: '100%' }}
          />
          {showError('seats') && (
            <span id="seats-error" className={styles.errorText} role="alert">
              {errors.seats}
            </span>
          )}
        </div>
      </div>

      {/* ── Row 2: Name & Email ───────────────────────────────────────────── */}
      <div className={styles.row}>
        <div className={styles.fieldGroup}>
          <label htmlFor="res-name" className={styles.label}>
            Full Name <span aria-hidden="true">*</span>
          </label>
          <input
            id="res-name"
            type="text"
            name="name"
            placeholder="Jane Doe"
            autoComplete="name"
            value={fields.name}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`${styles.input} ${showError('name') ? styles.inputError : ''}`}
            aria-invalid={!!showError('name')}
            aria-describedby={showError('name') ? 'name-error' : undefined}
          />
          {showError('name') && (
            <span id="name-error" className={styles.errorText} role="alert">
              {errors.name}
            </span>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="res-email" className={styles.label}>
            Email <span aria-hidden="true">*</span>
          </label>
          <input
            id="res-email"
            type="email"
            name="email"
            placeholder="jane@university.edu"
            autoComplete="email"
            value={fields.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`${styles.input} ${showError('email') ? styles.inputError : ''}`}
            aria-invalid={!!showError('email')}
            aria-describedby={showError('email') ? 'email-error' : undefined}
          />
          {showError('email') && (
            <span id="email-error" className={styles.errorText} role="alert">
              {errors.email}
            </span>
          )}
        </div>
      </div>

      {/* ── Special requests ─────────────────────────────────────────────── */}
      <div className={styles.fieldGroup}>
        <label htmlFor="res-notes" className={styles.label}>
          Special Requests <span className={styles.optional}>(optional)</span>
        </label>
        <textarea
          id="res-notes"
          name="notes"
          rows="3"
          placeholder="e.g. wheelchair accessible, window seat…"
          value={fields.notes}
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
        {loading ? (
          <span className={styles.spinner} aria-hidden="true" />
        ) : null}
        {loading ? 'Booking…' : 'Confirm Reservation'}
      </button>
    </form>
  );
}

export default ReservationForm;
