import React, { useEffect, useState } from "react";
import PreOrderForm from "../../components/PreOrderForm/PreOrderForm";
import { createPreOrder } from "../../services/preorderService";
import { getMeals } from "../../services/mealService";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function PreOrder() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // If navigated from Home or MealDetails, a selected mealId may be present in state
  const initialMealId = location?.state?.mealId || "";

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    async function loadMeals() {
      const data = await getMeals();
      // Filter out unavailable meals for pre-orders
      setMeals(data.filter((m) => m.available));
    }
    loadMeals();
  }, []);

  const handleSubmit = async (data) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await createPreOrder(data);
      if (res?.success) {
        setSuccessMsg("Pre-order placed successfully! Redirecting...");
        setTimeout(() => navigate("/"), 2000);
      } else {
        setErrorMsg("Failed to place pre-order. Try again later.");
      }
    } catch (err) {
      setErrorMsg(err.message || "An unexpected error occurred.");
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
      <h1 className="section-title">Pre-Order</h1>
      <p className="section-subtitle">
        Place a pre-order so your meal is ready when you arrive.
      </p>

      <PreOrderForm
        meals={meals.length > 0 ? meals : undefined}
        initialMealId={initialMealId}
        onSubmit={handleSubmit}
        loading={loading}
        successMsg={successMsg}
        errorMsg={errorMsg}
      />
    </div>
  );
}

export default PreOrder;
