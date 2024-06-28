const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/authentication');
const { fungiblesWalletBalance } = require('../middleware/wallet-info');
const base = require('../middleware/airtable');

router.get('/portfolio', isAuthenticated, async (req, res) => {

    let walletAdded = null;

    try {
        const existingWallet = await base('solanaWallet').select({
            filterByFormula: `{userAuth} = '${req.session.user.email}'`,
            maxRecords: 1,
        }).firstPage();

        if (existingWallet.length === 0) {
            walletAdded = false;
            req.flash('warningMessage' ,'You need to connect your wallet first.')
        } else {
            
            walletAdded = true;
            publicKey = existingWallet[0].fields['Solana Wallet']

            const walletData = await fungiblesWalletBalance(publicKey);
            console.log('Tokens data:', walletData.sortedTokensData);
            console.log('Wallet Balance in USDC:', walletData.total_wallet_balance_usdc);
        
        };

        return res.render('portfolio', {
            successMessage: req.flash('successMessage'),
            warningMessage: req.flash('warningMessage'),
            isAuthenticated: !!req.session.user,
            title: 'Portfolio',
            walletAdded: walletAdded,
        });        

    } catch (err) {

        console.log('Error occured while loading Portfolio page:', err);
        return res.redirect('index');

    };

});


module.exports = router;
