// preorderService.js – API wrappers for pre-orders
import api from './api';

export async function createPreOrder(data) {
  try {
    const payload = {
      items: [
        {
          meal_id: parseInt(data.mealId, 10),
          quantity: parseInt(data.quantity, 10),
        }
      ],
      pickup_time: `${data.pickupDate}T${data.pickupTime}:00`
    };
    
    const response = await api.post('/orders', payload);
    return { success: true, data: response.data };
  } catch (error) {
    const message = typeof error.response?.data?.detail === 'string'
      ? error.response.data.detail
      : Array.isArray(error.response?.data?.detail)
      ? error.response.data.detail[0]?.msg
      : 'Failed to place pre-order';
    throw new Error(message);
  }
}

export default {
  createPreOrder,
};
