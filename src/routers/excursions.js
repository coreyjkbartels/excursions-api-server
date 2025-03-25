const express = require('express');
const Trip = require('../models/trip');
const Excursion = require('../models/excursion');
const auth = require('../middleware/auth');

const router = new express.Router();

// ---------------------------- //
// #region Excursion Management //
// ---------------------------- //

/**
 *  Create Excursion
 * 
 */
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

/**
 *  Get Excursions By User
 *  
 */
router.get('/excursions', auth, async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            res.status(404);
            throw new Error('Not Found');
        }

        const excursions = await Excursion.findByUser({ user });

        if (excursions.length === 0) {
            res.status(404);
            throw new Error('Not Found');
        }
        res.status(200).send({ excursions });
    } catch (error) {
        res.send(error);
    }
});

/**
 *  Get Excursion By Id
 */
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

/**
 *  Update Excursion By Id
 * 
 */
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

/**
 *  Delete Excursion By Id
 */
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