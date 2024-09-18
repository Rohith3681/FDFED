// features/auth/authSlice.js

import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: false,
    role: '',
    username: '', // Add username to the state
  },
  reducers: {
    login(state, action) {
      state.isAuthenticated = true;
      state.role = action.payload.role;
      state.username = action.payload.username; // Update username
    },
    logout(state) {
      state.isAuthenticated = false;
      state.role = '';
      state.username = ''; // Clear username on logout
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
