const mongoose = require('mongoose');
const validator = require('validator');


const Schema = mongoose.Schema;

const excursionSchema = new Schema({
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
    host: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }],
    trips: [{
        type: Schema.Types.ObjectId,
        ref: 'Trip',
        default: null,
    }],
    isComplete: {
        type: Boolean,
        required: true,
        default: false,
    },
},
    { timestamps: true });


// Get all excursions for a given user
/**
 *  findByUser
 *  @param { User } user
 *  @returns [{ excursion }]
 */
excursionSchema.statics.findByUser = async (user) => {
    const excursions = await Excursion.find({ creator: user });

    if (excursions.length < 1) {
        throw new Error('Unable to query documents');
    }

    return excursions;
};

const Excursion = mongoose.model('Excursion', excursionSchema);

module.exports = Excursion;