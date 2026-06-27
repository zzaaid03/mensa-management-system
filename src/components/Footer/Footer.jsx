/**
 * Footer.jsx – Global site footer.
 *
 * Sections:
 *  - Brand column with short tagline
 *  - Quick links
 *  - Support links
 *  - Social media icons (SVG-based, no external icon library needed)
 *  - Bottom bar with copyright
 */
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const QUICK_LINKS = [
  { label: 'Menu',        to: '/' },
  { label: 'Pre-Order',   to: '/preorder' },
  { label: 'Reservation', to: '/reservation' },
];

const SUPPORT_LINKS = [
  { label: 'My Profile',  to: '/profile' },
  { label: 'Login',       to: '/login' },
  { label: 'Register',    to: '/register' },
];

const SOCIAL_LINKS = [
  {
    label: 'Instagram',
    href: '#',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
           strokeLinecap="round" strokeLinejoin="round" width="20" height="20"
           aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
      </svg>
    ),
  },
  {
    label: 'Twitter / X',
    href: '#',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"
           aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    label: 'Facebook',
    href: '#',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"
           aria-hidden="true">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
];

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.inner}>

        {/* ── Brand column ─────────────────────────────────────────────────── */}
        <div className={styles.brandCol}>
          <Link to="/" className={styles.brand} aria-label="UniMensa homepage">
            <span className={styles.brandIcon} aria-hidden="true">🍽️</span>
            <span className={styles.brandName}>
              Uni<span className={styles.brandAccent}>Mensa</span>
            </span>
          </Link>
          <p className={styles.tagline}>
            Fresh, nutritious, affordable – campus dining made simple.
          </p>

          {/* Social icons */}
          <div className={styles.social} role="list" aria-label="Social media">
            {SOCIAL_LINKS.map(({ label, href, icon }) => (
              <a
                key={label}
                href={href}
                className={styles.socialLink}
                aria-label={label}
                role="listitem"
                target="_blank"
                rel="noopener noreferrer"
              >
                {icon}
              </a>
            ))}
          </div>
        </div>

        {/* ── Quick links ───────────────────────────────────────────────────── */}
        <div className={styles.linkCol}>
          <h3 className={styles.colTitle}>Explore</h3>
          <ul className={styles.linkList}>
            {QUICK_LINKS.map(({ label, to }) => (
              <li key={to}>
                <Link to={to} className={styles.footerLink}>{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Account / support links ───────────────────────────────────────── */}
        <div className={styles.linkCol}>
          <h3 className={styles.colTitle}>Account</h3>
          <ul className={styles.linkList}>
            {SUPPORT_LINKS.map(({ label, to }) => (
              <li key={to}>
                <Link to={to} className={styles.footerLink}>{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Contact info column ───────────────────────────────────────────── */}
        <div className={styles.linkCol}>
          <h3 className={styles.colTitle}>Contact</h3>
          <ul className={styles.contactList}>
            <li>📍 Campus Building A, Room 101</li>
            <li>✉️ mensa@university.edu</li>
            <li>📞 +49 (0) 221 123 456</li>
            <li className={styles.openingHours}>
              <strong>Opening Hours</strong><br />
              Mon–Fri: 07:30 – 18:00<br />
              Sat: 09:00 – 14:00
            </li>
          </ul>
        </div>
      </div>

      {/* ── Bottom bar ──────────────────────────────────────────────────────── */}
      <div className={styles.bottomBar}>
        <div className={styles.bottomInner}>
          <p className={styles.copyright}>
            &copy; {year} UniMensa Management System. All rights reserved.
          </p>
          <p className={styles.credits}>
            Built by Zaid, Mika, Ali, Mathis &amp; Wasim
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
