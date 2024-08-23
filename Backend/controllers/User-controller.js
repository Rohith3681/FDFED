import User from "../models/User.js";
import ROLES from "../roles.js";

export const register = async (req, res) => {
    try {
        const { name, password, role, employeeId} = req.body;
        if(role === 'employee' && employeeId !== ROLES[role]){
            return res.status(400).send("Invalid ID for employee role");
        }
        console.log(role);
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
}

export const login = async(req, res) => {
    try{            
        const {name, password} = req.body;
        const user = await User.findOne({name});
        if(user && user.password === password){
            res.status(200).json({ message: "Login successful", role: user.role });
        }else{  
            res.status(401).json({ message: "Invalid credentials" });
        }
    }catch(error){
        console.log(error);
        res.status(500).send('Error saving post');
    }
}