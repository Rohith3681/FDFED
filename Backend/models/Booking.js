import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    adults: {
        type: Number,
        required: true,
        min: 1,
    },
    children: {
        type: Number,
        default: 0,
        min: 0,
    },
    tour: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tour',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    cost: {
        type: Number,
        default: 0,
    }
});

export default mongoose.model("Booking", bookingSchema);
