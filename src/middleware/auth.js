const jwt = require('jsonwebtoken');
const User = require('../models/user');

/**
 *  auth
 *  @param {*} req 
 *  @param {*} res 
 *  @param {*} next 
 */
const auth = async (req, res, next) => {
    try {
        let token = req.header('Authorization');
        token = token.replace('Bearer ', '');

        const decoded = jwt.verify(token, process.env.JSON_WEB_TOKEN_SECRET);

        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });

        if (!user) {
            throw new Error();
        }

        req.token = token;
        req.user = user;

        next();

    } catch (e) {
        res.status(401).send({ error: 'Invalid authentication status.' });
    }
};

module.exports = auth;