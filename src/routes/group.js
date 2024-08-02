import express from 'express';
const router = express.Router();
import Event from '../models/Event.js';
import Post from '../models/Post.js';
import Group from '../models/Group.js';

//create a group

router.post('/', async (req, res) => {
    const newGroup = new Group(req.body);
    try {
        const savedGroup = await newGroup.save();
        res.status(200).json(savedGroup);
    } catch (err) {
        res.status(500).json(err);
    }
});

//update a Group

router.put('/:id', async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (group.Admin === req.body.Admin) {
            await group.updateOne({ $set: req.body });
            res.status(200).json('the group has been updated');
        } else {
            res.status(403).json('only the admin can update the group');
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

//get a group

router.get('/:id', async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        res.status(200).json(group);
    } catch (err) {
        res.status(500).json(err);
    }
});

//delete a group

router.delete('/:id', async (req, res) => {
    try {
        const group = await Post.findById(req.params.id);
        if (group.Admin=== req.body.Admin) {
            await group.deleteOne();
            res.status(200).json('the group has been deleted');
        } else {
            res.status(403).json('only admin can delete the group');
        }
    } catch (err) {
        res.status(500).json(err);
    }
});



//get content of the group. events & posts

router.get('/content/:id', async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        const posts = await Post.find({ group: group._id });
        const events = await Event.find({ group: group._id });
        res.status(200).json(posts,events);
    } catch (err) {
        res.status(500).json(err);
    }
});

//user/follower exits from the group

router.put('/exit/:id', async (req, res) => {
    const group = await Group.findById(req.params.id);
    if (group.Admin !== req.body.userId){
        try {
            if (group.followers.includes(req.body.userId)) {
                await group.updateOne({ $pull: { followers: req.body.userId } });
                res.status(200).json('the user exit from the group');
            } else {
                res.status(403).json('user not part of the group');
            }
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json('admin cannot exit from the group');
    }
}); 

// a user join to the group

router.put('/join/:id', async (req, res) => {
    const group = await Group.findById(req.params.id);
    if (!group.followers.includes(req.body.userId)){
        try {
            await group.updateOne({ $push: { followers: req.body.userId } });
            res.status(200).json('the user joined to the group');
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json('user already part of the group');
    }
});

export default router;