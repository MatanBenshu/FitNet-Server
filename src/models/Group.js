import mongoose from 'mongoose';

const GroupSchema = new mongoose.Schema(
    {
        groupname: {
            type: String,
            require: true,
            unique: true,
        },
        Admin: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: true,
        },
        followers: {
            type: Array,
            default: function() {
                return [this.Admin];
            },
        },
        waiting: {
            type: Array,
        },
        desc: {
            type: String,
        },
    },
    { timestamps: true }
);

export default mongoose.model('Group', GroupSchema);