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
        required: true,
        default: "5150"
    },
    revenue: {
        type: Number,
        required: true,
        default: 0
    },
});

export default mongoose.model("Admin", schema);
