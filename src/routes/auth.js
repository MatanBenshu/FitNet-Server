import express from 'express';
const router = express.Router();
import User from '../models/User.js';

import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

router.post('/register', async (req, res) => {
    const {
        username,
        email,
        password,
        firstName,
        lastName,
        birthDate,
        gender,
        address,
    } = req.body;
    try {
        const newUser = new User({
            username,
            email,
            password,
            firstName,
            lastName,
            birthDate,
            gender,
            address,
        });
        await newUser.save();
        const user = await User.findOne({ email });
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
        res
            .status(200)
            .json({ success: true, message: 'User registered successfully', user ,token});
    } catch (error) {
        res
            .status(500)
            .json({ success: false, message: error + 'Error registering user' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res
                .status(400)
                .json({ success: false, message: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res
                .status(400)
                .json({ success: false, message: 'Invalid email or password' });
        }
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ success: true, message: 'Login successful', user ,token});
    } catch (error) {
        res
            .status(500)
            .json({ success: false, message: error + 'Error logging in user' });
    }
});

export default router;
