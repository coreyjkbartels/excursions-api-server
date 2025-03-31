const express = require('express');
const Excursion = require('../models/excursion');
const Trip = require('../models/trip');
const User = require('../models/user');
const auth = require('../middleware/auth');

const router = new express.Router();

// ----------------------- //
// #region Trip Management //
// ----------------------- //

/**
 *  Move trip router out of excursions router
 *  Add statics for adding trips within excursion?
 *  Only do this shit after it works in the fucking excursions router.
 */

// ----------------------- //
// #endregion              //
// ----------------------- //