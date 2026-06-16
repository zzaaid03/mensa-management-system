/**
 * UserCard.jsx – Reusable card displaying a user's profile summary.
 *
 * Props:
 *  @param {object}  user              - User data object
 *  @param {string}  user.name         - Full name
 *  @param {string}  user.email        - Email address
 *  @param {string}  [user.role]       - "Student" | "Staff" | "Admin"
 *  @param {string}  [user.avatar]     - Avatar image URL
 *  @param {string}  [user.studentId]  - Student / staff ID
 *  @param {string}  [user.faculty]    - Faculty or department
 *  @param {number}  [user.orders]     - Total pre-orders placed
 *  @param {number}  [user.reservations] - Total reservations made
 *  @param {boolean} [compact=false]   - Renders a smaller card variant
 *  @param {function}[onEditProfile]   - Called when "Edit Profile" is clicked
 */
import React from 'react';
import styles from './UserCard.module.css';

/* ── Role badge colours ───────────────────────────────────────────────────── */
function getRoleClass(role) {
  const map = {
    student: styles.roleStudent,
    staff:   styles.roleStaff,
    admin:   styles.roleAdmin,
  };
  return map[(role || '').toLowerCase()] || styles.roleDefault;
}

/* ── Avatar fallback – generates initials from name ─────────────────────── */
function AvatarFallback({ name }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  return (
    <div className={styles.avatarFallback} aria-hidden="true">
      {initials}
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────────────────────── */
function UserCard({ user, compact = false, onEditProfile }) {
  const {
    name         = 'Unknown User',
    email        = '',
    role         = 'Student',
    avatar       = '',
    studentId    = '',
    faculty      = '',
    orders       = 0,
    reservations = 0,
  } = user || {};

  return (
    <article
      className={`${styles.card} ${compact ? styles.cardCompact : ''}`}
      aria-label={`User profile: ${name}`}
    >
      {/* ── Avatar ────────────────────────────────────────────────────── */}
      <div className={styles.avatarWrapper}>
        {avatar ? (
          <img
            src={avatar}
            alt={`${name}'s avatar`}
            className={styles.avatar}
          />
        ) : (
          <AvatarFallback name={name} />
        )}
        <span className={`${styles.roleBadge} ${getRoleClass(role)}`}>
          {role}
        </span>
      </div>

      {/* ── Info ──────────────────────────────────────────────────────── */}
      <div className={styles.info}>
        <h3 className={styles.name}>{name}</h3>
        <p  className={styles.email}>{email}</p>

        {!compact && (
          <>
            {studentId && (
              <p className={styles.detail}>
                <span className={styles.detailLabel}>ID:</span> {studentId}
              </p>
            )}
            {faculty && (
              <p className={styles.detail}>
                <span className={styles.detailLabel}>Faculty:</span> {faculty}
              </p>
            )}
          </>
        )}
      </div>

      {/* ── Stats (hidden in compact mode) ────────────────────────────── */}
      {!compact && (
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{orders}</span>
            <span className={styles.statLabel}>Pre-Orders</span>
          </div>
          <div className={styles.statDivider} aria-hidden="true" />
          <div className={styles.stat}>
            <span className={styles.statValue}>{reservations}</span>
            <span className={styles.statLabel}>Reservations</span>
          </div>
        </div>
      )}

      {/* ── Action ────────────────────────────────────────────────────── */}
      {onEditProfile && (
        <button
          className={styles.editBtn}
          onClick={() => onEditProfile(user)}
          aria-label={`Edit profile for ${name}`}
        >
          Edit Profile
        </button>
      )}
    </article>
  );
}

export default UserCard;
