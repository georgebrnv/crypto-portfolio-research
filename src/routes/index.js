const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/authentication');

router.get('/', (req, res) => {

    res.render('index', {
        isAuthenticated: !!req.session.user,
        title: 'Home',
    });
});


module.exports = router;
