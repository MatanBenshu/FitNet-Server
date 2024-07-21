import express from 'express';
const router = express.Router();
const aboutContent = 'FitNet is a social network for athletes and sports lovers.\n Connect with others who share your passion for sports, fitness, and an active lifestyle. Whether you\'re looking to find a workout partner, join sports events, or share your fitness journey, FitNet is the place for you!';
const parciptent = ' Matan Ben Shushan\n Reem Levi\n Yarden Shakedn\n Shiraz Nagaoker\n Moran Avraham';
router.get('/', async (req, res) => {
    try {

        res.status(200).send({aboutContent,parciptent});
    } catch (error) {
        res
            .status(500)
            .json(error);
    }
});

export default router;
