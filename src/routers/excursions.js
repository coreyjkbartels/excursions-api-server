const express = require('express');
const Trip = require('../models/trip');
const Excursion = require('../models/excursion');
const auth = require('../middleware/auth');

const router = new express.Router();

// ---------------------------- //
// #region Excursion Management //
// ---------------------------- //

// Create a new excursion
router.post('/excursion', auth, async (req, res) => {
    try {
        const excursion = new Excursion(req.body);
        await excursion.save();

        res.status(201).send({ excursion });
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
});

// Get all excursions for a user
router.get('/excursions', auth, async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            throw new Error('Unable to retrieve excursions');
        }

        const excursions = await Excursion.findByUser({ user });

        if (excursions.length === 0) {
            throw new Error('Unable to retrieve excursions');
        }

        // maybe don't need {}
        res.status(200).send({ excursions });
    } catch (error) {
        res.status(500).send(error);
    }
});

// Get an excursion by id
router.get('/excursion/:id', auth, async (req, res) => {
    try {
        const excursion = await Excursion.findById(req.params.id);

        if (!excursion) {
            throw new Error("Could not locate requested resource.");
        }

        res.status(200).send({ excursion });
    } catch (error) {
        res.status(404).send({ Error: "Requested resource not found." });
    }
});

// Update an existing excursion
router.patch('/excursion/:id', auth, async (req, res) => {
    const mods = req.body;
    const props = Object.keys(mods);

    const modifiable = [];

    const isValid = props.every((prop) => modifiable.includes(prop));

    if (!isValid) {
        return res.status(400).send({ Error: 'Invalid updates.' });
    }

    try {
        const excursion = await Excursion.findById(req.params.id);

        props.forEach((prop) => excursion[prop] = mods[prop]);
        await excursion.save();

        res.status(200).send({ excursion });
    } catch (error) {
        res.status(400).send(error);
    }


});

// Delete an existing excursion
router.delete('/excursion/:id', auth, async (req, res) => {
    try {
        const excursion = Excursion.findById(req.params.id);
        await Excursion.deleteOne({ _id: req.params.id });

        res.status(200).send(excursion);
    } catch (error) {
        res.status(500).send(error);
    }
});

// ---------------------------- //
// #endregion                   //
// ---------------------------- //

// ----------------------- //
// #region Trip Management //
// ----------------------- //

// Create New Trip
router.post('/excursion/:id/trips', auth, async (req, res) => {
    try {
        const trip = new Trip(req.body);
        await trip.save();

        res.status(201).send({ trip });
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
});

// Get All Trips for an Excursion
router.get('/excursion/:id/trips', async (req, res) => {
    // Potentially redundant
});

// Get Single Trip for an Excursion
router.get('/excursion/:id/trips/:id', async (req, res) => {
    // Potentially redundant
});

// Update Trip for an Excursion
router.patch('/excursion/:id/trips/:id', async (req, res) => {
    // WIP
});

// Delete Trip for an Excursion
router.delete('/excursion/:id/trips/:id', async (req, res) => {
    // WIP
});

// ----------------------- //
// #endregion              //
// ----------------------- //


module.exports = router;