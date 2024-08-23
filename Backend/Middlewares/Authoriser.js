import User from "../models/User.js";
import ROLES from "../roles.js";

export const authUser = async (req, res, next) => {
    try {
        const { username } = req.body;

        // Find the user by username
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the roll number matches 8180
        if (user.id === ROLES["employee"]) {
            next(); // Proceed to the next middleware or route handler
        } else {
            return res.status(403).json({ message: 'Unauthorized: Roll number does not match' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
};
