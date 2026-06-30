/**
 * DateTimePicker.jsx – Combines a date input and a time select into one reusable component.
 *
 * Props:
 *  @param {string}   selectedDate   - Current YYYY-MM-DD value
 *  @param {function} onDateChange   - Called with the new date string
 *  @param {string}   selectedTime   - Current HH:MM value
 *  @param {function} onTimeChange   - Called with the new time string
 *  @param {string}   [dateLabel="Date"]
 *  @param {string}   [timeLabel="Time"]
 */
import React from 'react';
import styles from './DateTimePicker.module.css';

const TIME_SLOTS = [
  '07:00', '07:30', '08:00', '08:30',
  '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30',
  '17:00', '17:30', '18:00',
];

const todayISO = () => new Date().toISOString().split('T')[0];

function DateTimePicker({
  selectedDate,
  onDateChange,
  selectedTime,
  onTimeChange,
  dateLabel = 'Date',
  timeLabel = 'Time',
}) {
  return (
    <div className={styles.row}>
      {/* ── Date ──────────────────────── */}
      <div className={styles.field}>
        <label className={styles.label}>{dateLabel}</label>
        <input
          type="date"
          className={styles.input}
          min={todayISO()}
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
        />
      </div>

      {/* ── Time ──────────────────────── */}
      <div className={styles.field}>
        <label className={styles.label}>{timeLabel}</label>
        <select
          className={styles.select}
          value={selectedTime}
          onChange={(e) => onTimeChange(e.target.value)}
        >
          {TIME_SLOTS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default DateTimePicker;
