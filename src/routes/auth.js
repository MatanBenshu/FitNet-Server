import express from 'express';
import router from express.Router();
import User from'../models/User';


router.post('/register', async (req, res) => {
    const { username, email, password, firstName, lastName, birthDate, gender, address } = req.body;
    try {
        const newUser = new User({ username, email, password, firstName, lastName, birthDate, gender, address });
        await newUser
        .save();
        const user = await User.findOne({email})
        
        res.status(200).json({ success: true, message: 'User registered successfully',user});
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error registering user' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }

        res.status(200).json({ success: true, message: 'Login successful', user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error logging in user' });
    }
});

export default router;