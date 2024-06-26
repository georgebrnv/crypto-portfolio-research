const express = require('express');
const router = express.Router();
const Airtable = require('airtable');
const bcrypt = require('bcrypt');
const { isAuthenticated } = require('../middleware/authentication');

// Load .env variables
require('dotenv').config();

// Airtable connection
const base = new Airtable({
    apiKey: process.env.AIRTABLE_ACCESS_TOKEN
}).base(process.env.AIRTABLE_BASE_ID);

// Password hashing func
async function hashPassword(password) {
    const salt = await bcrypt.genSalt(14);
    return bcrypt.hash(password, salt);
};

router.get('/signup', (req, res) => {

    res.render('signup', {
        signupMessage: req.flash('signupMessage'),
        isAuthenticated: !!req.session.user,
        title: 'Sign Up',
    });
});

router.post('/signup', async (req, res) => {

    const { email, password, password_confirm } = req.body;

    const existingUser = await base('userAuth').select({
        filterByFormula: `{Email} = '${email}'`,
        maxRecords: 1,
    }).firstPage();

    if (existingUser.length > 0) {
        req.flash('signupMessage', 'Sign Up Error: User with this email already exists.');
        return res.redirect('signup');
    } 
    if (password !== password_confirm) {
        req.flash('signupMessage', 'Sign Up Error: passwords do not match.');
        return res.redirect('signup');
    }

    try {
        // Hash the password
        const hashedPassword = await hashPassword(password);

        await base('userAuth').create([
            {
                "fields": {
                    "Email": email,
                    "Password": hashedPassword,
                }
            }
        ], function(err, _records) {
            if (err) {
                console.error(err);
                return;
            };
        });

        req.session.user = {
            email: email,
        };

        req.flash('signupMessage', 'You have successfully signed up!');
        return res.redirect('portfolio', {
            'signupMessage': req.flash('signupMessage'),
        });

    } catch (error) {
        console.error('Error signing up:', error);
        return res.redirect('signup');
    };

});

router.get('/login', (req, res) => {
    
    res.render('login', {
        logoutMessage: req.flash('logoutMessage'),
        loginMessage: req.flash('loginMessage'),
        isAuthenticated: !!req.session.user,
        title: 'Log In',
    });
});

router.post('/login', async (req, res) => {

    const { email_username, password } = req.body;

    try {
        const existingUser = await base('userAuth').select({
            filterByFormula: `OR({Email} = '${email_username}', {Username} = '${email_username}')`,
            maxRecords: 1
        }).firstPage();
    
        if (existingUser.length === 0) {
            req.flash('loginMessage', 'Login Error: User does NOT exist.');
            return res.redirect('login');
        }
    
        const user = existingUser[0].fields;
        const passwordMatch = await bcrypt.compare(password, user.Password);
    
        if (!passwordMatch) {
            req.flash('loginMessage', 'Login Error: Incorrect Password.');
            return res.redirect('login');
        }

        req.session.user = {
            email: email_username,
        };

        req.flash('loginMessage', 'Logged In sucessfully.')
        return res.redirect('portfolio');

    } catch (error) {
        console.error('Error logging in:', error);
        req.flash('loginMessage', 'Error logging in user.');
        return res.redirect('login');
    };

})

router.post('/logout', isAuthenticated, async (req, res) => {

        req.session.destroy((err) => {
            if (err) {
                console.error('Error loggin out:', err);
                req.flash('logoutMessage', 'Error logging out.');
                return res.redirect('portfolio');
            }
            return res.redirect('login');
        });
        
    
});


module.exports = router;
