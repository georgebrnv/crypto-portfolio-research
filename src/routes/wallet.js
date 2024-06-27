const express = require('express');
const router = express.Router();
const base = require('../middleware/airtable');

// Load .env variables
require('dotenv').config();

router.post('/wallet/connect', async (req, res) => {

    const { publicKey } = req.body;
    console.log('Received wallet connection:', publicKey);

    try {
        const user = await base('userAuth').select({
            filterByFormula: `{Email} = '${req.session.user.email}'`,
            maxRecords: 1,
        }).firstPage();

        if (user.length === 0) {
            throw new Error('User not found.');
        }

        const existingWallet = await base('solanaWallet').select({
            filterByFormula: `{userAuth} = '${user[0].fields['Email']}'`,
            maxRecords: 1,
        }).firstPage();

        if (existingWallet.length > 0) {
            const new_wallet = await base('solanaWallet').update([
                {
                    "id": existingWallet[0].id,
                    "fields": {
                        "Solana Wallet": publicKey,
                    },  
                }
            ], function(err, records) {
                if (err) {
                    console.error(err);
                    return;
                }
                records.forEach(function (record) {
                    console.log(record.getId());
                });
            });
        } else {
            const new_wallet = await base('solanaWallet').create([
                {
                    "fields": {
                        "Solana Wallet": publicKey,
                        "userAuth": [
                            user[0].id
                        ]
                    },  
                }
            ], function(err, records) {
                if (err) {
                    console.error(err);
                    return;
                }
                records.forEach(function (record) {
                    console.log(record.getId());
                });
            });
        };

        // Update user's session with wallet
        req.session.user.wallet = publicKey;

        res.sendStatus(200);

    } catch (err) {
        console.error('Error updating data in Airtable:', err);
        res.sendStatus(500);
    };

});


module.exports = router;
