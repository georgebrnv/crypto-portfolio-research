const Airtable = require('airtable');
require('dotenv').config();

// Airtable connection
const base = new Airtable({
    apiKey: process.env.AIRTABLE_ACCESS_TOKEN
}).base(process.env.AIRTABLE_BASE_ID);

module.exports = base;