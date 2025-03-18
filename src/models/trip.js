const mongoose = require('mongoose');
const validator = require('validator');


const Schema = mongoose.Schema;

const tripSchema = new Schema({
    excursion: {
        type: Schema.Types.ObjectId,
        ref: 'Excursion',
        default: null,
    },
    name: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        minLength: 1,
        maxLength: 64,
    },
    description: {
        type: String,
        unique: false,
        required: false,
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
            unique: true,
            required: false,
            trim: true,
            default: null,
        },
        name: {
            type: String,
            unique: false,
            required: false,
            trim: true,
            default: null,
        },
    },
    startDate: {
        type: Date,
        required: false,
    },
    endDate: {
        type: Date,
        required: false,
    },
    thingstodo: [{
        // things-to-do id's --> only acquired from an NPS API call
    }],
},
    { timestamps: true });

const Trip = mongoose.model('Trip', tripSchema);

module.exports = Trip;