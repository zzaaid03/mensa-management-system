// preorderService.js – API wrappers for pre-orders (supports multi-item cart)
import api from "./api";

/**
 * Create a pre-order. Supports both single-item and multi-item orders.
 *
 * @param {object} data
 * @param {array}  data.items   - Array of { mealId, quantity } for cart orders
 *                                OR single { mealId, quantity } for single-item orders
 * @param {string} data.pickupDate
 * @param {string} data.pickupTime
 */
export async function createPreOrder(data) {
  try {
    // Normalize: if data.items is an array, use it; otherwise build from single item
    let items;
    if (Array.isArray(data.items)) {
      items = data.items.map((it) => ({
        meal_id: parseInt(it.mealId, 10),
        quantity: parseInt(it.quantity, 10),
      }));
    } else {
      items = [
        {
          meal_id: parseInt(data.mealId, 10),
          quantity: parseInt(data.quantity, 10),
        },
      ];
    }

    const payload = {
      items,
      pickup_time: `${data.pickupDate}T${data.pickupTime}:00`,
    };

    const response = await api.post("/orders", payload);
    return { success: true, data: response.data };
  } catch (error) {
    const message =
      typeof error.response?.data?.detail === "string"
        ? error.response.data.detail
        : Array.isArray(error.response?.data?.detail)
          ? error.response.data.detail[0]?.msg
          : "Failed to place pre-order";
    throw new Error(message);
  }
}

export default {
  createPreOrder,
};
