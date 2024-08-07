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

//update a event

router.put('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (event.userId === req.body.userId) {
            await post.updateOne({ $set: req.body });
            res.status(200).json('the event has been updated');
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

        let friendsEvents = await Promise.all(
            user.followings.map((friendId) => {
                return Event.find({attendees:friendId});
            }));   
        
        friendsEvents = friendsEvents.flat();
        
        let recommendEvents=[];
        friendsEvents.map(event => {
            if (!userEvents.includes(event ) && 
                !followEvents.includes(event) &&
                !recommendEvents.includes(event)) {
                recommendEvents.push(event);
            }
        });

        let own = [];
        userEvents.map((event) => {
            own.push(event.title);
        });
        let follow = [];
        followEvents.map((event) => {
            follow.push(event.title);
        });
        let recommend = [];
        recommendEvents.map((event) => {
            recommend.push(event.title);
        });
        res.status(200).json({own:userEvents,follow:followEvents,recommend:recommendEvents});
    } catch (err) {
        res.status(500).json(err);
    }
});

//delete an event

router.delete('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (event.userId === req.body.userId) {
            await event.deleteOne();
            res.status(200).json('the event has been deleted');
        } else {
            res.status(403).json('you can delete only your event');
        }
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