import mongoose from 'mongoose';

const ContentSchema = new mongoose.Schema({
    contentname: {
        type: String,
        required: true,
        unique: true,
    },
    content: {
        type: String,
        require: true,
    },
});

export default mongoose.model('Content', ContentSchema);
