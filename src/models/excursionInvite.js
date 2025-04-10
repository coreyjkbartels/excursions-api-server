const mongoose = require('mongoose');
const validator = require('validator');

const Schema = mongoose.Schema;

const excursionInviteSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    isAccepted: {
        type: Boolean,
        required: false,
        default: false,
    },
    excursion: {
        type: Schema.Types.ObjectId,
        ref: 'Excursion',
        required: true,
    }
});

// Get all excursion invites for a given user
/**
 *  findByUser
 *  @param { User } user
 *  @returns excursionInvites {}
 */
excursionInviteSchema.statics.findByUser = async (user) => {
    const excursionInvites = {
        "incoming": [],
        "outgoing": [],
    };

    // get incoming, push to array
    // get outgoing, push to array

    return excursionInvites;
};

const ExcursionInvite = mongoose.model('ExcursionInvite', excursionInviteSchema);

module.exports = ExcursionInvite;