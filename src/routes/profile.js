const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/authentication');
const base = require('../middleware/airtable');

router.get('/profile', isAuthenticated, async (req, res) => {

    let userWallet = 'You need to connect your wallet first';

    const user = await base('userAuth').select({
        filterByFormula: `{Email} = '${req.session.user.email}'`,
        maxRecords: 1,
    }).firstPage();

    const userData = user[0].fields;

    const existingWallet = await base('solanaWallet').select({
        filterByFormula: `{userAuth} = '${req.session.user.email}'`,
        maxRecords: 1,
    }).firstPage();

    if (existingWallet.length > 0) {
        userWallet = existingWallet[0].fields['Solana Wallet'];
    };

    return res.render('profile', {
        successMessage: req.flash('successMessage'),
        warningMessage: req.flash('warningMessage'),
        title: 'Profile',
        isAuthenticated: !!req.session.user,
        userData,
        userWallet,
    });
});

router.post('/profile', async (req, res) => {

    const { first_name, last_name, username, email } = req.body;

    const user = await base('userAuth').select({
        filterByFormula: `{Email} = '${req.session.user.email}'`,
        maxRecords: 1,
    }).firstPage();

    const userData = user[0].fields;

    const fields = {};

    dataUpdate = false;
    emailUpdated = false;

    if (first_name !== '' && first_name !== userData['First Name']) {
        fields['First Name'] = first_name;
        dataUpdate = true;
    };
    if (last_name !== '' && last_name !== userData['Last Name']) {
        fields['Last Name'] = last_name;
        dataUpdate = true;
    };
    if (username !== '' && username !== userData['Username']) {
        fields['Username'] = username;
        dataUpdate = true;
    };
    if (email !== '' && email !== userData['Email']) {
        
        // Checking for an existing email
        const existingEmail = await base('userAuth').select({
            filterByFormula: `{Email} = '${email}'`,
            maxRecords: 1,
        }).firstPage();

        if (existingEmail.length == 0) {
            fields['Email'] = email;
            dataUpdate = true;
            emailUpdated = true;
        } else {
            req.flash('warningMessage', 'This email has already been taken. Try again.');
            return res.redirect('profile');
        };
        
    };


    if (dataUpdate) {

        try {

            await base('userAuth').update([
                {
                    "id": user[0].id,
                    "fields": fields
                }
            ], function(err, records) {
                if (err) {
                  console.error(err);
                  return;
                };
              });
    
            req.flash('successMessage', 'Your profile data was successfully updated.');

        } catch (err) {
            req.flash('warningMessage', 'Error updating profile info:', err);
        };

        if (emailUpdated) {
            req.session.destroy();
            return res.redirect('login');
        };

        return res.redirect('profile')
    };

    return res.redirect('profile');
});

module.exports = router;
