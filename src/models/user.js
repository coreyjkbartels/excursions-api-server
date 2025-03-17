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
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    userName: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
        // TODO: Auto-generated with first and last names. (i.e., "Will German"  --> "wgerman")
    },
    avatar: {
        // TODO: Add profile picture
        // type: Buffer
    },
    tokens: [{
        token: {
            type: String,
            required: false
        }
    }],
    excursions: [{
        type: Schema.Types.ObjectId,
        ref: 'Excursion',
        default: null,
    }],
    completedExcursions: [{
        type: Schema.Types.ObjectId,
        ref: 'Excursion',
        default: null,
        // probably requires a validator to make sure the "isComplete" property on the Excursion is true
    }]
});



/**
 *  toJSON
 *  @returns JSON userObject
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