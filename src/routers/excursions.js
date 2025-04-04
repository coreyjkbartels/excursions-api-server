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
        const { name, description, trips } = req.body;

        /**
         *  Sort trips by start dates
         *  Check if start-end dates overlap by more than 1 day
         *  If overlap, throw an error and return the newly created all trip objects (including newly created).
         *  If no overlap, proceed
         */

        const data = {
            "name": name,
            "description": description,
            "trips": trips,
            "host": req.user._id,
        };

        const excursion = new Excursion(data);
        await excursion.save();

        /**
         *  Create Pipeline
         *  1. Get Trip objects
         *  2. Get Host User object
         *  3. Get Participant User objects
         *  4. Create new object (i.e., returnExcursion)
         *  5. Append data & return new object to Client
         */

        const hostObject = await User.findPublicUser(excursion.host._id);

        if (!hostObject) {
            res.status(404);
            throw new Error("Not Found");
        }

        // $match
        // { _id: { $in: excursion.trips } }
        const tripObjects = await Trip.find({ _id: { $in: excursion.trips } });

        console.log(tripObjects);

        const returnExcursion = {
            host: hostObject,
            trips: tripObjects,
            // participants: {},
        };

        /**
         *  1. Get the Trip objects
         * 
         *  Go into the Trips collection
         *  Match the _id of the Trip to the
         *  one of the _id's in the Excursion's 
         *  trips array.
         * 
         *  Output this in a new array containing
         *  the resulting documents.
         */

        /**
         *  2. Get the Host User object for this Excursion.
         * 
         *  Go into the Users collection
         *  Match the _id of the User to the
         *  Excursion's host field.
         * 
         *  Output this in a new array containing
         *  the resulting documents.
         */

        // {
        //     from: "users",
        //     foreignField: "_id",
        //     localField: "host",
        //     as: "host"
        // }

        /**
         *  3. Get the Participants objects for this Excursion.
         * 
         *  Go into the Users collection
         *  Match the _id of the Participant to the
         *  one of the _id's in the Excursion's 
         *  participants array.
         * 
         *  Output this in a new array containing
         *  the resulting documents.
         */




        res.status(201).send({ returnExcursion });
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

// aggregate return on trips includes
// 1 call using park id to get parkCode
// 1 call to get all campgrounds for that parkCode
// 1 call to get all things to do with that parkCode

// ----------------------- //
// #region Trip Management //
// ----------------------- //

/**
 *  Create Trip
 *  [ docs link ]
 */
router.post('/trip', auth, async (req, res) => {
    try {

        const data = {
            ...req.body,
            "host": req.user._id
        };

        const trip = new Trip(data);
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

// -------------------------- //
// #region Sharing Excursions //
// -------------------------- //

// -------------------------- //
// #endregion                 //
// -------------------------- //

module.exports = router;