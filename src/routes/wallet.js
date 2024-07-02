const express = require('express');
const router = express.Router();
const base = require('../middleware/airtable');
const { takeSnapshot } = require('../middleware/snapshot');


router.post('/wallet/connect', async (req, res) => {

    const { publicKey } = req.body;

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
            if (existingWallet[0].fields['Solana Wallet'] != publicKey) {
                const new_wallet = await base('solanaWallet').update([
                    {
                        "id": existingWallet[0].id,
                        "fields": {
                            "Solana Wallet": publicKey,
                        },  
                    }
                ], function(err, _records) {
                    if (err) {
                        console.error(err);
                        return;
                    };
                });
            };
            
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
            ], function(err, _records) {
                if (err) {
                    console.error(err);
                    return;
                };
            });

            // Take first snapshot after adding wallet
            takeSnapshot(publicKey);

        };

        // Update user's session with wallet
        req.session.user.wallet = publicKey;

        res.sendStatus(200);

    } catch (err) {
        console.error('Error updating data in Airtable:', err);
        res.sendStatus(500);
    };

});


// Check if session is expired
router.get('/session/check', (req, res) => {
    if (req.session.user) {
        res.status(200).json({ sessionActive: true });
    } else {
        res.status(401).json({ sessionActive: false });
    }
});

module.exports = router;