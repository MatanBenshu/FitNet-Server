import express from 'express';
const router = express.Router();
import User from '../models/User.js';


// Register new user
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
        res
            .status(200)
            .json(user);
    } catch (error) {
        res
            .status(500)
            .json(  'Error registering user: ' + error   );
    }
});

// Login exist user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res
                .status(403)
                .json( 'Invalid email' );
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res
                .status(403)
                .json('Invalid password' );
        }
        res.status(200).json(user);
    } catch (error) {
        res
            .status(500)
            .json( 'Error logging in user: ' + error  );
    }
});

export default router;
