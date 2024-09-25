import User from '../models/User.js';

// Get the number of logged-in users and employees
export const getUserAndEmployeeCounts = async(req, res) => {
    try {
        // Fetch logged-in users excluding employees
        const loggedInUsersCount = await User.countDocuments({ isLoggedIn: true, id: '2120' });
        // Fetch logged-in employees
        const loggedInEmployeesCount = await User.countDocuments({ isLoggedIn: true, id: '8180' });

        res.status(200).json({
            loggedInUsers: loggedInUsersCount,
            loggedInEmployees: loggedInEmployeesCount
        });
    } catch (error) {
        console.error('Error fetching user and employee counts:', error);
        res.status(500).json({ message: 'Error fetching user and employee counts' });
    }
};

// Get logged-in users and employees names
export const getLoggedInNames = async(req, res) => {
    try {
        const loggedInUsers = await User.find({ isLoggedIn: true, id: '2120' }).select('name');
        const loggedInEmployees = await User.find({ isLoggedIn: true, id: '8180' }).select('name');

        res.status(200).json({
            loggedInUsers: loggedInUsers.map(user => user.name),
            loggedInEmployees: loggedInEmployees.map(employee => employee.name),
        });
    } catch (error) {
        console.error('Error fetching logged-in names:', error);
        res.status(500).json({ message: 'Error fetching logged-in names' });
    }
};