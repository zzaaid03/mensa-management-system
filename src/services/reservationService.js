// reservationService.js – placeholder API wrappers for reservations
import api from './api';

export async function createReservation(data) {
  // Placeholder implementation – replace with api.post('/reservations', data)
  const created = { id: `res_${Date.now()}`, ...data };
  return new Promise((resolve) => setTimeout(() => resolve({ success: true, data: created }), 400));
}

export default {
  createReservation,
};
