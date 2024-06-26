const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/authentication');

router.get('/portfolio', isAuthenticated, (req, res) => {
    
    res.render('portfolio', {
        logoutMessage: req.flash('logoutMessage'),
        loginMessage: req.flash('loginMessage'),
        signupMessage: req.flash('signupMessage'),
        isAuthenticated: isAuthenticated ? true : false,
        title: 'Portfolio',
    });
});


module.exports = router;
