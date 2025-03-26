const express = require('express');
const User = require('../models/user');
const auth = require('../middleware/auth');

const router = new express.Router();

// ----------------------- //
// #region User Management //
// ----------------------- //

/**
 *  Create User
 *  https://will-german.github.io/excursions-api-docs/#tag/User-Management/operation/create-user
 */
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

/**
 *  Get User
 *  https://will-german.github.io/excursions-api-docs/#tag/User-Management/operation/get-user
 */
router.get("/user", auth, async (req, res) => {
    res.status(200).send(req.user);
});

/**
 *  Update User
 *  https://will-german.github.io/excursions-api-docs/#tag/User-Management/operation/update-user
 */
router.patch('/user', auth, async (req, res) => {
    const mods = req.body;

    if (mods.length === 0) {
        res.status(400);
        throw new Error("Bad Request");
    }

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

/**
 *  Delete User
 *  https://will-german.github.io/excursions-api-docs/#tag/User-Management/operation/delete-user
 */
router.delete('/user', auth, async (req, res) => {
    try {
        await User.deleteOne({ _id: req.user._id });

        res.status(200).send(req.user);
    } catch (error) {
        res.status(500).send(error);
    }
});

/**
 *  Get User By Id
 *  https://will-german.github.io/excursions-api-docs/#tag/User-Management/operation/get-user-by-id
 */
router.get('/user/:userId', auth, async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById({ _id: userId });

        if (!user) {
            res.status(404);
            throw new Error("Not Found");
        }

        res.status(200).send(user);
    } catch (error) {
        res.send(error);
    }
});

// ----------------------- //
// #endregion              //
// ----------------------- //

// --------------------------- //
// #region User Authentication //
// --------------------------- //

/**
 *  Sign In
 *  https://will-german.github.io/excursions-api-docs/#tag/User-Authentication/operation/sign-user-in
 */
router.post('/user/sign-in', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();

        res.status(200).send({ user, token });
    } catch (error) {
        res.status(400).send(error);
    }
});

/**
 *  Sign Out
 *  https://will-german.github.io/excursions-api-docs/#tag/User-Authentication/operation/sign-user-out
 */
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

// --------------------------- //
// #endregion                  //
// --------------------------- //

module.exports = router;