import express from 'express';
const router = express.Router();
const pong = 'pong <9>';
router.get('/',async (req,res)=>{

    try {
        res.status(200).send(pong);
    } catch (error) {
        res
            .status(500)
            .json({ success: false, message: error + 'Error fetching user data' });
    }

});




export default router;
