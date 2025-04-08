const mongoose = require('mongoose');
const validator = require('validator');

const Schema = mongoose.Schema;

const friendRequestSchema = new Schema({
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
    }
});

// Get all excursion invites for a given user
/**
 *  findByUser
 *  @param { User } user
 *  @returns excursionInvites {}
 */
friendRequestSchema.statics.findByUser = async (user) => {
    const friendRequests = {
        "incoming": [],
        "outgoing": [],
    };

    // get incoming, push to array
    // get outgoing, push to array

    return friendRequests;
};

const FriendRequest = mongoose.model('FriendRequest', friendRequestSchema);

module.exports = FriendRequest;