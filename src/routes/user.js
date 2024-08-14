import express from 'express';
const router = express.Router();
import User from '../models/User.js';
import Event from '../models/Event.js';
import Post from '../models/Post.js';
import Group from '../models/Group.js';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

//update user
router.post('/:id', async (req, res) => {
    if (req.body.userId === req.params.id ) {
        try {
            await User.findByIdAndUpdate(req.params.id, {
                $set: req.body,
            });
            const user = await User.findById(req.params.id);
            
            res.status(200).json(user);
        } catch (err) {
            return res.status(500).json(err);
        }
    } else {
        return res.status(403).json('You can update only your account!');
    }
});

// update user password

router.post('/change-password/:id', async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.params.id);
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(403).json('Invalid password' );
        }
        else{
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            await User.findByIdAndUpdate(req.params.id, { password: hashedPassword });
            const updatedUser = await User.findById(req.params.id); 
            res.status(200).json(updatedUser);
        }
    }catch(err){
        res.status(500).json(err);
    }



});

// delete user 
router.delete('/:id', async (req, res) => {

    const { id } = req.params;
    const { password } = req.body;
    console.log(password);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {

        const user = await User.findById(id).session(session);
        if (!user) {
            throw new Error('User not found');
        }
        
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new Error('Invalid password');
        }

        const groupsWhereUserIsAdmin = await Group.find({ Admin: id }).session(session);
        const groupIdsWhereUserIsAdmin = groupsWhereUserIsAdmin.map(group => group._id);

        const groupsWhereUserIsNotAdmin = await Group.find({
            _id: { $nin: groupIdsWhereUserIsAdmin },
            $or: [
                { followers: id },
                { waiting: id }
            ]
        }).session(session);

        const updateGroupPromises = groupsWhereUserIsNotAdmin.map(group =>
            Group.updateMany(
                { _id: group._id },
                { $pull: { followers: id, waiting: id } },
                { session }
            )
        );
        
        const deleteGroupPromises = groupsWhereUserIsAdmin.map(group =>
            Group.deleteOne({ _id: group._id }).session(session)
        );

        await Promise.all([...updateGroupPromises, ...deleteGroupPromises]);

        await Post.deleteMany({ group: { $in: groupIdsWhereUserIsAdmin } }).session(session);

        await Event.deleteMany({ userId: id }).session(session);

        await Event.updateMany(
            { attendees: id }, 
            { $pull: { attendees: id } }, 
            { session }
        );

        const userPosts = await Post.find({ userId: id }).session(session); 

        const userPostIds = userPosts.map(post => post._id); 

        await Promise.all([
            Post.updateMany(
                { likes: id },
                { $pull: { likes: id } },
                { session }
            ),
            Post.updateMany(
                { savedBy: id },
                { $pull: { savedBy: id } },
                { session }
            ),
            Post.updateMany(
                { srcUser: id },
                { $set: { srcPostId: '', srcTimestamp: null, srcUser: '', desc: 'The post or user you shared from got deleted' } },
                { session }
            ),
            Post.updateMany(
                { shared: { $in: userPostIds } },
                { $pull: { shared: { $in: userPostIds } } }, 
                { session }
            )
        ]);

        await Post.deleteMany({ userId: id }).session(session);

        await User.updateMany(
            { followings: id }, 
            { $pull: { followings: id } },
            { session }
        );
        

        await User.deleteOne({ _id: id }).session(session);

        await session.commitTransaction();
        session.endSession();

        res.status(200).send('User deleted successfully');

    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).send(err.message);
    }
});


//get a user
router.get('/', async (req, res) => {
    const userId = req.query.userId;
    const username = req.query.username;
    try {
        const user = userId
            ? await User.findById(userId)
            : await User.findOne({ username: username });
        // eslint-disable-next-line no-unused-vars
        const { password, updatedAt, ...other } = user._doc;
        res.status(200).json(other);
    } catch (err) {
        res.status(500).json(err);
    }
});

//get friends
router.get('/friends/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (user.followings.length > 0){
            const friends = await Promise.all(
                user.followings.map((friendId) => {
                    return User.findById(friendId);
                })
            );
            let friendList = [];
            friends.map((friend) => {
                const { _id, username, profilePicture } = friend;
                friendList.push({ _id, username, profilePicture });
            });
            res.status(200).json(friendList);
        }
        else{
            res.status(200).json([]);
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

//follow a user

router.put('/:id/follow', async (req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.body.userId);
            if (!user.followings.includes(req.params.id)) {
                await user.updateOne({ $push: { followings: req.params.id } });
                res.status(200).json('user has been followed');
            } else {
                res.status(403).json('you already follow this user');
            }
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json('you cant follow yourself');
    }
});

//unfollow a user

router.put('/:id/unfollow', async (req, res) => {
    if (req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.body.userId);
            if (user.followings.includes(req.params.id)) {
                await user.updateOne({ $pull: { followings: req.params.id } });
                res.status(200).json('user has been unfollowed');
            } else {
                res.status(403).json('you don\'t follow this user');
            }
        } catch (err) {
            res.status(500).json(err);
        }
    } else {
        res.status(403).json('you cant unfollow yourself');
    }
});
// Search users by username
router.get('/search', async (req, res) => {
    const query = req.query.query;
    try {
        const users = await User.find({ username: { $regex: query, $options: 'i' } }).select('username');
        res.status(200).json(users);
    } catch (err) {
        console.error('Error searching for users:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

//get user statistic information 
// number of followers , number of posts , number of events , number of groups

router.get('/statistic/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const followersCount = user.followings.length;
        const postsCount = await Post.countDocuments({ userId: req.params.id });
        const postsLiked = await Post.countDocuments({  likes: req.params.id });
        const postsSaved = await Post.countDocuments({  savedBy: req.params.id});
        const eventsCount = await Event.countDocuments({ userId: req.params.id });
        const eventsJoined = await Event.countDocuments({ attendees: req.params.id, userId: { $nin: req.params.id }});
        const groupsCount = await Group.countDocuments({ Admin: req.params.id });
        const groupsJoined = await Group.countDocuments({ followers: req.params.id, Admin: { $nin: req.params.id }});
        res.status(200).json({ followersCount, 
            postsCount, postsLiked, postsSaved,
            eventsCount, eventsJoined,
            groupsCount, groupsJoined });
    } catch (err) {
        res.status(500).json(err);
    }
});
export default router;

