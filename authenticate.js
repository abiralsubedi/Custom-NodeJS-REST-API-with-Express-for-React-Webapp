var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var Users = require('./models/users');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');
var FacebookTokenStrategy = require('passport-facebook-token');

var config = require('./config');

exports.local = passport.use(new LocalStrategy(Users.authenticate()));

passport.serializeUser(Users.serializeUser());
passport.deserializeUser(Users.deserializeUser());

//Creating a token
exports.getToken = function(user) {
    return jwt.sign(user, config.secretKey, {expiresIn: 3600})
}

//Extracting a token
var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

// Verifying a token
exports.jwtPassport = passport.use(new JwtStrategy(opts, 
    (jwt_payload, done) => {
        console.log("JWT payload: ", jwt_payload);
        Users.findOne({_id: jwt_payload._id}, (err,user) => {
            if (err) {
                return done(err, false)
            }
            else if (user) {
                return done(null, user)
            }
            else {
                return done(null, false);
            }
        })
    }))


//Creating a function to verify logged in user using Passport-Jwt
exports.verifyUser = passport.authenticate('jwt', {session: false});

exports.verifyAdmin = (req,res,next) => {
    if (req.user.admin) {
        next()
    }
    else {
        err = new Error('You are not authorized to perform this operation')
        err.status = 403;
        return next(err)
    }
}

exports.facebookPassport = passport.use(new FacebookTokenStrategy({
    clientID: config.facebook.clientID,
    clientSecret: config.facebook.clientSecret
    }, (accessToken, refreshToken, profile, done) => {
        Users.findOne({facebookId: profile.id}, (err,user) => {
            if (err) {
                return done(err)
            }
            if (!err && user !== null) {
                return done(null, user)
            }
            else {
                user = new Users({username: profile.username})
                user.facebookId = profile.id;
                user.firstname = profile.name.givenName;
                user.lastname = profile.name.familyName;
                user.save((err,user) => {
                    if (err) {
                        return done(err, false)
                    }
                    else {
                        return done(null,user)
                    }
                })
            }
        })
    } 
));
