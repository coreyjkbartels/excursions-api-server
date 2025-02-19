const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid.');
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 8,
        // use "match" property for RegEx to check against
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    userName: {
        // TODO: Auto-generated with first and last names. (i.e., "Will German"  --> "wgerman")
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    avatar: {
        // TODO: Add profile picture
        type: Buffer
    },
    tokens: [{
        token: {
            // TODO: Bake in 7 day maximum before the server cleanses the tokens
            // --> Date objects for when token is set and use "expires" property on the date for expiration.
            // "Your session has expired."
            type: String,
            required: true
        }
    }]
});


/**
 * 
 * @returns 
 */
userSchema.methods.toJSON = function () {
    const user = this;

    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.__v;
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject;
};


/**
 * 
 * @returns 
 */
userSchema.methods.generateAuthToken = async function () {
    const user = this;

    const token = jwt.sign({ _id: user._id.toString() }, process.env.JSON_WEB_TOKEN_SECRET);

    user.tokens = user.tokens.concat({ token });
    await user.save();

    return token;
};


/**
 * 
 * @param {*} email 
 * @param {*} password 
 * @returns 
 */
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error('Unable to login');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error('Unable to login');
    }

    return user;
};


/**
 * 
 */
userSchema.pre('save', async function (next) {
    const user = this;

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next(); // run the save() method
});


/**
 * 
 */
userSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
    const user = this;

    await mongoose.model('Task').deleteMany({ owner: user._id });
    next();
});


const User = mongoose.model('User', userSchema);

module.exports = User;