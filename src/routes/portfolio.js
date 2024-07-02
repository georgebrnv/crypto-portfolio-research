const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/authentication');
const { fungiblesWalletBalance } = require('../middleware/wallet-info');
const base = require('../middleware/airtable');
const { balanceChart } = require('../middleware/chart');

router.get('/portfolio', isAuthenticated, async (req, res) => {

    let walletAdded = null;
    let netWorth = 0;
    let solanaBalanceUsdc = 0;
    let tokenBiggestPositionUsdc = 0;
    let tokenBiggestPositionSymbol = '';
    let snapshotsData = {};

    try {
        const existingWallet = await base('solanaWallet').select({
            filterByFormula: `{userAuth} = '${req.session.user.email}'`,
            maxRecords: 1,
        }).firstPage();

        const userInfo = await base('userAuth').select({
            filterByFormula: `{Email} = '${req.session.user.email}'`,
            maxRecords: 1,
        }).firstPage();

        userName = userInfo[0].fields['Username'];
        if (userName == undefined) {
            userName = userInfo[0].fields['Email']
        };

        if (existingWallet.length === 0) {
            walletAdded = false;
            req.flash('warningMessage' ,'You need to connect your wallet first.')

            return res.render('portfolio', {
                successMessage: req.flash('successMessage'),
                warningMessage: req.flash('warningMessage'),
                isAuthenticated: !!req.session.user,
                title: 'Portfolio',
                walletAdded,
                userName,
            }); 
        } else {

            
            walletAdded = true;
            publicKey = existingWallet[0].fields['Solana Wallet'];

            walletData = await fungiblesWalletBalance(publicKey);

            // Total Wallet Balance in USDC
            netWorth = walletData.totalWalletBalanceUsdc;
            // Solana Balance in USDC
            solanaBalanceUsdc = walletData.solanaBalanceUsdc;
            // Token Biggest position in USDC
            tokenBiggestPositionUsdc = walletData.tokenBiggestPositionUsdc;
            // Token Biggest position symbol
            tokenBiggestPositionSymbol = walletData.tokenBiggestPositionSymbol;
            // Tokens data
            tokensData = walletData.sortedTokensData;

            // Snapshots data
            snapshotsData = await balanceChart(publicKey);
        
        };

        return res.render('portfolio', {
            successMessage: req.flash('successMessage'),
            warningMessage: req.flash('warningMessage'),
            isAuthenticated: !!req.session.user,
            title: 'Portfolio',
            walletAdded,
            userName,
            tokensData,
            netWorth: parseFloat(netWorth).toFixed(2),
            solanaBalanceUsdc: parseFloat(solanaBalanceUsdc).toFixed(2),
            tokenBiggestPositionUsdc: parseFloat(tokenBiggestPositionUsdc).toFixed(2),
            tokenBiggestPositionSymbol,
            snapshotsData,
        });        

    } catch (err) {

        console.error('Error occured while loading Portfolio page:', err);
        return res.redirect('index');

    };

});


module.exports = router;
