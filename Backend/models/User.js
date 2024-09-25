import mongoose from "mongoose";

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    id: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["employee", "user"],
        required: true
    },
    tour: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Tour',
        default: [],
        validate: {
            validator: function () {
                return this.role === 'employee';
            },
            message: 'Only employees can have bookings.'
        }
    },
    booking: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Booking',
        default: [],
        validate: {
            validator: function () {
                return this.role === 'user';
            },
            message: 'Only users can have tickets.'
        }
    },
    revenue: {
        type: Number,
        default: 0,
        validate: {
            validator: function () {
                return this.role === 'employee';
            },
            message: 'Revenue can only be set for employees.'
        }
    }
});

schema.pre('validate', function (next) {
    if (this.role === 'user') {
        this.tour = undefined;
        this.revenue = undefined;
    } else if (this.role === 'employee') {
        this.booking = undefined;
    }
    next();
});

export default mongoose.model("User", schema);
