const express = require('express');
const router = new express.Router();
const auth = require('../middleware/auth');


/**
 *  2 Approaches:
 *  
 *  1. This acts as a middleman to the National Park Service API and takes the user query to get, clean, and return data from said service.
 * 
 *  2. This pulls the data from a custom DB, in which case the data needs to be fetched from NPS API, cleaned, and stored in the database PRIOR to this being fully implemented.
 */
router.get('/national-parks', async (req, res) => {
    console.log("GET: /national-parks");
});

module.exports = router;