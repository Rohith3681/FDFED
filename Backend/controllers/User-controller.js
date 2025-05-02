import User from "../models/User.js";
import ROLES from "../roles.js";

// Register a user
export const register = async(req, res) => {
    try {
        const { name, password, role, employeeId } = req.body;
        if (role === 'employee' && employeeId !== ROLES[role]) {
            return res.status(400).send("Invalid ID for employee role");
        }
        if (role === 'Admin' && employeeId !== ROLES[role]) {
            return res.status(400).send("Invalid ID for admin role");
        }

        const user = new User({
            name,
            password,
            id: ROLES[role],
            role // Make sure to include role
        });

        await user.save();
        res.status(201).send("User registered successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send('Error registering user');
    }
}

// Login a user
export const login = async(req, res) => {
    try {
        const { name, password } = req.body;
        const user = await User.findOne({ name });
        if (user && user.password === password) {
            res.status(200).json({ message: "Login successful", role: user.role });
        } else {
            res.status(401).json({ message: "Invalid credentials" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Error saving post');
    }
}

// Get all users
export const getAllUsers = async(req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

// Update user by ID
export const updateUser = async(req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.name = name; // Update the name field
        await user.save();

        res.status(200).json({ message: 'User updated successfully', user });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update user' });
    }
};

// Delete user by ID
export const deleteUser = async(req, res) => {
    const { id } = req.params;

    try {
        const result = await User.findByIdAndDelete(id); // Use findByIdAndDelete

        if (!result) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};
