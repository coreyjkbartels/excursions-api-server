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
        // TODO: isEmpty validator
    },
    description: {
        type: String,
        unique: false,
        required: true,
        trim: true,
        minLength: 1,
        maxLength: 255,
        // TODO: isEmpty validator
    },
    host: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    participants: [{
        id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: false,
        },
        userName: {
            type: String,
            unique: false,
            required: true,
            trim: true,
            minLength: 1,
            maxLength: 64,
            // TODO: isEmpty validator
        }
    }],
    trips: [{
        id: {
            type: Schema.Types.ObjectId,
            ref: 'Trip',
            required: true,
        },
        name: {
            type: String,
            unique: false,
            required: true,
            trim: true,
            minLength: 1,
            maxLength: 64,
            // TODO: isEmpty validator
        }
    }],
    isComplete: {
        type: Boolean,
        required: false,
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
    const excursions = await Excursion.find({ host: user._id }).exec();

    return excursions;
};

const Excursion = mongoose.model('Excursion', excursionSchema);

module.exports = Excursion;