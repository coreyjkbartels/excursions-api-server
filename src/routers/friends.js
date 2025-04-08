const express = require('express');
const FriendRequest = require('../models/friendRequest');
const User = require('../models/user');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

const router = new express.Router();

// ----------------------- //
// #region Friend Requests //
// ----------------------- //

/**
 *  Create Friend Request
 * 
 */
router.post('/friends/requests', auth, async (req, res) => {
    try {
        const friend = await User.findById(req.body.friendId);

        if (!friend) {
            res.status(400).send({ Error: 'Bad Request' });
            return;
        }

        const data = {
            "sender": req.user._id,
            "receiver": req.body.friendId
        };

        const friendRequest = new FriendRequest(data);
        await friendRequest.save();

        await User.updateOne((
            { _id: req.user._id },
            { $push: { outgoingFriendRequests: friendRequest._id } }
        ));

        await User.updateOne((
            { _id: req.friend._id },
            { $push: { incomingFriendRequests: friendRequest._id } }
        ));

    } catch (error) {
        console.log(error);
        res.status(400).send({ Error: 'Bad Request' });
    }
});

/**
 *  Get Friend Request
 * 
 */
router.get('/friends/requests', auth, async (req, res) => {
    try {
        const friendRequests = await FriendRequest.findByUser(req.user._id);

        // TODO: Return "sender" and "receiver" as User objects instead of as ids. => Pipeline?

        res.status(200).send(friendRequests);
    } catch (error) {
        console.log(error);
        res.status(400).send({ Error: 'Bad Request' });
    }
});

/**
 *  Handle Friend Request
 * 
 */
router.patch('/friends/requests/:requestId', auth, async (req, res) => {
    try {

        const mods = req.body;

        if (mods.length === 0) {
            res.status(400).send({ Error: "Missing updates" });
            return;
        }

        const friendRequest = FriendRequest.findById(req.params.requestId);

        // ==> if it is declined remove it from the list for both users?
    } catch (error) {
        console.log(error);
        res.status(400).send({ Error: 'Bad Request' });
    }
});

/**
 *  Delete Friend Request
 * 
 */
router.delete('/friends/requests/:requestId', auth, async (req, res) => {
    try {
        const friendRequest = await FriendRequest.findById(req.params.requestId);

        if (!friendRequest) {
            res.status(400).send({ Error: 'Bad Request' });
            return;
        }

        if (friendRequest.sender != req.user._id) {
            res.status(400).send({ Error: 'Unauthorized' });
            return;
        }

        await FriendRequest.deleteOne({ _id: req.params.requestId });

        await User.updateOne((
            { _id: req.user._id },
            { $pull: { outgoingFriendRequests: req.params.requestId } }
        ));

        await User.updateOne((
            { _id: friendRequest.receiver },
            { $pull: { incomingFriendRequests: req.params.requestId } }
        ));
    } catch (error) {
        console.log(error);
        res.status(400).send({ Error: 'Bad Request' });
    }
});

// ----------------------- //
// #endregion              //
// ----------------------- //

// ------------------------- //
// #region Friend Management //
// ------------------------- //

/**
 *  Get Friends by User
 * 
 */
router.get('/friends/requests', auth, async (req, res) => {
    try {
        // TODO: Return an array of user objects from the currently authenticated user's friends list.
    } catch (error) {
        console.log(error);
        res.status(400).send({ Error: 'Bad Request' });
    }
});

/**
 *  Delete Friend
 * 
 */
router.delete('/friends/requests', auth, async (req, res) => {
    try {
        // TODO: Return the public profile of the user who was removed
    } catch (error) {
        console.log(error);
        res.status(400).send({ Error: 'Bad Request' });
    }
});

// ------------------------- //
// #endregion                //
// ------------------------- //