import express from 'express';
const router = express.Router();
import Content from '../models/Content.js';

router.get('/:id', async (req, res) => {
    try {
        const aboutContent = await Content.findOne({ contentname: req.params.id });
        if (!aboutContent) {
            return res
                .status(404)
                .send({ success: false, message: 'Content not found' });
        }

        res.status(200).json({ success: true, user: aboutContent });
    } catch (error) {
        res
            .status(500)
            .json({ success: false, message: error + 'Error fetching user data' });
    }
});

export default router;
