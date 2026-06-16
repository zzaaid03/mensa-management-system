import React, { useState } from 'react';
import PreOrderForm from '../../components/PreOrderForm/PreOrderForm';
import { createPreOrder } from '../../services/preorderService';
import { useLocation } from 'react-router-dom';

function PreOrder() {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const location = useLocation();

  // If navigated from Home or MealDetails, a selected mealId may be present in state
  const initialMealId = location?.state?.mealId || '';

  const handleSubmit = async (data) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await createPreOrder(data);
      if (res?.success) {
        setSuccessMsg('Pre-order placed successfully! Pick up at your chosen time.');
      } else {
        setErrorMsg('Failed to place pre-order. Try again later.');
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <h1 className="section-title">Pre-Order</h1>
      <p className="section-subtitle">Place a pre-order so your meal is ready when you arrive.</p>

      <PreOrderForm
        meals={undefined}
        onSubmit={handleSubmit}
        loading={loading}
        successMsg={successMsg}
        errorMsg={errorMsg}
      />
    </div>
  );
}

export default PreOrder;
