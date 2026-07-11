import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { createPreOrder } from '../../services/preorderService';
import DateTimePicker from '../../components/DateTimePicker/DateTimePicker';
import styles from './Cart.module.css';

function Cart() {
  const { items, itemCount, totalPrice, updateQuantity, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [pickupDate, setPickupDate] = useState(new Date().toISOString().split('T')[0]);
  const [pickupTime, setPickupTime] = useState('12:00');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (items.length === 0) return;

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // Build the order payload with multiple items
      const orderData = {
        items: items.map((it) => ({
          mealId: it.id,
          quantity: it.quantity,
        })),
        pickupDate,
        pickupTime,
      };

      const res = await createPreOrder(orderData);
      if (res?.success) {
        setSuccessMsg('Order placed successfully! Redirecting...');
        clearCart();
        setTimeout(() => navigate('/menu'), 2000);
      } else {
        setErrorMsg('Failed to place order. Try again.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && !successMsg) {
    return (
      <div className="container py-8">
        <button className={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>
        <h1 className="section-title">Your Cart</h1>
        <div className={styles.emptyCart}>
          <span className={styles.emptyIcon}>🛒</span>
          <p>Your cart is empty.</p>
          <button className={styles.browseBtn} onClick={() => navigate('/menu')}>
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <button className={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>
      <h1 className="section-title">Your Cart ({itemCount} item{itemCount !== 1 ? 's' : ''})</h1>

      {successMsg && <div className={styles.successBanner}>{successMsg}</div>}
      {errorMsg && <div className={styles.errorBanner}>{errorMsg}</div>}

      <div className={styles.layout}>
        {/* ── Cart items ─────────────────────────────────────────── */}
        <div className={styles.itemsCol}>
          {items.map((item) => (
            <div key={item.id} className={styles.cartItem}>
              {item.image && (
                <img src={item.image} alt={item.name} className={styles.itemImage} />
              )}
              <div className={styles.itemInfo}>
                <h3 className={styles.itemName}>{item.name}</h3>
                <p className={styles.itemPrice}>€{item.price.toFixed(2)} each</p>
              </div>
              <div className={styles.qtyControls}>
                <button
                  className={styles.qtyBtn}
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  aria-label="Decrease quantity"
                >−</button>
                <span className={styles.qtyValue}>{item.quantity}</span>
                <button
                  className={styles.qtyBtn}
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  aria-label="Increase quantity"
                >+</button>
              </div>
              <div className={styles.itemTotal}>
                €{(item.price * item.quantity).toFixed(2)}
              </div>
              <button
                className={styles.removeBtn}
                onClick={() => removeItem(item.id)}
                aria-label={`Remove ${item.name}`}
              >✕</button>
            </div>
          ))}

          <button className={styles.clearBtn} onClick={clearCart}>
            Clear Cart
          </button>
        </div>

        {/* ── Checkout summary ────────────────────────────────────── */}
        <div className={styles.summaryCol}>
          <div className={styles.summaryCard}>
            <h2 className={styles.summaryTitle}>Checkout</h2>

            <div className={styles.pickupSection}>
              <h4>Pickup Time</h4>
              <DateTimePicker
                selectedDate={pickupDate}
                onDateChange={setPickupDate}
                selectedTime={pickupTime}
                onTimeChange={setPickupTime}
                dateLabel="Pickup Day"
                timeLabel="Pickup Time"
              />
            </div>

            <hr className={styles.divider} />

            <div className={styles.summaryRow}>
              <span>Items</span>
              <span>{itemCount}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>€{totalPrice.toFixed(2)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Total</span>
              <span className={styles.totalPrice}>€{totalPrice.toFixed(2)}</span>
            </div>

            <button
              className={styles.checkoutBtn}
              onClick={handleCheckout}
              disabled={loading || items.length === 0}
            >
              {loading ? 'Placing Order…' : 'Place Order'}
            </button>

            {!user && (
              <p className={styles.loginHint}>Please log in to place your order.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
