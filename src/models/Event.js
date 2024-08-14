import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema(
    {
        userId: {
            type: String, 
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        location: {
            type: {},
            required: true,
        },
        date: {
            type: String,
            required: true,
        },
        startTime: {
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
        group: {
            type: String,
            default: '',
        },
        attendees: { 
            type: Array,
            default:function() {
                return [this.userId];
            },
        },
    },
    { timestamps: true }
);

export default mongoose.model('Event', EventSchema);