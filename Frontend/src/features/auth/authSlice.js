import { createSlice } from '@reduxjs/toolkit';

// Load auth state from localStorage (excluding `loading`)
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('authState');
    if (serializedState) {
      const state = JSON.parse(serializedState);
      return { ...state, loading: false }; // Ensure loading is always false on load
    }
    return undefined;
  } catch (error) {
    console.error('Error loading state:', error);
    return undefined;
  }
};

// Save auth state to localStorage (excluding `loading`)
const saveState = (state) => {
  try {
    const { loading, ...stateToSave } = state; // Exclude `loading` from being saved
    const serializedState = JSON.stringify(stateToSave);
    localStorage.setItem('authState', serializedState);
  } catch (error) {
    console.error('Error saving state:', error);
  }
};

// Set initial state
const initialState = loadState() || {
  isAuthenticated: false,
  role: '',
  username: '',
  cart: [],
  loading: false, // Ensure initial loading is false
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action) {
      state.isAuthenticated = true;
      state.role = action.payload.role;
      state.username = action.payload.username;
      state.loading = false;
      saveState(state);
    },
    logout(state) {
      state.isAuthenticated = false;
      state.role = '';
      state.username = '';
      state.cart = [];
      state.loading = false;
      saveState(state);
      localStorage.removeItem('authState');
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    addToCart(state, action) {
      if (!Array.isArray(state.cart)) state.cart = [];
      const tour = action.payload;
      const existingTour = state.cart.find((item) => item._id === tour._id);
      if (!existingTour) {
        state.cart.push(tour);
        saveState(state);
      }
    },
    removeFromCart(state, action) {
      if (!Array.isArray(state.cart)) state.cart = [];
      state.cart = state.cart.filter((item) => item._id !== action.payload);
      saveState(state);
    },
    setCart(state, action) {
      if (!Array.isArray(state.cart)) state.cart = [];
      state.cart = action.payload;
      saveState(state);
    },
  },
});

export const { login, logout, addToCart, removeFromCart, setCart, setLoading } = authSlice.actions;
export default authSlice.reducer;
