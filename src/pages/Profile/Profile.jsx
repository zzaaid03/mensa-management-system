import React from 'react';
import UserCard from '../../components/UserCard/UserCard';

function Profile() {
  // Mock user until auth is implemented
  const user = {
    name: 'Jane Student',
    email: 'jane.student@university.edu',
    role: 'Student',
    studentId: 'S1234567',
    faculty: 'Computer Science',
    orders: 12,
    reservations: 3,
  };

  const handleEdit = (u) => {
    alert('Edit profile not implemented yet for ' + u.name);
  };

  return (
    <div className="container py-8">
      <h1 className="section-title">My Profile</h1>
      <p className="section-subtitle">Manage your account, pre-orders and reservations.</p>

      <div style={{ maxWidth: 800, marginTop: 24 }}>
        <UserCard user={user} onEditProfile={handleEdit} />
      </div>
    </div>
  );
}

export default Profile;
