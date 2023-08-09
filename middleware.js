module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {/*isAuthenticated is a method built into passport which will authenticate the request, if the user is not authenticated then */
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'sorry you must be signed in to do this')// it will flash an error message
        return res.redirect('/login')//and will redirect user back to login
    }
    next()//else next() is called
}

module.exports.storeReturnTo = (req, res, next) => {//used to save the returnTo value from the session (req.session.returnTo) to res.locals:
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

