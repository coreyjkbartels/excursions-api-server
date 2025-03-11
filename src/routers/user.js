const express = require('express');
const router = new express.Router();
const auth = require('../middleware/auth');

/**
 *  Create New User
 *  # redocly-link
 */
router.post('/user', async (req, res) => {

    try {
        const user = new User(req.body);

        await user.save();
        const token = await user.generateAuthToken();

        res.status(201).send({ user, token });
    }
    catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
});


/**
 *  Get Existing User
 *  # redocly-link
 */
router.get("/user", auth, async (req, res) => {
    res.send(req.user);
});


/**
 *  Update Existing User
 *  # redocly-link
 */
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
        res.send(user);
    } catch (e) {
        res.status(400).send(e);
    }
});


/**
 *  Delete Existing User
 *  # redocly-link
 */
router.delete('/user', auth, async (req, res) => {
    try {
        console.log(req.user);
        await User.deleteOne({ _id: req.user._id });
        res.send(req.user);
    } catch (e) {
        res.status(500).send();
    }
});


/**
 *  Sign User In
 *  # redocly-link
 */
router.post('/user/sign-in', async (req, res) => {

    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.status(200).send({ user, token });
    } catch (e) {
        res.status(400).send();
    }
});


/**
 *  Sign User Out
 *  # redocly-link
 */
router.post("/user/sign-out", auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });
        await req.user.save();

        res.send();
    } catch (e) {
        res.status(500).send();
    }
});

module.exports = router;