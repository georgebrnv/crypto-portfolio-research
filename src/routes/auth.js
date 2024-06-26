const express = require('express');
const router = express.Router();

router.get('/signup', (req, res) => {
    res.render('signup');
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/logout', (req, res) => {
    res.render('login');
});

module.exports = router;

