import jwt from 'jsonwebtoken';

const secretKey = 'your_secret_key'; // Replace with your own secret key

export const generateToken = (user) => {
    return jwt.sign({ id: user._id, role: user.role }, secretKey, { expiresIn: '1h' });
};

export const verifyToken = (token) => {
    try {
        return jwt.verify(token, secretKey);
    } catch (error) {
        return null;
    }
};