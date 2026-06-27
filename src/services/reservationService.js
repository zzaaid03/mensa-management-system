// reservationService.js – API wrappers for reservations
import api from './api';

export async function createReservation(data) {
  try {
    const payload = {
      table_id: parseInt(data.tableId, 10),
      reservation_time: `${data.date}T${data.timeSlot}:00`,
      number_of_people: parseInt(data.seats, 10),
    };
    
    const response = await api.post('/reservations', payload);
    return { success: true, data: response.data };
  } catch (error) {
    const message = typeof error.response?.data?.detail === 'string'
      ? error.response.data.detail
      : Array.isArray(error.response?.data?.detail)
      ? error.response.data.detail[0]?.msg
      : 'Failed to create reservation';
    throw new Error(message);
  }
}

export default {
  createReservation,
};
