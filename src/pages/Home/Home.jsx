import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./Home.module.css";

function Home() {
  const { user } = useAuth();

  return (
    <div className={styles.hero}>
      <div className={styles.heroContent}>
        <span className={styles.badge}>Campus Dining</span>
        <h1 className={styles.title}>Fresh meals, fast service</h1>
        <p className={styles.lead}>
          UniMensa brings you daily nutritious meals prepared on campus. Browse
          the menu, pre-order to skip the queue, or reserve a table.
        </p>

        {user ? (
          <div className={styles.ctaRow}>
            <Link to="/menu" className={styles.btnPrimary}>
              Browse Menu
            </Link>
            {user.role === "admin" ? (
              <Link to="/admin" className={styles.btnOutline}>
                Admin Dashboard
              </Link>
            ) : (
              <Link to="/profile" className={styles.btnOutline}>
                My Profile
              </Link>
            )}
          </div>
        ) : (
          <div className={styles.ctaRow}>
            <Link to="/login" className={styles.btnPrimary}>
              Login
            </Link>
            <Link to="/register" className={styles.btnOutline}>
              Register
            </Link>
          </div>
        )}

        <div className={styles.features}>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>🥗</span>
            <span>Nutrition Info</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>⏱️</span>
            <span>Pre-Order</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>📅</span>
            <span>Reserve Table</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>💳</span>
            <span>Student Card</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
