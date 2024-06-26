const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/authentication');

router.get('/profile', isAuthenticated, (req, res) => {
    res.render('profile', {
        message: req.flash('signupMessage'),
        title: 'Profile',
        isAuthenticated: !!req.session.user,
    });
});


module.exports = router;
