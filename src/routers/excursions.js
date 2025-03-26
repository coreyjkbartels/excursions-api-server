const express = require('express');
const Excursion = require('../models/excursion');
const Trip = require('../models/trip');
const User = require('../models/user');
const auth = require('../middleware/auth');

const router = new express.Router();

// ---------------------------- //
// #region Excursion Management //
// ---------------------------- //

/**
 *  Create Excursion
 *  [ docs link ]
 */
router.post('/excursion', auth, async (req, res) => {
    try {
        const excursion = new Excursion(req.body);
        await excursion.save();

        res.status(201).send({ excursion });
    } catch (error) {
        console.log(error);
        res.status(400).send({ error: 'Bad Request' });
    }
});

/**
 *  Get Excursions By User
 *  [ docs link ]
 */
router.get('/excursions', auth, async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            res.status(404);
            throw new Error('Not Found');
        }

        const excursions = await Excursion.findByUser(user);

        if (excursions.length < 1) {
            res.status(404);
            throw new Error('Not Found');
        }

        res.status(200).send({ excursions });
    } catch (error) {
        console.log(error);
        res.send(error);
    }
});

/**
 *  Get Excursion By Id
 *  [ docs link ]
 */
router.get('/excursion/:excursionId', auth, async (req, res) => {
    try {
        const excursion = await Excursion.findById(req.params.excursionId);

        if (!excursion) {
            res.status(404);
            throw new Error("Not Found");
        }

        res.status(200).send({ excursion });
    } catch (error) {
        console.log(error);
        res.send(error);
    }
});

/**
 *  Update Excursion By Id
 *  [ docs link ]
 */
router.patch('/excursion/:excursionId', auth, async (req, res) => {
    const mods = req.body;

    if (mods.length === 0) {
        res.status(400);
        throw new Error("Bad Request");
    }

    const props = Object.keys(mods);
    const modifiable = ['name', 'description', 'participants', 'trips', 'isComplete'];

    const isValid = props.every((prop) => modifiable.includes(prop));

    if (!isValid) {
        return res.status(400).send({ Error: 'Invalid Updates.' });
    }

    try {
        const excursionId = req.params.excursionId;
        const excursion = await Excursion.findById({ _id: excursionId });

        if (!excursion) {
            res.status(404);
            throw new Error("Not Found");
        }

        if (!excursion.host.equals(req.user._id)) {
            res.status(403);
            throw new Error("Forbidden");
        }

        props.forEach((prop) => excursion[prop] = mods[prop]);
        await excursion.save();

        res.status(200).send({ excursion });
    } catch (error) {
        console.log(error);
        res.send(error);
    }
});

/**
 *  Delete Excursion By Id
 *  [ docs link ]
 */
router.delete('/excursion/:excursionId', auth, async (req, res) => {
    try {
        const excursion = Excursion.findById({ _id: req.params.excursionId });
        const user = await User.findById({ _id: req.user._id });

        if (!excursion.host.equals(user._id)) {
            res.status(403);
            throw new Error("Forbidden");
        }

        await Excursion.deleteOne({ _id: req.params.id });

        await User.updateOne((
            { _id: user._id },
            { $pull: { hostedExcursions: excursion._id } }
        ));

        res.status(200).send(excursion);
    } catch (error) {
        console.log(error);
        res.send(error);
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
 *  [ docs link ]
 */
router.post('/trip', auth, async (req, res) => {
    try {
        const trip = new Trip(req.body);
        await trip.save();

        if (!trip._id) {
            res.status(500);
            throw new Error("Internal Server Error");
        }

        await User.updateOne((
            { _id: req.body.host },
            { $push: { hostedTrips: trip._id } }
        ));

        res.status(201).send({ trip });
    } catch (error) {
        console.log(error);
        res.send(error);
    }
});

/**
 *  Get Trip By Id
 *  [ docs link ]
 */
router.get('/trip/:tripId', auth, async (req, res) => {
    try {
        const tripId = req.params.tripId;
        const trip = await Trip.findById({ _id: tripId });

        if (!trip) {
            res.status(404);
            throw new Error("Not Found");
        }

        res.status(200).send(trip);
    } catch (error) {
        res.send(error);
    }
});

/**
 *  Get Trip By User Id
 *  [ docs link ]
 */
router.get('/trips/:userId', auth, async (req, res) => {
    try {
        const userId = req.params.userId;

        const user = await User.findById({ _id: userId });

        if (!user) {
            res.status(404);
            throw new Error("User Not Found");
        }

        const trips = await Trip.findByUser(user);

        if (trips.length < 1) {
            res.status(404);
            throw new Error("Not Found");
        }

        res.status(200).send(trips);
    } catch (error) {
        console.log(error);
        res.send(error);
    }
});

/**
 *  Update Trip By Id
 *  [ docs link ]
 */
router.patch('/trip/:tripId', auth, async (req, res) => {
    const mods = req.body;

    if (mods.length === 0) {
        res.status(400);
        throw new Error("Bad Request");
    }

    const props = Object.keys(mods);
    const modifiable = ['name', 'description', 'park', 'campground', 'thingstodo', 'startDate', 'endDate'];

    const isValid = props.every((prop) => modifiable.includes(prop));

    if (!isValid) {
        return res.status(400).send({ Error: 'Invalid Updates.' });
    }

    try {
        const tripId = req.params.tripId;
        const trip = await Trip.findById({ _id: tripId });

        if (!trip) {
            res.status(404);
            throw new Error("Not Found");
        }

        if (!trip.host.equals(req.user._id)) {
            res.status(403);
            throw new Error("Forbidden");
        }

        props.forEach((prop) => trip[prop] = mods[prop]);
        await trip.save();

        res.status(200).send(trip);
    } catch (error) {
        console.log(error);
        res.send(error);
    }
});

/**
 *  Delete Trip By Id
 *  [ docs link ]
 */
router.delete('/trip/:tripId', auth, async (req, res) => {
    try {
        const trip = await Trip.findById({ _id: req.params.tripId });
        // could replace below with "req.user._id"
        const user = await User.findById({ _id: req.user._id });

        if (!trip.host.equals(user._id)) {
            res.status(403);
            throw new Error("Forbidden");
        }

        await Trip.deleteOne({ _id: trip._id });

        await User.updateOne((
            { _id: user._id },
            { $pull: { hostedTrips: trip._id } }
        ));

        res.status(200).send(trip);
    } catch (error) {
        console.log(error);
        res.send(error);
    }
});

// ----------------------- //
// #endregion              //
// ----------------------- //


module.exports = router;