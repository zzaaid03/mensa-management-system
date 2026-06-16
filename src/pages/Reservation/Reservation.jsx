import React, { useState } from 'react';
import ReservationForm from '../../components/ReservationForm/ReservationForm';
import { createReservation } from '../../services/reservationService';
import styles from './Reservation.module.css';

function Reservation() {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (data) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await createReservation(data);
      if (res?.success) {
        setSuccessMsg('Reservation confirmed — we look forward to seeing you!');
      } else {
        setErrorMsg('Could not create reservation. Please try again later.');
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <h1 className="section-title">Reserve a Table</h1>
      <p className="section-subtitle">Reserve a table for lunch or events.</p>

      <ReservationForm
        onSubmit={handleSubmit}
        loading={loading}
        successMsg={successMsg}
        errorMsg={errorMsg}
      />
    </div>
  );
}

export default Reservation;
