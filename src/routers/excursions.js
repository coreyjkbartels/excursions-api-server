const express = require('express');
const Excursion = require('../models/excursion');
const Trip = require('../models/trip');
const User = require('../models/user');
const auth = require('../middleware/auth');
const mongoose = require('mongoose')

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
        req.body.host = req.user._id

        const excursion = new Excursion(req.body);
        await excursion.save();

        const trips = []
        for (let id of req.body.trips) {
            const trip = await Trip.findById(id)
            trips.push(trip)
        }

        excursion.trips = trips

        res.status(201).send({ excursion });
    } catch (error) {
        console.log(error);
        res.status(400).send({ Error: 'Bad Request' });
    }
});

/**
 *  Get Excursions By User
 *  [ docs link ]
 */
router.get('/excursions', auth, async (req, res) => {
    try {
        const filter = { host: req.user._id }

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
        ])

        const excursions = await pipeline.exec()

        res.status(200).send({ excursions });

    } catch (error) {
        console.log(error);
        res.status(500).send(error);
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
            res.status(400).send({ Error: "Invalid excursion id" });
            return
        }

        // TODO: check make sure req.user is host or participant

        const trips = []
        for (let id of excursion.trips) {
            const trip = await Trip.findById(id)
            trips.push(trip)
        }

        excursion.trips = trips

        res.status(200).send({ excursion });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

/**
 *  Update Excursion By Id
 *  [ docs link ]
 */
router.patch('/excursion/:excursionId', auth, async (req, res) => {
    const mods = req.body;

    if (mods.length === 0) {
        res.status(400).send({ Error: "Missing updates" });
        return
    }

    const props = Object.keys(mods);
    const modifiable = ['name', 'description', 'participants', 'trips', 'isComplete'];

    const isValid = props.every((prop) => modifiable.includes(prop));

    if (!isValid) {
        return res.status(400).send({ Error: 'Invalid Updates.' });
    }

    try {
        const excursion = await Excursion.findById({ _id: req.params.excursionId });

        if (!excursion) {
            res.status(400).send({ Error: 'Invalid excursion id'});
            return
        }

        if (!excursion.host.equals(req.user._id)) {
            res.status(403).send({ Error: "Forbidden"});
            return
        }

        props.forEach((prop) => excursion[prop] = mods[prop]);
        await excursion.save();

        const trips = []
        for (let id of excursion.trips) {
            const trip = await Trip.findById(id)
            trips.push(trip)
        }

        excursion.trips = trips

        res.status(200).send({ excursion });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

/**
 *  Delete Excursion By Id
 *  [ docs link ]
 */
router.delete('/excursion/:excursionId', auth, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.excursionId)) {
            res.status(400).send({ Error: "Invalid excursion id" })
            return
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

        await User.updateOne((
            { _id: req.body._id },
            { $push: { hostedTrips: trip._id } }
        ));

        res.status(201).send({ trip });
    } catch (error) {
        console.log(error);
        res.status(400).send({ Error: 'Bad request'});
    }
});

/**
 *  Get Trip By Id
 *  [ docs link ]
 */
router.get('/trip/:tripId', auth, async (req, res) => {
    try {
        const trip = await Trip.findById({ _id: req.params.tripId });

        if (!trip) {
            res.status(400).send({ Error: "Invalid trip id" });
            return
        }

        res.status(200).send(trip);
    } catch (error) {
        console.log(error)
        res.status(500).send(error);
    }
});

/**
 *  Get Trip By User Id
 *  [ docs link ]
 */
router.get('/trips', auth, async (req, res) => {
    try {
        const trips = await Trip.findByUser(req.user._id);
        res.status(200).send(trips);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

/**
 *  Update Trip By Id
 *  [ docs link ]
 */
router.patch('/trip/:tripId', auth, async (req, res) => {
    const mods = req.body;

    if (mods.length === 0) {
        res.status(400).send({ Error: 'Missing updates' })
        return
    }

    const props = Object.keys(mods);
    const modifiable = ['name', 'description', 'park', 'campground', 'thingstodo', 'startDate', 'endDate'];

    const isValid = props.every((prop) => modifiable.includes(prop));

    if (!isValid) {
        res.status(400).send({ Error: 'Invalid Updates.' });
        return 
    }

    try {
        const trip = await Trip.findById({ _id: req.params.tripId });

        if (!trip) {
            res.status(404).send({ Error: 'Invalid trip id'});
            return
        }

        if (!trip.host.equals(req.user._id)) {
            res.status(403).send({ Error: 'Forbidden'})
            return
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
 *  [ docs link ]
 */
router.delete('/trip/:tripId', auth, async (req, res) => {
    try {

        const trip = await Trip.findById({ _id: req.params.tripId });

        if (!trip.host.equals(req.user._id)) {
            res.status(403).send({ Error: 'Forbidden'});
            return
        }

        await Trip.deleteOne({ _id: req.params.tripId });

        await User.updateOne((
            { _id: req.user._id },
            { $pull: { hostedTrips: req.params.tripId } }
        ));

        // TODO: delete trip from all excursions

        await Excursion.updateMany(
            { host: req.user._id },
            { $pull: { trips: { _id: req.params.tripId }}}
        )

        res.status(200).send();
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
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