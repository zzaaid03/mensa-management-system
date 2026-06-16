/**
 * Navbar.jsx – Global navigation bar.
 *
 * Features:
 *  - Logo + brand name
 *  - Desktop horizontal nav links
 *  - Responsive hamburger menu (mobile)
 *  - Active-link highlighting via NavLink
 *  - Auth buttons: Login / Register (or profile avatar when authenticated)
 *
 * Props: none (reads auth state from context in a future phase)
 */
import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import styles from './Navbar.module.css';

/* ── Navigation link definitions ─────────────────────────────────────────── */
const NAV_LINKS = [
  { label: 'Home',        to: '/' },
  { label: 'Menu',        to: '/menu' },
  { label: 'Pre-Order',   to: '/preorder' },
  { label: 'Reservation', to: '/reservation' },
];

function Navbar() {
  const [menuOpen, setMenuOpen]     = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const menuRef                     = useRef(null);
  const location                    = useLocation();

  /* Close the mobile menu whenever the route changes */
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  /* Add a shadow to the navbar once the user scrolls down */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Close the mobile menu when clicking outside it */
  useEffect(() => {
    if (!menuOpen) return;
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [menuOpen]);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  return (
    <header
      className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ''}`}
      role="banner"
    >
      <div className={styles.inner} ref={menuRef}>

        {/* ── Brand / Logo ───────────────────────────────────────────────── */}
        <Link to="/" className={styles.brand} aria-label="UniMensa – go to homepage">
          <span className={styles.brandIcon} aria-hidden="true">🍽️</span>
          <span className={styles.brandName}>
            Uni<span className={styles.brandAccent}>Mensa</span>
          </span>
        </Link>

        {/* ── Desktop navigation links ───────────────────────────────────── */}
        <nav className={styles.desktopNav} aria-label="Primary navigation">
          <ul className={styles.navList}>
            {NAV_LINKS.map(({ label, to }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* ── Auth buttons (desktop) ─────────────────────────────────────── */}
        <div className={styles.authButtons}>
          <Link to="/login"    className={styles.btnOutline}>Login</Link>
          <Link to="/register" className={styles.btnPrimary}>Register</Link>
        </div>

        {/* ── Hamburger toggle (mobile) ──────────────────────────────────── */}
        <button
          className={`${styles.hamburger} ${menuOpen ? styles.hamburgerOpen : ''}`}
          onClick={toggleMenu}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
        </button>
      </div>

      {/* ── Mobile slide-down menu ─────────────────────────────────────────── */}
      <div
        id="mobile-menu"
        className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`}
        aria-hidden={!menuOpen}
      >
        <nav aria-label="Mobile navigation">
          <ul className={styles.mobileNavList}>
            {NAV_LINKS.map(({ label, to }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `${styles.mobileNavLink} ${isActive ? styles.mobileNavLinkActive : ''}`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.mobileAuthButtons}>
          <Link to="/login"    className={styles.mobileBtnOutline}>Login</Link>
          <Link to="/register" className={styles.mobileBtnPrimary}>Register</Link>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
