const mongoose = require('mongoose');
const validator = require('validator');

const Schema = mongoose.Schema;

const tripSchema = new Schema({
    host: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        unique: false,
        required: true,
        trim: true,
        minLength: 1,
        maxLength: 64,
    },
    description: {
        type: String,
        unique: false,
        required: true,
        trim: true,
        minLength: 1,
        maxLength: 255,
    },
    park: {
        name: {
            type: String,
            unique: false,
            required: true,
            trim: true,
        },
        code: {
            type: String,
            unique: false,
            required: true,
            trim: true,
            minLength: 4,
            maxLength: 10,
        },
    },
    campground: {
        id: {
            type: String,
            unique: false,
            required: true,
            trim: true,
            validate(value) {
                if (!validator.isUUID(value, 4)) {
                    throw new Error("Id is not a valid UUID.");
                }
            }
        },
        name: {
            type: String,
            unique: false,
            required: true,
            trim: true,
        },
    },
    thingstodo: [{
        id: {
            type: String,
            unique: false,
            required: true,
            trim: true,
            validate(value) {
                if (!validator.isUUID(value, 4)) {
                    throw new Error("Id is not a valid UUID.");
                }
            }
        },
        title: {
            type: String,
            unique: false,
            required: true,
            trim: true,
        },
    }],
    startDate: {
        type: Date,
        required: true,
        validate(value) {
            if (!validator.isISO8601(value.toISOString())) {
                throw new Error("Date is not in ISO8601 format.");
            }
        }
    },
    endDate: {
        type: Date,
        required: true,
        validate(value) {
            if (!validator.isISO8601(value.toISOString())) {
                throw new Error("Date is not in ISO8601 format.");
            }
        }
    },
},
    { timestamps: true });

const Trip = mongoose.model('Trip', tripSchema);

module.exports = Trip;