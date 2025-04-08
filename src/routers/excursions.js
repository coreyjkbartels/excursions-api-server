const express = require('express');
const Excursion = require('../models/excursion');
const ExcursionInvite = require('../models/excursionInvite');
const Trip = require('../models/trip');
const User = require('../models/user');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

const router = new express.Router();


// ---------------------------- //
// #region Excursion Management //
// ---------------------------- //

/**
 *  Create Excursion
 *  https://will-german.github.io/excursions-api-docs/#tag/Excursions/operation/create-excursion
 */
router.post('/excursion', auth, async (req, res) => {
    try {
        req.body.host = req.user._id;

        const excursion = new Excursion(req.body);
        await excursion.save();

        // TODO: Get Host User Object

        if (req.body.trips) {
            const trips = [];
            for (let id of req.body.trips) {
                const trip = await Trip.findById(id);
                trips.push(trip);
            }

            excursion.trips = trips;
        }

        res.status(201).send({ excursion });
    } catch (error) {
        console.log(error);
        res.status(400).send({ Error: 'Bad Request' });
    }
});

/**
 *  Get Excursions By User
 *  https://will-german.github.io/excursions-api-docs/#tag/Excursions/operation/get-excursions-by-user
 */
router.get('/excursions', auth, async (req, res) => {

    // TODO: Get Host User Object

    try {
        const filter = { host: req.user._id };

        const pipeline = Excursion.aggregate([
            { $match: filter },
            {
                $lookup: {
                    from: "trips",
                    foreignField: '_id',
                    localField: "trips",
                    as: "trips"
                }
            },
            {
                $project: {
                    "name": 1,
                    "description": 1,

                    "trips._id": 1,
                    "trips.name": 1,
                    "trips.description": 1
                }
            }
        ]);

        const excursions = await pipeline.exec();

        res.status(200).send({ excursions });

    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

/**
 *  Get Excursion By Id
 *  https://will-german.github.io/excursions-api-docs/#tag/Excursions/operation/get-excursion-by-id
 */
router.get('/excursion/:excursionId', auth, async (req, res) => {

    // TODO: Get Host User Object

    try {
        const excursion = await Excursion.findById(req.params.excursionId);

        if (!excursion) {
            res.status(400).send({ Error: "Invalid excursion id" });
            return;
        }

        // TODO: check make sure req.user is host or participant

        const trips = [];
        for (let id of excursion.trips) {
            const trip = await Trip.findById(id);
            trips.push(trip);
        }

        excursion.trips = trips;

        res.status(200).send({ excursion });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

/**
 *  Update Excursion By Id
 *  https://will-german.github.io/excursions-api-docs/#tag/Excursions/operation/patch-excursion-by-id
 */
router.patch('/excursion/:excursionId', auth, async (req, res) => {

    // TODO: Get Host User Object

    const mods = req.body;

    if (mods.length === 0) {
        res.status(400).send({ Error: "Missing updates" });
        return;
    }

    const props = Object.keys(mods);
    const modifiable = ['name', 'description', 'participants', 'trips', 'isComplete'];

    const isValid = props.every((prop) => modifiable.includes(prop));

    if (!isValid) {
        res.status(400).send({ Error: 'Invalid updates' });
        return;
    }

    try {
        const excursion = await Excursion.findById({ _id: req.params.excursionId });

        if (!excursion) {
            res.status(400).send({ Error: 'Invalid excursion id' });
            return;
        }

        if (!excursion.host.equals(req.user._id)) {
            res.status(403).send({ Error: "Forbidden" });
            return;
        }

        props.forEach((prop) => excursion[prop] = mods[prop]);
        await excursion.save();

        if (req.body.trips) {
            const trips = [];
            for (let id of excursion.trips) {
                const trip = await Trip.findById(id);
                trips.push(trip);
            }
        }

        excursion.trips = trips;

        res.status(200).send({ excursion });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

/**
 *  Delete Excursion By Id
 *  https://will-german.github.io/excursions-api-docs/#tag/Excursions/operation/delete-excursion-by-id
 */
router.delete('/excursion/:excursionId', auth, async (req, res) => {

    // TODO: Get Host User Object

    try {
        if (!mongoose.isValidObjectId(req.params.excursionId)) {
            res.status(400).send({ Error: "Invalid excursion id" });
            return;
        }

        // TODO: pull from participant's excursions list

        await User.updateOne((
            { _id: req.user._id },
            { $pull: { hostedExcursions: req.params.excursionId } }
        ));

        await Excursion.deleteOne({ _id: req.params.excursionId });

        res.status(200).send();
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

// ---------------------------- //
// #endregion                   //
// ---------------------------- //


// ----------------------- //
// #region Trip Management //
// ----------------------- //

/**
 *  Create Trip
 *  https://will-german.github.io/excursions-api-docs/#tag/Trips/operation/create-trip
 */
router.post('/trip', auth, async (req, res) => {

    // TODO: Get Host User Object

    try {
        const data = {
            ...req.body,
            "host": req.user._id
        };

        const trip = new Trip(data);
        await trip.save();

        // does this not need to be req.user._id
        await User.updateOne((
            { _id: req.body._id },
            { $push: { hostedTrips: trip._id } }
        ));

        res.status(201).send({ trip });
    } catch (error) {
        console.log(error);
        res.status(400).send({ Error: 'Bad request' });
    }
});

/**
 *  Get Trips By User
 *  https://will-german.github.io/excursions-api-docs/#tag/Trips/operation/get-trips-by-user
 */
router.get('/trips', auth, async (req, res) => {

    // TODO: Get Host User Object

    try {
        const trips = await Trip.findByUser(req.user._id);
        res.status(200).send(trips);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

/**
 *  Get Trip By Id
 *  https://will-german.github.io/excursions-api-docs/#tag/Trips/operation/get-trip-by-id
 */
router.get('/trip/:tripId', auth, async (req, res) => {

    // TODO: Get Host User Object

    try {
        const trip = await Trip.findById({ _id: req.params.tripId });

        if (!trip) {
            res.status(400).send({ Error: "Invalid trip id" });
            return;
        }

        res.status(200).send(trip);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

/**
 *  Update Trip By Id
 *  https://will-german.github.io/excursions-api-docs/#tag/Trips/operation/patch-trip-by-id
 */
router.patch('/trip/:tripId', auth, async (req, res) => {

    // TODO: Get Host User Object

    const mods = req.body;

    if (mods.length === 0) {
        res.status(400).send({ Error: 'Missing updates' });
        return;
    }

    const props = Object.keys(mods);
    const modifiable = ['name', 'description', 'park', 'campground', 'thingstodo', 'startDate', 'endDate'];

    const isValid = props.every((prop) => modifiable.includes(prop));

    if (!isValid) {
        res.status(400).send({ Error: 'Invalid Updates.' });
        return;
    }

    try {
        const trip = await Trip.findById({ _id: req.params.tripId });

        if (!trip) {
            res.status(400).send({ Error: 'Invalid trip id' });
            return;
        }

        if (!trip.host.equals(req.user._id)) {
            res.status(403).send({ Error: 'Forbidden' });
            return;
        }

        props.forEach((prop) => trip[prop] = mods[prop]);
        await trip.save();

        res.status(200).send(trip);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

/**
 *  Delete Trip By Id
 *  https://will-german.github.io/excursions-api-docs/#tag/Trips/operation/delete-trip-by-id
 */
router.delete('/trip/:tripId', auth, async (req, res) => {

    // TODO: Get Host User Object

    try {
        const trip = await Trip.findById({ _id: req.params.tripId });

        if (!trip.host.equals(req.user._id)) {
            res.status(403).send({ Error: 'Forbidden' });
            return;
        }

        await Trip.deleteOne({ _id: req.params.tripId });

        await User.updateOne((
            { _id: req.user._id },
            { $pull: { hostedTrips: req.params.tripId } }
        ));

        // TODO: delete trip from all excursions

        await Excursion.updateMany(
            { host: req.user._id },
            { $pull: { trips: { _id: req.params.tripId } } }
        );

        res.status(200).send();
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

// ----------------------- //
// #endregion              //
// ----------------------- //


// -------------------------------- //
// #region Shared Excursion Invites //
// -------------------------------- //

/**
 *  Create Excursion Share Invite
 * 
 */
router.post('/share/excursion/:excursionId', auth, async (req, res) => {
    try {
        const excursion = await Excursion.findById({ _id: req.params.excursionId });

        if (!excursion) {
            res.status(400).send({ Error: 'Bad Request' });
            return;
        }

        const data = {
            "sender": req.user._id,
            "receiver": req.body.friendId,
            "excursion": req.params.excursionId
        };

        const excursionInvite = new ExcursionInvite(data);
        await excursionInvite.save();

        await User.updateOne((
            { _id: req.user._id },
            { outgoingExcursionInvites: excursionInvite._id }
        ));

        await User.updateOne((
            { _id: req.body.friendId },
            { incomingExcursionInvites: excursionInvite._id }
        ));

        res.status(201).send(excursionInvite);
    } catch (error) {
        console.log(error);
        res.status(400).send({ Error: 'Bad Request' });
    }
});

/**
 *  Get Excursion Invites By User
 * 
 */
router.get('/share/excursions', auth, async (req, res) => {
    try {
        const excursionInvites = await ExcursionInvite.findByUser(req.user);

        res.status(200).send(excursionInvites);
    } catch (error) {
        console.log(error);
        res.status(400).send({ Error: 'Bad Request' });
    }
});

/**
 *  Handle Excursion Invite
 * 
 */
router.patch('/share/excursions/:inviteId', auth, async (req, res) => {

    const mods = req.body;

    if (mods.length === 0) {
        res.status(400).send({ Error: "Missing updates" });
        return;
    }

    const props = Object.keys(mods);
    const modifiable = ['isAccepted'];

    const isValid = props.every((prop) => modifiable.includes(prop));

    if (!isValid) {
        res.status(400).send({ Error: "Invalid updates" });
        return;
    }

    try {
        const excursionInvite = await ExcursionInvite.findById({ _id: req.params.inviteId });

        if (!excursionInvite) {
            res.status(400).send({ Error: 'Invalid invite id' });
            return;
        }

        // if (excursionInvite.receiver !== req.user._id) {
        //     res.status(403).send({ Error: "Forbidden" });
        //     return;
        // }

        props.forEach((prop) => excursionInvite[prop] = mods[prop]);
        await excursionInvite.save();

        if (req.body.isAccepted) {
            await Excursion.updateOne((
                { _id: req.params.inviteId },
                { $push: { participants: req.user._id } }
            ));

            await User.updateOne((
                { _id: req.user._id },
                { $push: { sharedExcursions: req.params.inviteId } }
            ));
        }

        await User.updateOne((
            { _id: excursionInvite.sender },
            { $pull: { outgoingExcursionInvites: excursionInvite._id } }
        ));

        await User.updateOne((
            { _id: excursionInvite.receiver },
            { $pull: { incomingExcursionInvites: excursionInvite._id } }
        ));

        await ExcursionInvite.deleteOne({ _id: excursionInvite._id });

        // TODO: Get user objects and replace the sender/receiver ids with public profiles

        res.status(200).send(excursionInvite);
    } catch (error) {
        console.log(error);
        res.status(400).send({ Error: 'Bad Request' });
    }
});

/**
 *  Delete Excursion Invite
 * 
 */
router.delete('/share/excursions/:inviteId', auth, async (req, res) => {
    try {
        const excursionInvite = await ExcursionInvite.findById(req.params.inviteId);

        if (!excursionInvite) {
            res.status(400).send({ Error: 'Bad Request' });
            return;
        }

        // if (excursionInvite.sender !== req.user._id) {
        //     res.status(403).send({ Error: 'Forbidden' });
        //     return;
        // }

        await User.updateOne((
            { _id: excursionInvite.sender },
            { $pull: { outgoingExcursionInvites: req.params.inviteId } }
        ));

        await User.updateOne((
            { _id: excursionInvite.receiver },
            { $pull: { incomingExcursionInvites: req.params.inviteId } }
        ));

        // TODO: Get user objects and replace the sender/receiver ids with public profiles

        await excursionInvite.deleteOne({ _id: req.params.inviteId });

        res.status(200).send(excursionInvite);
    } catch (error) {
        console.log(error);
        res.status(400).send({ Error: 'Bad Request' });
    }
});

// -------------------------------- //
// #endregion                       //
// -------------------------------- //


// ------------------------------------ //
// #region Shared Excursion Management  //
// ------------------------------------ //

/**
 *  Leave Excursion By Id
 * 
 */
router.delete('/leave/excursions/excursionId', auth, async (req, res) => {
    try {
        const excursion = await Excursion.findById({ _id: req.params.excursionId });

        if (!excursion) {
            res.status(400).send({ Error: "Invalid excursion id" });
            return;
        }

        if (excursion.host === req.user._id) {
            res.status(403).send({ Error: "Forbidden" });
            return;
        }

        await Excursion.updateOne((
            { _id: req.params.excursionId },
            { $pull: { participants: req.user._id } }
        ));

        await User.updateOne((
            { _id: req.user._id },
            { $pull: { sharedExcursions: req.params.excursionId } }
        ));

        // TODO: Send Excursion object(s)

        res.status(200).send(excursion);
    } catch (error) {
        console.log(error);
        res.status(400).send({ Error: 'Bad Request' });
    }
});

/**
 *  Remove Participant By User Id
 * 
 */
router.delete('/remove/excursions/excursionId', auth, async (req, res) => {
    try {
        const excursion = await Excursion.findById({ _id: req.params.excursionId });

        if (!excursion) {
            res.status(400).send({ Error: "Invalid excursion id" });
            return;
        }

        if (excursion.host !== req.user._id) {
            res.status(403).send({ Error: "Forbidden" });
            return;
        }

        if (!req.body.participantId) {
            res.status(400).send({ Error: "Missing participant id" });
        }

        await Excursion.updateOne((
            { _id: req.params.excursionId },
            { $pull: { participants: req.body.participantId } }
        ));

        await User.updateOne((
            { _id: req.body.participantId },
            { $pull: { sharedExcursions: req.params.excursionId } }
        ));

        // TODO: Return Excursion object(s)
        res.status(200).send(excursion);
    } catch (error) {
        console.log(error);
        res.status(400).send({ Error: 'Bad Request' });
    }
});

// ------------------------------------ //
// #endregion                           //
// ------------------------------------ //

module.exports = router;