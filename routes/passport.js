var passport = require('passport')
  , GoogleStrategy = require('passport-google').Strategy
  , express = require('express')
  , router = express.Router();

passport.use(new GoogleStrategy({
        returnURL: 'http://localhost:1337/auth/google/return',
        realm: 'http://localhost:1337/'
    },
    function (identifier, profile, done) {
        //user is authenticated with google. let's limit this to just @realcrowd.com users.
        //TODO: make me configurable or something  
        var allowedDomain = "@realcrowd.com";

        var isRealCrowd = profile.emails && profile.emails.some(function (e, i, a) {
            //an email ends with the allowed domain
            return e.value && e.value.indexOf(allowedDomain, e.value.length - allowedDomain.length) !== -1;
        });

        console.log(profile);
        
        if (isRealCrowd) {
            //todo: store me somewhere for lookup in deserializeUser
            done(null, { id: identifier });
        } else {
            done("Not authorized", null);
        }
    }
    ));

// Redirect the user to Google for authentication.  When complete, Google
// will redirect the user back to the application at
//     /auth/google/return
router.get('/google', passport.authenticate('google'));

// Google will redirect the user to this URL after authentication.  Finish
// the process by verifying the assertion.  If valid, the user will be
// logged in.  Otherwise, authentication has failed.
router.get('/google/return', 
  passport.authenticate('google', {
        successRedirect: '/',
        failureRedirect: '/login'
    }));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    //todo: lookup user somewhere?
    done(null, { id: id });
});

module.exports = router;