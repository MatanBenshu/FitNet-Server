import express from 'express';
const router = express.Router();

import Post from '../models/Post.js';
import Group from '../models/Group.js';
import User from '../models/User.js';

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
            const UpdatedGroup = await Group.findById(req.params.id);
            res.status(200).json(UpdatedGroup);
        } else {
            res.status(403).json('only the admin can update the group');
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

//get a group

router.get('/:groupname', async (req, res) => {
    try {
        const group = await Group.findOne({groupname: req.params.groupname});
        res.status(200).json(group);
    } catch (err) {
        res.status(500).json(err);
    }
});

//get User groups
router.get('/all/:userId', async (req, res) => {
    try {
        const adminGroups = await Group.find({ Admin: req.params.userId });
        const followGroups = await Group.find({ followers: req.params.userId , Admin: { $nin: req.params.userId } });
        const user = await User.findById(req.params.userId);

        let friendsGroup = await Promise.all(
            user.followings.map((friendId) => {
                return Group.find({Admin: friendId , followers: { $nin: req.params.userId}});
            }));   
        
        friendsGroup = friendsGroup.flat();
        
        let admin = [];
        adminGroups.map((group) => {
            admin.push(group.groupname);
        });
        let follow = [];
        followGroups.map((group) => {
            follow.push(group.groupname);
        });
        let recommend = [];
        friendsGroup.map((group) => {
            recommend.push(group.groupname);
        });

        res.status(200).json({admin:admin,follow:follow,recommend:recommend});
    } catch (err) {
        res.status(500).json(err);
    }
});

//delete a group

router.delete('/:id', async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        await group.deleteOne();
        res.status(200).json('the group has been deleted');
    } catch (err) {
        res.status(500).json(err);
    }
});



//get content of the group. events & posts

router.get('/content/:id', async (req, res) => {
    try {
        const posts = await Post.find({ group: req.params.id });
        res.status(200).json(posts);
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

// a user join waiting list 

router.put('/waiting/:id', async (req, res) => {
    const group = await Group.findById(req.params.id);
    if (!group.waiting.includes(req.body.userId)){
        try {
            await group.updateOne({ $push: { waiting: req.body.userId } });
            res.status(200).json('the user joined to the wait list');
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json('user already in the wait list');
    }
});

// a user leave the wait list

router.put('/unwaiting/:id', async (req, res) => {
    const group = await Group.findById(req.params.id);
    if (group.waiting.includes(req.body.userId)){
        try {
            await group.updateOne({ $pull: { waiting: req.body.userId } });
            res.status(200).json('the user left the wait list');
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json('user not in the wait list');
    }
});

export default router;