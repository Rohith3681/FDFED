import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    items: [],
    isLoading: false,
    error: null
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        updateQuantity: (state, action) => {
            const { id, quantity } = action.payload;
            const item = state.items.find(item => item.id === id);
            if (item) {
                item.quantity = quantity;
            }
        },
        removeItem: (state, action) => {
            state.items = state.items.filter(item => item.id !== action.payload);
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        addItem: (state, action) => {
            const existingItem = state.items.find(item => item.id === action.payload.id);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                state.items.push({ ...action.payload, quantity: 1 });
            }
        }
    }
});

export const { 
    updateQuantity, 
    removeItem, 
    setLoading, 
    setError, 
    addItem 
} = cartSlice.actions;

export default cartSlice.reducer;