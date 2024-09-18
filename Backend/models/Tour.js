import mongoose from "mongoose";

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
    maxGroupSize: {
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
    }
});

export default mongoose.model("Tour", tourSchema);
