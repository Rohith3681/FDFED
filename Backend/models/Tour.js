import mongoose from "mongoose";
import AutoIncrement from 'mongoose-sequence';

const tourSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    distance: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    desc: {
        type: String,
        required: true
    },
    reviews: {
        type: [String],
        default: []
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    image: {
        type: String,
        required: true,
        maxLength: 5 * 1024 * 1024
    },
    count: {
        type: Number,
        required: true
    },
    bookedBy: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        default: [],
        required: true
    },
    revenue: {
        type: Number,
        default: 0
    }
});

tourSchema.plugin(AutoIncrement(mongoose), { inc_field: 'Id' });

export default mongoose.model("Tour", tourSchema);
