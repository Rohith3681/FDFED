import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    userData: null,
    orders: [],
    isLoading: false,
    error: null
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUserData: (state, action) => {
            state.userData = action.payload;
        },
        setOrders: (state, action) => {
            state.orders = action.payload;
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        updateProfile: (state, action) => {
            state.userData = { ...state.userData, ...action.payload };
        }
    }
});

export const { 
    setUserData, 
    setOrders, 
    setLoading, 
    setError, 
    updateProfile 
} = userSlice.actions;

export default userSlice.reducer;