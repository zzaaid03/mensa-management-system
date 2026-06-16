import React from 'react';
import styles from './Menu.module.css';

function Menu() {
  return (
    <div className="container py-8">
      <h1 className="section-title">Menu</h1>
      <p className="section-subtitle">Our full menu will be available here. For now this page is a placeholder.</p>

      <div className={styles.placeholder}>
        <img src="https://picsum.photos/seed/menu/900/360" alt="Menu placeholder" />
        <p className={styles.hint}>Menu and filtering will be implemented in Phase 2–3.</p>
      </div>
    </div>
  );
}

export default Menu;
