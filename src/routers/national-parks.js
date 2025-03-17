const express = require('express');
const router = new express.Router();

const NPS_API_URL = process.env.NPS_API_URL;
const NPS_API_KEY = process.env.NPS_API_KEY;

/**
 *  National Parks Pseudo-Schema
 * 
 *  This is the ideal for a trimmed response
 *  for the data returned by the NPS api. 
 */

/** 
 *  Process
 * 
 *  1. Read in Query Parameters from request
 *  2. Build Query String
 *  2. Fetch from NPS
 *  3. Trim returned data from NPS
 *  4. Return trimmed data to user.
 * 
 */

/**
 *  Query String Options
 * 
 *  parkCode - A comma delimited list of park codes (each 4-10 characters in length).
 *  stateCode - A comma delimited list of 2 character state codes.
 *  limit - Number of results to return per request. Default is 50.
 *  q - Term to search on
 * 
 */

router.get('/national-parks', async (req, res) => {
    try {
        const endpoint = 'parks';
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

                // remove excess data
                // for (let i = 0; i < data.data.length; i++) {
                //     delete data.data[i].latitude;
                //     delete data.data[i].longitude;
                //     delete data.data[i].latLong;
                //     delete data.data[i].contacts;
                //     delete data.data[i].topics;
                //     delete data.data[i].weatherInfo;
                //     delete data.data[i].relevanceScore;
                //     delete data.data[i].name;
                // }

                res.status(200).send(data);
            }
        } else {
            if (response.status === 400) {
                res.status(400).send();
            }
        }

    } catch (exception) {
        res.status(500).send(exception);
    }
});

module.exports = router;