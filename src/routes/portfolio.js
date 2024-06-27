const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/authentication');

router.get('/portfolio', isAuthenticated, (req, res) => {
    
    res.render('portfolio', {
        successMessage: req.flash('successMessage'),
        warningMessage: req.flash('warningMessage'),
        isAuthenticated: !!req.session.user,
        title: 'Portfolio',
    });
});


module.exports = router;
