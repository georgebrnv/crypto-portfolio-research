const express = require('express');
const { isAuthenticated } = require('../middleware/authentication');
const router = express.Router();
const base = require('../middleware/airtable');
const { generateNote } = require('../middleware/research');
const { fungiblesWalletBalance } = require('../middleware/wallet-info');

// Load .env variables
require('dotenv').config();

router.get('/research', isAuthenticated, async (req, res) => {

    try {

        const user = await base('solanaWallet').select({
            filterByFormula: `{userAuth} = '${req.session.user.email}'`,
            maxRecords: 1,
        }).firstPage();

        // Check if user has wallet added
        if (user.length === 0) {
            return res.redirect('portfolio');
        };
    
        const publicKey = user[0].fields['Solana Wallet'];
        const walletData = await fungiblesWalletBalance(publicKey);
        tokensData = walletData.sortedTokensData;

        const userArticles = await base('research').select({
            filterByFormula: `{User} = '${req.session.user.email}'`,
        }).all();
    
        res.render('research', {
            successMessage: req.flash('successMessage'),
            warningMessage: req.flash('warningMessage'),
            isAuthenticated: !!req.session.user,
            title: 'Research',
            tokensData,
            userArticles,
        });

    } catch (error) {
        console.error('Error fetching research data:', error);
        res.status(500).send('Internal Server Error');
    };

    
});

router.post('/research/note/add', isAuthenticated, async (req, res) => {
    const { note, tokenSymbolAdd } = req.body;

    try {
    
        const userId = await getUserId(req.session.user.email);
    
        const newNote = await base('research').create([
            {
                "fields": {
                    "Token": tokenSymbolAdd,
                    "Note": note,
                    "User": [
                        userId
                    ]
                }
            },
        ], function(err, records) {
            if (err) {
              console.error(err);
              req.flash('warningMessage', 'Error creating new note, try again.')
              return res.redirect('/research');
            };
          });
    
        req.flash('successMessage', 'New note was added successfully.');
        return res.redirect('/research');

    } catch (err) {
        console.error('Error adding new note:', err);
        return res.redirect('/research');
    };

});

router.post('/research/note/generate', isAuthenticated, async (req, res) => {
    const { tokenSymbolGenerate } = req.body;

    try {
    
        const userId = await getUserId(req.session.user.email);

        const articles = await generateNote(tokenSymbolGenerate);

        if (articles == null) {
            req.flash('warningMessage', 'No articles about this token were found.');
            return res.redirect('/research');
        };

        const firstArticleContent = articles[0]['content'];
        const articleUrl = articles[0]['url'];

        const newNote = await base('research').create([
            {
                "fields": {
                    "Token": tokenSymbolGenerate,
                    "Note": firstArticleContent,
                    "Article URL": articleUrl,
                    "User": [
                        userId
                    ]
                }
            },
        ], function(err, records) {
            if (err) {
              console.error(err);
              req.flash('warningMessage', 'Error creating new note, try again.')
              return res.redirect('/research');
            };
          });

        req.flash('successMessage', 'New note was successfully generated.');
        return res.redirect('/research');
        
    } catch (err) {
        console.error('Error generating new note:', err);
        return res.redirect('/research');
    };

});

router.post('/research/note/delete', isAuthenticated, async (req, res) => {
    const { recordId } = req.body;

    try {

        const deletedArticle = await base('research').destroy([
            recordId
        ], function(err, deletedRecords) {
            if (err) {
              console.error(err);
              return;
            }
        });

        req.flash('successMessage', 'The note was successfully deleted.');
        return res.redirect('/research');

    } catch (err) {
        console.error('Error deleting note:', err);
        req.flash('warningMessage', 'Error deleting the note. Try again.');
        return res.redirect('/research');
    };

});

async function getUserId(email) {

    const user = await base('userAuth').select({
        filterByFormula: `{Email} = '${email}'`,
        maxRecords: 1,
    }).firstPage();

    const userId = user[0].id;

    return userId;

};

module.exports = router;