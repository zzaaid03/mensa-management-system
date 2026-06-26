import { db, auth } from "./config";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  query,
  where
} from "firebase/firestore";

// GET all meals (for the menu page)
export async function getMeals() {
  const snapshot = await getDocs(collection(db, "meals"));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

// GET one meal's details (for nutrition info page)
export async function getMealById(mealId) {
  const snapshot = await getDoc(doc(db, "meals", mealId));
  return { id: snapshot.id, ...snapshot.data() };
}

// GET available tables
export async function getAvailableTables() {
  const q = query(collection(db, "tables"), where("available", "==", true));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

// CREATE a pre-order
export async function createPreOrder(mealId, quantity, totalPrice, pickupTime) {
  const user = auth.currentUser;
  await addDoc(collection(db, "preOrders"), {
    userId: user.uid,
    mealId: mealId,
    quantity: quantity,
    totalPrice: totalPrice,
    status: "Pending",
    pickupTime: pickupTime,
    createdAt: new Date().toISOString()
  });
}

// GET current user's orders
export async function getUserOrders() {
  const user = auth.currentUser;
  const q = query(collection(db, "preOrders"), where("userId", "==", user.uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

// CREATE a table reservation
export async function createReservation(tableNumber, date, time, guests) {
  const user = auth.currentUser;
  await addDoc(collection(db, "tableReservations"), {
    userId: user.uid,
    tableNumber: tableNumber,
    reservationDate: date,
    reservationTime: time,
    numberOfGuests: guests,
    status: "Reserved"
  });
}

// GET current user's reservations
export async function getUserReservations() {
  const user = auth.currentUser;
  const q = query(collection(db, "tableReservations"), where("userId", "==", user.uid));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

// GET logged-in user's profile
export async function getUserProfile() {
  const user = auth.currentUser;
  const snapshot = await getDoc(doc(db, "users", user.uid));
  return snapshot.data();
}