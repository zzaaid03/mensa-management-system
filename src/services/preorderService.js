// preorderService.js – placeholder API wrappers for pre-orders
import api from './api';

export async function createPreOrder(data) {
  // Placeholder implementation – replace with api.post('/preorders', data)
  const created = { id: `po_${Date.now()}`, ...data };
  return new Promise((resolve) => setTimeout(() => resolve({ success: true, data: created }), 400));
}

export default {
  createPreOrder,
};
