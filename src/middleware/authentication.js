function isAuthenticated(req, res, next) {
    if (req.session  && req.session.user) {
        return next();
    };

    req.flash('loginMessage', 'Please Log In first.');
    return res.redirect('login');
}

module.exports = { isAuthenticated };