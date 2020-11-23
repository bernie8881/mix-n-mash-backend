const UserModel = require("../models/User");
const bcrypt = require("bcryptjs");
const LocalStrategy = require("passport-local").Strategy;

module.exports = function(passport){

    passport.use(
        new LocalStrategy((username, password, done) => {
            UserModel.findOne({$or: [{email: username}, {username: username}] }, 
                (err, user) => {
                    if(err) throw err;

                    if(!user){
                        return done(null, false);
                    } else {
                        bcrypt.compare(password, user.hashedPassword, (err, result) => {
                            if(err) throw err;
                            if(result === true){
                                // User exists and password matches - return
                                return done(null, user);
                            } else {
                                return done(null, false);
                            }
                        });
                    }
                });
        })
    );

    // Creates cookie with userid
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    // Extract user from cookie
    passport.deserializeUser((id, done) => {
        UserModel.findById(id, (err, user) => {
            done(err, user);
        });
    });
}