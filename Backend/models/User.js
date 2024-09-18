import mongoose from "mongoose";

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    id: {
        type: String,
        required: true
    },
    bookings: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Tour',
        default: []
    }
});

export default mongoose.model("User", schema);
