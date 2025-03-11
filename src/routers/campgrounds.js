const express = require('express');
const router = new express.Router();

const NPS_API_URL = process.env.NPS_API_URL;
const NPS_API_KEY = process.env.NPS_API_KEY;

/**
 *  TODO:
 * 
 *  1. Trim Response Data
 *  2. Redocly-CLI Output
 * 
 */

// This is literally the same exact code for the "national-parks" endpoint.
// NPS queries for this endpoint have the exact same parameters as the "parks" endpoint.

router.get('/campgrounds', async (req, res) => {

    try {
        const endpoint = 'campgrounds';
        let url = `${NPS_API_URL}/${endpoint}`;

        const options = {};

        const parameters = req.query;

        let query = '';

        if (parameters) {
            query += `?`;

            for (const [key, value] of Object.entries(parameters)) {
                if (query.length > 1) {
                    query += `&`;
                }

                query += `${key}=${value}`;
            }

            if (query.length > 1) {
                query += `&`;
            }

            query += `api_key=${NPS_API_KEY}`;
        }

        if (query) {
            url += query;
        }

        // fetch data from NPS api
        let response = await fetch(url, options);

        if (response.ok) {
            if (response.status === 200) {
                const data = await response.json();

                /**
                 *  Trim data as desired
                 *  Return trimmed data
                 */

                res.status(200).send(data);
            }
        } else {
            if (response.status === 400) {
                res.status(400).send();
            }
        }

    } catch (exception) {
        console.log(exception);
        res.status(500).send(exception);
    }

});

module.exports = router;