import express from 'express';
import { getAllUsers, updateUser, deleteUser } from '../controllers/User-controller.js';

const router = express.Router();

// Get all users
router.get('/users', getAllUsers);

// Update user
router.put('/users/:id', updateUser); // Updated the URL structure to match the React component

// Delete user
router.delete('/users/:id', deleteUser); // Updated the URL structure to match the React component

export default router;