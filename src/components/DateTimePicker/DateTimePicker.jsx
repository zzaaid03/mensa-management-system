import React, { useEffect } from 'react';
import styles from './DateTimePicker.module.css';

const TIME_SLOTS = [
  '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00'
];

const isTimeSlotInPast = (dateStr, timeStr) => {
  const today = new Date();
  const todayStr = today.getFullYear() + '-' + 
    String(today.getMonth() + 1).padStart(2, '0') + '-' + 
    String(today.getDate()).padStart(2, '0');
  
  if (dateStr !== todayStr) return false;

  const [hours, minutes] = timeStr.split(':').map(Number);
  const currentHours = today.getHours();
  const currentMinutes = today.getMinutes();

  if (hours < currentHours) return true;
  if (hours === currentHours && minutes <= currentMinutes) return true;

  return false;
};

const getNext7Days = () => {
  const days = [];
  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
    let label = d.toLocaleDateString('en-US', options);
    if (i === 0) label = 'Today';
    if (i === 1) label = 'Tomorrow';
    days.push({ dateStr, label });
  }
  return days;
};

function DateTimePicker({
  selectedDate,
  onDateChange,
  selectedTime,
  onTimeChange,
  dateLabel = 'Choose Day',
  timeLabel = 'Choose Time Slot',
}) {
  const days = getNext7Days();
  const availableSlots = TIME_SLOTS.filter((t) => !isTimeSlotInPast(selectedDate, t));

  // Automatically adjust selection if current selection is invalid (e.g. in the past)
  useEffect(() => {
    const slots = TIME_SLOTS.filter((t) => !isTimeSlotInPast(selectedDate, t));
    if (selectedTime && !slots.includes(selectedTime)) {
      if (slots.length > 0) {
        onTimeChange(slots[0]);
      } else {
        onTimeChange('');
      }
    }
  }, [selectedDate, selectedTime, onTimeChange]);

  return (
    <div className={styles.container}>
      {/* Day Selector */}
      <div className={styles.section}>
        <span className={styles.label}>{dateLabel} *</span>
        <div className={styles.daysRow}>
          {days.map((d) => (
            <button
              key={d.dateStr}
              type="button"
              className={`${styles.dayButton} ${selectedDate === d.dateStr ? styles.active : ''}`}
              onClick={() => onDateChange(d.dateStr)}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Time Selector */}
      <div className={styles.section}>
        <span className={styles.label}>{timeLabel} *</span>
        {availableSlots.length > 0 ? (
          <div className={styles.timeGrid}>
            {availableSlots.map((t) => (
              <button
                key={t}
                type="button"
                className={`${styles.timeButton} ${selectedTime === t ? styles.active : ''}`}
                onClick={() => onTimeChange(t)}
              >
                {t}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-muted text-sm">No time slots available for this day. Please select another day.</p>
        )}
      </div>
    </div>
  );
}

export default DateTimePicker;
