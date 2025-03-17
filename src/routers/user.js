const express = require('express');
const User = require('../models/user');
const auth = require('../middleware/auth');

const router = new express.Router();

// ----------------------- //
// #region User Management //
// ----------------------- //

// Create a new user
router.post('/user', async (req, res) => {
    try {
        const user = new User(req.body);

        await user.save();
        const token = await user.generateAuthToken();

        res.status(201).send({ user, token });
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
});

// Get an existing user
router.get("/user", auth, async (req, res) => {
    res.status(200).send(req.user);
});

// Update an existing user
router.patch('/user', auth, async (req, res) => {
    const mods = req.body;
    const props = Object.keys(mods);
    const modifiable = ['firstName', 'lastName', 'userName', 'password', 'email'];
    const isValid = props.every((prop) => modifiable.includes(prop));

    if (!isValid) {
        return res.status(400).send({ error: 'Invalid updates.' });
    }

    try {
        const user = req.user;
        props.forEach((prop) => user[prop] = mods[prop]);
        await user.save();
        res.status(200).send(user);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Delete an existing user
router.delete('/user', auth, async (req, res) => {
    try {
        await User.deleteOne({ _id: req.user._id });
        res.status(200).send(req.user);
    } catch (error) {
        res.status(500).send(error);
    }
});

// ----------------------- //
// #endregion              //
// ----------------------- //

// ---------------------- //
// #region Authentication //
// ---------------------- //

// Grant a user authenticated status
router.post('/user/sign-in', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();

        res.status(200).send({ user, token });
    } catch (error) {
        res.status(400).send(error);
    }
});

// Remove a user's authenticated status
router.post("/user/sign-out", auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });
        await req.user.save();

        res.send();
    } catch (error) {
        res.status(500).send(error);
    }
});

// ---------------------- //
// #endregion             //
// ---------------------- //

module.exports = router;