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
            { _id: friend._id },
            { $push: { incomingFriendRequests: friendRequest._id } }
        ));

        res.status(201).send(friendRequest);
    } catch (error) {
        console.log(error);
        res.status(400).send({ Error: 'Bad Request' });
    }
});

/**
 *  Get Friend Requests By User
 * 
 */
router.get('/friends/requests', auth, async (req, res) => {
    try {
        const friendRequests = await FriendRequest.findByUser(req.user._id);

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
    const mods = req.body;

    if (mods.length === 0) {
        res.status(400).send({ Error: "Missing updates" });
        return;
    }

    const props = Object.keys(mods);
    const modifiable = ['isAccepted'];

    const isValid = props.every((prop) => modifiable.includes(prop));

    if (!isValid) {
        res.status(400).send({ Error: 'Invalid updates' });
        return;
    }

    try {
        const friendRequest = await FriendRequest.findById({ _id: req.params.requestId });

        if (!friendRequest) {
            res.status(400).send({ Error: 'Invalid friendRequest id' });
            return;
        }

        // if (friendRequest.receiver != req.user._id) {
        //     res.status(403).send({ Error: "Forbidden" });
        //     return;
        // }

        props.forEach((prop) => friendRequest[prop] = mods[prop]);
        await friendRequest.save();

        if (req.body.isAccepted) {
            await User.updateOne((
                { _id: friendRequest.sender },
                { $push: { friends: friendRequest.receiver } }
            ));

            await User.updateOne((
                { _id: friendRequest.receiver },
                { $push: { friends: friendRequest.sender } }
            ));
        }

        await User.updateOne((
            { _id: friendRequest.sender },
            { $pull: { outgoingFriendRequests: friendRequest._id } }
        ));

        await User.updateOne((
            { _id: friendRequest.receiver },
            { $pull: { incomingFriendRequests: friendRequest._id } }
        ));

        // TODO: Get user objects and replace the sender/receiver ids with public profiles

        await FriendRequest.deleteOne({ _id: friendRequest._id });

        res.status(200).send(friendRequest);
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
            res.status(401).send({ Error: 'Unauthorized' });
            return;
        }

        await User.updateOne((
            { _id: req.user._id },
            { $pull: { outgoingFriendRequests: req.params.requestId } }
        ));

        await User.updateOne((
            { _id: friendRequest.receiver },
            { $pull: { incomingFriendRequests: req.params.requestId } }
        ));

        await FriendRequest.deleteOne({ _id: req.params.requestId });

        res.status(200).send(friendRequest);
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
 *  Get Friends By User
 * 
 */
router.get('/friends', auth, async (req, res) => {
    try {
        const friends = await User.findFriendsByUser(req.user._id);
        res.status(200).send(friends);
    } catch (error) {
        console.log(error);
        res.status(400).send({ Error: 'Bad Request' });
    }
});

/**
 *  Delete Friend
 * 
 */
router.delete('/friends/:friendId', auth, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.friendId)) {
            res.status(400).send({ Error: "Invalid friend id" });
            return;
        }

        if (!req.user.friends.includes(req.params.friendId)) {
            res.status(400).send({ Error: "friendId missing from user's friends list." });
            return;
        }

        await User.updateOne((
            { _id: req.user._id },
            { $pull: { friends: req.params.friendId } }
        ));

        await User.updateOne((
            { _id: req.params.friendId },
            { $pull: { friends: req.params.friendId } }
        ));

        res.status(200).send();
    } catch (error) {
        console.log(error);
        res.status(400).send({ Error: 'Bad Request' });
    }
});

// ------------------------- //
// #endregion                //
// ------------------------- //

module.exports = router;