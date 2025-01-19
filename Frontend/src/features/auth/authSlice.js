import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: false,
    role: '',
    username: '',
    cart: [], // Initialize cart as an empty array
    loading: true,
  },
  reducers: {
    login(state, action) {
      state.isAuthenticated = true;
      state.role = action.payload.role;
      state.username = action.payload.username;
      state.loading = false;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.role = '';
      state.username = '';
      state.cart = []; // Clear cart on logout
      state.loading = false;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    addToCart(state, action) {
      // Ensure cart is initialized as an array
      if (!Array.isArray(state.cart)) {
        state.cart = [];
      }

      const tour = action.payload;
      const existingTour = state.cart.find((item) => item._id === tour._id);

      if (!existingTour) {
        state.cart.push(tour); // Add tour without quantity
      }
    },
    removeFromCart(state, action) {
      // Ensure cart is initialized as an array
      if (!Array.isArray(state.cart)) {
        state.cart = [];
      }

      const tourId = action.payload;
      state.cart = state.cart.filter((item) => item._id !== tourId);
    },
    setCart(state, action) {
      // Ensure cart is initialized as an array
      if (!Array.isArray(state.cart)) {
        state.cart = [];
      }

      state.cart = action.payload; // Set cart data from backend
    },
  },
});

export const {
  login,
  logout,
  addToCart,
  removeFromCart,
  setCart,
  setLoading,
} = authSlice.actions;

export default authSlice.reducer;
