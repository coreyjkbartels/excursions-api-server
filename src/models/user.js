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
        trim: true,
        lowercase: true,
        // validator for if isEmpty
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        // validator for if isEmpty
    },
    userName: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
        // validator for if isEmpty
    },
    avatar: {
        // TODO: Add profile picture
        // type: Buffer (?)
    },
    tokens: [{
        token: {
            type: String,
            required: false
        }
    }],
    hostedExcursions: [{
        type: Schema.Types.ObjectId,
        ref: 'Excursion',
        default: null,
        // probably requires a validator to make sure host matches this user id
    }],
    sharedExcursions: [{
        type: Schema.Types.ObjectId,
        ref: 'Excursion',
        default: null,
        // probably requires a validator to make sure host does not match this user id
    }],
    completedExcursions: [{
        type: Schema.Types.ObjectId,
        ref: 'Excursion',
        default: null,
        // probably requires a validator to make sure the "isComplete" property on the Excursion is true
    }],
    hostedTrips: [{
        type: Schema.Types.ObjectId,
        ref: 'Trip',
        default: null,
        // probable requires a validator to make sure host matches this user id
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
 *  generateAuthToken
 *  @returns string bearerToken
 */
userSchema.methods.generateAuthToken = async function () {
    const user = this;

    const token = jwt.sign({ _id: user._id.toString() }, process.env.JSON_WEB_TOKEN_SECRET);

    user.tokens = user.tokens.concat({ token });
    await user.save();

    return token;
};


/**
 *  findByCredentials
 *  @param {*} email 
 *  @param {*} password 
 *  @returns 
 */
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error('Unable to sign in');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error('Unable to sign in');
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