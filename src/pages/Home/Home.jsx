import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MealCard from '../../components/MealCard/MealCard';
import { getMeals } from '../../services/mealService';
import styles from './Home.module.css';

function Home() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    getMeals().then((data) => {
      if (!mounted) return;
      setMeals(data || []);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const featured = meals.slice(0, 6);

  const handlePreOrder = (meal) => {
    // Navigate to the pre-order page and pass selected meal id in state
    navigate('/preorder', { state: { mealId: meal.id } });
  };

  return (
    <div>
      {/* Hero */}
      <section className={`${styles.hero} container`}>
        <div className={styles.heroInner}>
          <div>
            <span className="badge badge-green">Campus Dining</span>
            <h1 className={styles.title}>Fresh meals, fast service</h1>
            <p className={styles.lead}>
              UniMensa brings you daily nutritious meals prepared on campus. Browse the menu, pre-order to skip the queue, or reserve a table.
            </p>
            <div className={styles.ctaRow}>
              <Link to="/menu" className="btnOutline">View Menu</Link>
              <Link to="/preorder" className="btnPrimary">Pre-Order</Link>
            </div>
          </div>
          <div className={styles.heroImage} aria-hidden="true">
            {/* decorative image – responsive */}
            <img src={`https://picsum.photos/seed/mensa-hero/800/520`} alt="Fresh meal on campus" />
          </div>
        </div>
      </section>

      {/* Featured meals */}
      <section className="section">
        <div className="container">
          <div className="section-title">Featured Today</div>
          <div className="section-subtitle mb-4">Popular choices from our chefs — updated daily.</div>

          {loading ? (
            <p>Loading meals…</p>
          ) : (
            <div className={styles.grid}>
              {featured.map((m) => (
                <MealCard key={m.id} meal={m} onPreOrder={handlePreOrder} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Benefits */}
      <section className="section">
        <div className="container">
          <div className="section-title">Why UniMensa</div>
          <div className="section-subtitle mb-6">We focus on healthy, affordable food and convenience for the whole campus.</div>

          <div className={styles.benefits}>
            <div className={styles.benefitCard}>
              <div className={styles.benefitIcon}>🥗</div>
              <h4>Nutritious Options</h4>
              <p className="text-muted">Balanced meals with calorie info and dietary tags.</p>
            </div>

            <div className={styles.benefitCard}>
              <div className={styles.benefitIcon}>⏱️</div>
              <h4>Skip the Queue</h4>
              <p className="text-muted">Pre-order meals and collect them at a set time.</p>
            </div>

            <div className={styles.benefitCard}>
              <div className={styles.benefitIcon}>💶</div>
              <h4>Affordable Prices</h4>
              <p className="text-muted">Special student pricing and daily offers.</p>
            </div>

            <div className={styles.benefitCard}>
              <div className={styles.benefitIcon}>📅</div>
              <h4>Reserve a Table</h4>
              <p className="text-muted">Book ahead for groups or events.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
