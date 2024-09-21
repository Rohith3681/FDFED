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
    role: {
        type: String,
        enum: ["employee", "user"], // Role can be 'employee' or 'user'
        required: true
    },
    booking: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Tour',
        default: [],
        validate: {
            validator: function () {
                // Validate booking only if the role is 'employee'
                return this.role === 'employee';
            },
            message: 'Only employees can have bookings.'
        }
    },
    ticket: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Booking',
        default: [],
        validate: {
            validator: function () {
                // Validate ticket only if the role is 'user'
                return this.role === 'user';
            },
            message: 'Only users can have tickets.'
        }
    }
});

schema.pre('validate', function (next) {
    if(this.role === 'user'){
        this.booking = undefined;
    }else if (this.role === 'employee'){
        this.ticket = undefined;
    }
    next();
});

export default mongoose.model("User", schema);
