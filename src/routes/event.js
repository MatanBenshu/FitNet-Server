import express from 'express';
const router = express.Router();
import User from '../models/User.js';
import Event from '../models/Event.js';


//create a event

router.post('/', async (req, res) => {
    console.log(req.body);
    const newEvent = new Event(req.body);
    console.log(newEvent);
    try {
        const savedEvent = await newEvent.save();
        res.status(200).json(savedEvent);
    } catch (err) {
        res.status(500).json(err);
    }
});
// Route to get all events
router.get('/all', async (req, res) => {
    try {
        const events = await Event.find({});
        res.json(events);
    } catch (error) {
        res.status(500).send(error,'Server Error');
    }
});
//update a event

router.post('/update/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (event.userId === req.body.userId) {
            await event.updateOne({ $set: req.body });
            console.log(event);
            const updatedEvent = await Event.findById(req.params.id);
            console.log(updatedEvent);
            res.status(200).json(updatedEvent);
        } else {
            res.status(403).json('you can update only your event');
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

//get an event

router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        res.status(200).json(event);
    } catch (err) {
        res.status(500).json(err);
    }
});

//get user all events
router.get('/all/:userId', async (req, res) => {
    try {
        const userEvents = await Event.find({ userId: req.params.userId });
        const followEvents = await Event.find({ attendees: req.params.userId , userId: { $nin: req.params.userId } });
        const user = await User.findById(req.params.userId);

        let recommendEvents = await Promise.all(
            user.followings.map((friendId) => {
                return Event.find({userId: { $in: friendId} ,attendees: { $nin: req.params.userId}});
            }));   
        
        recommendEvents = recommendEvents.flat();

        res.status(200).json({own:userEvents,follow:followEvents,recommend:recommendEvents});
    } catch (err) {
        res.status(500).json(err);
    }
});

//delete an event

router.delete('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        await event.deleteOne();
        res.status(200).json('the event has been deleted');
    } catch (err) {
        res.status(500).json(err);
    }
});

// add / remove participant 

router.put('/:id/attend', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event.attendees.includes(req.body.userId)) {
            await event.updateOne({ $push: { attendees: req.body.userId } });
            res.status(200).json('The user has been added to the event');
        } else {
            await event.updateOne({ $pull: { attendees: req.body.userId } });
            res.status(200).json('The user has been remove from the event');
        }
    } catch (err) {
        res.status(500).json(err);
    }
});


//get user own events
//for home page

router.get('/admin/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        const events = await Event.find({ userId: user._id });
        res.status(200).json(events);
    } catch (err) {
        res.status(500).json(err);
    }
});


//get user's attend events
//for home page
router.get('/attend/:userId', async (req, res) => {
    try {
        const currentUser = await User.findById(req.params.userId);
        const userAttendEvents =await Event.find({ attendees: currentUser._id });
        res.status(200).json(userAttendEvents);
    } catch (err) {
        res.status(500).json(err);
    }
});

//get suggested events , event user's friends attends.
//for home page

router.get('/suggest/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        const friendsEvents = await Promise.all(
            user.followings.map((friendId) => {
                return Event.find({ attendees: { $in: [friendId], $nin: [user._id] }});
            })
        );
        res.status(200).json(friendsEvents);
    } catch (err) {
        res.status(500).json(err);
    }
});

export default router;
