'use strict';

var LocalStrategy = require('passport-local').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var User = require('../models/users');
var configAuth = require('./auth');

module.exports = function (passport) {
	passport.serializeUser(function (user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function (id, done) {
		User.findById(id, function (err, user) {
			done(err, user);
		});
	});
    passport.use('twitter', new TwitterStrategy({

        consumerKey     : configAuth.twitterAuth.clientID,
        consumerSecret  : configAuth.twitterAuth.clientSecret,
        callbackURL     : configAuth.twitterAuth.callbackURL

    },
    function(token, tokenSecret, profile, done) {

        // make the code asynchronous
    // User.findOne won't fire until we have all our data back from Twitter
        process.nextTick(function() {
            console.log("TWITTER PROFILE");
            console.log(profile);
            User.findOne({ 'twitter.id' : profile.id }, function(err, user) {

                // if there is an error, stop everything and return that
                // ie an error connecting to the database
                if (err)
                    return done(err);

                // if the user is found then log them in
                if (user) {
                    return done(null, user); // user found, return that user
                } else {
                    // if there is no user, create them
                    var newUser = new User();
                    newUser.local.username = "(t)"+profile.username;
                    newUser.local.password = '';
                    newUser.local.email = '';
                    newUser.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                    /*var newUser                 = new User();

                    // set all of the user data that we need
                    newUser.twitter.id          = profile.id;
                    newUser.twitter.token       = token;
                    newUser.twitter.username    = profile.username;
                    newUser.twitter.displayName = profile.displayName;

                    // save our user into the database
                    newUser.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });*/
                }
            });

    });

    }));
    
	passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) {
        console.log("user creation started");
        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {
        var regex = /\(t\)/;
        if(regex.test(username)||password==''){
            return done(null, false, { message: 'That username is already taken.' });
        }
        else{
            User.findOne({ 'local.username' :  username }, function(err, user) {
            // if there are any errors, return the error
            if (err)
                return done(err);

            // check to see if theres already a user with that email
            if (user) {
                return done(null, false, { message: 'That username is already taken.' });
            } else {

                // if there is no user with that email
                // create the user
                var newUser = new User();

                // set the user's local credentials
                newUser.local.username = username;
                newUser.local.password = password;
                newUser.local.email = '';
                console.log("saved username: "+username);
                console.log("saved password: "+password);
                // save the user
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    User.find({},function(err,data){
                        if(err)throw err;
                        console.log(data);
                    });
                    return done(null, newUser);
                });
            }

        });   
        }
        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists

        });

    }));
    
    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) { // callback with email and password from our form
        var regex = /\(t\)/;
        if(regex.test(username)||password==''){
            return done(null, false, { message: 'That username is already taken.' });
        }
        else{
            User.findOne({ 'local.username' :  username }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (!user)
                return done(null, false, { message: 'That username is already taken.' }); // req.flash is the way to set flashdata using connect-flash

            // if the user is found but the password is wrong
            if (password != user.local.password)
                return done(null, false, { message: 'That username is already taken.' }); // create the loginMessage and save it to session as flashdata

            // all is well, return successful user
            return done(null, user);
        });
        }
        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists

    }));
};
