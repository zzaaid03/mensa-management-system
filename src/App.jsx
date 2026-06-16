/**
 * App.jsx – Root component.
 * Defines all client-side routes using React Router v6.
 *
 * Routes:
 *  /             → Home
 *  /login        → Login
 *  /register     → Register
 *  /menu         → Menu  (placeholder – backend not connected yet)
 *  /meal/:id     → MealDetails (placeholder)
 *  /reservation  → Reservation (placeholder)
 *  /preorder     → PreOrder (placeholder)
 *  /profile      → Profile (placeholder)
 */
import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';

// ── Fully implemented pages ──────────────────────────────────────────────────
import Home       from './pages/Home/Home';
import Login      from './pages/Login/Login';
import Register   from './pages/Register/Register';

// ── Placeholder pages (backend integration pending) ──────────────────────────
import Menu        from './pages/Menu/Menu';
import MealDetails from './pages/MealDetails/MealDetails';
import Reservation from './pages/Reservation/Reservation';
import PreOrder    from './pages/PreOrder/PreOrder';
import Profile     from './pages/Profile/Profile';

function App() {
  return (
    <div className="app-wrapper">
      {/* Global navigation bar – rendered on every page */}
      <Navbar />

      {/* Main content area */}
      <main className="main-content">
        <Routes>
          <Route path="/"            element={<Home />} />
          <Route path="/login"       element={<Login />} />
          <Route path="/register"    element={<Register />} />
          <Route path="/menu"        element={<Menu />} />
          <Route path="/meal/:id"    element={<MealDetails />} />
          <Route path="/reservation" element={<Reservation />} />
          <Route path="/preorder"    element={<PreOrder />} />
          <Route path="/profile"     element={<Profile />} />
        </Routes>
      </main>

      {/* Global footer – rendered on every page */}
      <Footer />
    </div>
  );
}

export default App;
