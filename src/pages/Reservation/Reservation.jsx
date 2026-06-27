import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReservationForm from '../../components/ReservationForm/ReservationForm';
import { createReservation } from '../../services/reservationService';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import styles from './Reservation.module.css';

function Reservation() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    async function loadTables() {
      try {
        const response = await api.get('/tables/available');
        setTables(response.data);
      } catch (err) {
        console.error('Failed to load available tables', err);
      }
    }
    loadTables();
  }, []);

  const handleSubmit = async (data) => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await createReservation(data);
      if (res?.success) {
        setSuccessMsg('Reservation confirmed — we look forward to seeing you!');
      } else {
        setErrorMsg('Could not create reservation. Please try again later.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="container py-8 text-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="section-title">Reserve a Table</h1>
      <p className="section-subtitle">Reserve a table for lunch or events.</p>

      <ReservationForm
        tables={tables}
        onSubmit={handleSubmit}
        loading={loading}
        successMsg={successMsg}
        errorMsg={errorMsg}
      />
    </div>
  );
}

export default Reservation;
