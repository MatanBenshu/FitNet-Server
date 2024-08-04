import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
        },
        desc: {
            type: String,
            max: 500,
        },
        img: {
            type: String,
        },
        likes: {
            type: Array,
            default: [],
        },
        savedBy: {
            type: Array,
            default: [],
        },
        shared: {
            type: Array,
            default: [],
        },
        group: {
            type: String,
            default: '',
        },
        srcUser: {
            type: String,
            default: '',
        },
        srcTimestamp: {
            type: Date,
            default: null,
        },
        srcPostId: {
            type: String,
            default: '',
        },
    },
    { timestamps: true }
);

export default mongoose.model('Post', PostSchema);