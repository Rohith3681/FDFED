import express from "express";
import cors from 'cors';
import './mongo.js'
import User from "./models/User.js";
import ROLES from './roles.js'

const app = express();
app.use(cors());
app.use(express.json());


app.post("/register", async (req, res) => {
    try {
        const { name, password, role, employeeId } = req.body;

        // Check if the role is 'employee' and validate employeeId
        if (role == 'employee' && employeeId != ROLES['employee']) {
            return res.status(400).send("Invalid ID for employee role");
        }

        // Log role for debugging
        console.log(role);

        // Create new user
        const user = new User({
            name,
            password,
            id: ROLES[role]
        });

        await user.save();
        res.status(201).send("User registered successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send('Error registering user');
    }
});


app.post("/login", async (req, res) => {
    try {
        const { name, password } = req.body;
        const user = await User.findOne({ name });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify the password
        if (user.password !== password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if the user is an employee
        if (user.id === ROLES["employee"]) {
            return res.status(200).json({ 
                message: "Login successful", 
                role: 8180 
            });
        }

        // If the user is not an employee, do not include the role in the response
        return res.status(200).json({ 
            message: "Login successful" 
        });

    } catch (error) {
        console.log(error);
        res.status(500).send('Server error');
    }
});
 

app.get("/display", async(req, res) => {
    try{
        const data = await User.find();
        res.json(data);
    }catch(error){
        console.log(error);
        res.status(500).send('Error getting data');
    }
});

app.listen(8000, () => {
    console.log("Server started on port 8000");
});