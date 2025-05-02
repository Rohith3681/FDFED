import { Schema, model } from 'mongoose';

const schema = new Schema({
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
    isLoggedIn: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ["employee", "user"],
        required: true
    },
    tour: {
        type: [Schema.Types.ObjectId],
        ref: 'Tour',
        default: [],
        validate: {
            validator: function() {
                return this.role === 'employee';
            },
            message: 'Only employees can have bookings.'
        }
    },
    booking: {
        type: [Schema.Types.ObjectId],
        ref: 'Booking',
        default: [],
        validate: {
            validator: function() {
                return this.role === 'user';
            },
            message: 'Only users can have tickets.'
        }
    },
    revenue: {
        type: Number,
        default: 0,
        validate: {
            validator: function() {
                return this.role === 'employee';
            },
            message: 'Revenue can only be set for employees.'
        }
    },
    cart: {
        type: [{
            tour: { 
                type: Schema.Types.ObjectId, 
                ref: 'Tour' 
            },
            quantity: {
                type: Number, 
                default: 1
            }
        }],
        default: [],
        validate: {
            validator: function() {
                return this.role === 'user';
            },
            message: 'Only users can have a cart.'
        }
    }
});

schema.pre('validate', function(next) {
    if (this.role === 'user') {
        this.tour = undefined;
        this.revenue = undefined;
    } else if (this.role === 'employee') {
        this.booking = undefined;
        this.cart = undefined;
    }
    next();
});

export default model("User", schema);