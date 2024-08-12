import express from 'express';
const router = express.Router();
import User from '../models/User.js';
import Post from '../models/Post.js';


//create a post

router.post('/', async (req, res) => {
    const newPost = new Post(req.body);
    try {
        const savedPost = await newPost.save();
        res.status(200).json(savedPost);
    } catch (err) {
        res.status(500).json(err);
    }
});

//update a post

router.put('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json('post not found');
        }
        await post.updateOne({ $set: req.body });
        if (post.shared.length > 0) {
            await Post.updateMany(
                { _id: { $in: post.shared } },
                { $set: req.body }
            );
        }
        res.status(200).json('the post has been updated');
        
    } catch (err) {
        res.status(500).json(err);
    }
});

//get a post

router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json(err);
    }
});

//delete a post

router.delete('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.shared.length > 0) {
            await Post.deleteMany({ _id: { $in: post.shared } })
                .then(result => {
                    console.log(`Deleted ${result.deletedCount} posts`);
                })
                .catch(err => {
                    console.error('Error deleting posts:', err);
                });
        }
        if (post.srcPostId != '') {
            const srcPost = await Post.findById(post.srcPostId);
            if (srcPost._id) {
                await srcPost.updateOne({ $pull: { shared: post._id } });
            }
        }
        await post.deleteOne();
        res.status(200).json('the post has been deleted');
    } catch (err) {
        res.status(500).json(err);
    }
});

//like / dislike a post

router.put('/:id/like', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (req.body.userId !== post.userId) {
            if (!post.likes.includes(req.body.userId)) {
                await post.updateOne({ $push: { likes: req.body.userId } });
                res.status(200).json('The post has been liked');
            } else {
                await post.updateOne({ $pull: { likes: req.body.userId } });
                res.status(200).json('The post has been disliked');
            }
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

//saved / unsaved a post

router.put('/:id/save', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (req.body.userId !== post.userId) {
            if (!post.savedBy.includes(req.body.userId)) {
                await post.updateOne({ $push: { savedBy: req.body.userId } });
                res.status(200).json('The post has been liked');
            } else {
                await post.updateOne({ $pull: { savedBy: req.body.userId } });
                res.status(200).json('The post has been disliked');
            }
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

// share a post

router.put('/:id/share', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        const newPost = new Post({
            userId: req.body.userId,
            desc: post.desc,
            img: post.img,
            srcUser: post.userId,
            srcTimestamp: post.createdAt,
            srcPostId: post._id,
            group: post.group
        });
        const savedPost = await newPost.save();
        await post.updateOne({ $push: { shared: savedPost._id } });
        res.status(200).json('shared success');
        
    } catch (err) {
        res.status(500).json(err);
    }
});


//get timeline posts
//for home page

router.get('/timeline/:userId', async (req, res) => {
    try {
        const currentUser = await User.findById(req.params.userId);
        const userPosts = await Post.find({ userId: currentUser._id , group:''});
        const friendPosts = await Promise.all(
            currentUser.followings.map((friendId) => {
                return Post.find({ userId: friendId , group:''});
            })
        );
        res.status(200).json(userPosts.concat(...friendPosts));
    } catch (err) {
        res.status(500).json(err);
    }
});

//get user's all posts
// for profile page

router.get('/profile/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        const posts = await Post.find({ userId: user._id , group:''});
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json(err);
    }
});

//get user liked posts
// for profile page

router.get('/likes/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        const likedPosts = await Post.find({ likes: user._id.toString() , group:'' });
        res.status(200).json(likedPosts);
    } catch (err) {
        res.status(500).json(err);
    }
});

//get user's saved posts
// for profile page

router.get('/saved/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        const savedPosts = await Post.find({ savedBy: user._id.toString() , group:'' });
        res.status(200).json(savedPosts);
    } catch (err) {
        res.status(500).json(err);
    }
});

export default router;