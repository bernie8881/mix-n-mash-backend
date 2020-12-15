const express = require('express');
let router = express.Router();
const UserModel = require('../models/User');
const ForgotPasswordModel = require('../models/ForgotPassword');
const bcrypt = require("bcryptjs");
const passport = require("passport");

const sgMail = require("@sendgrid/mail");
sgMail.setApiKey("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");

router.post("/forgotPassword", (req, res, next) => {
    const email = req.body.email;

    // Try to find a valid email
    UserModel.findOne({email: email}, async (err, result)=>{
        if (err) throw err;

        // We found a valid email
        if (result){
            // Delete any current forgotPassword requests for this user
            await ForgotPasswordModel.deleteMany({email: email});

            // Create a new forgotPassword request for this user
            const forgotpwd = new ForgotPasswordModel({email: email});
            await forgotpwd.save();

            // Extract the id of the new request and use it as the temp code
            tempCode = forgotpwd._id;

            const msg = {
                to: email,
                from: 'mixnmash.noreply@gmail.com',
                subject: 'Forgotten Mix N\' Mash Password',
                text: 'Here is your temporary code: ' + tempCode + "\n\n This code will expire in 20 minutes.",
            }
            sgMail.send(msg);
        }
        res.send("success");
    })
});

router.post("/verifyCode",(req, res, next) => {
    const tempCode = req.body.tempCode;

    ForgotPasswordModel.findById(tempCode, async (err, result)=>{
        if (err){
            if(err.name === "CastError"){
                // id was invalid
                res.status(401).send("Invalid")
                return;
            } else {
                throw err;
            }
        }

        // We found a result and it is the correct email
        if (result && result.email === req.body.email){
            // Check if the request is still valid
            const expirationTime = new Date(result.timeCreated).getTime() + 1000 * 60 * 20;

            if(Date.now() < expirationTime){
                // Hash the new password
                const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);

                // Update the user model with the new password
                UserModel.findOneAndUpdate({email: req.body.email}, {hashedPassword: hashedPassword}, (err,result)=>{
                    if(err) throw err

                    if(result){
                        res.send("success");
                    } else{
                        res.status(404).send("No User");
                    }
                });
            } else {
                res.status(401).send("Code Expired")
            }
        } else{
            res.status(401).send("Invalid");
        }
    });
});

router.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if(err){
            res.status(500).send("Error during authentication");
        }

        if(!user){
            res.status(404).send("No user");
        } else {
            // User exists and is valid
            req.logIn(user, (err) => {
                if(err){
                    res.status(500).send("Error creating user session");
                }
                res.send(user);
            })
        }
    })(req, res, next);
});

router.get("/logout", async (req, res) => {
    req.logOut();
    res.send("Success");
});

router.post("/signup", async (req, res) => {
    UserModel.find({$or: [{username: req.body.username}, {email: req.body.email}]}, async (err, result) => {
        if(err){
            res.status(500).send("Server error");
        }

        const response = {
            usernameExists: false,
            emailExists: false,
            userCreated: false
        }

        if(result.length !== 0){
            // There is a user with this email, username, or both
            for(let user of result){
                if(user.username === req.body.username){
                    response.usernameExists = true;
                }
                if(user.email === req.body.email){
                    response.emailExists = true;
                }
            }

            res.json(response);
        } else {
            // There is no current user with this email or username, so create one
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            
            const user = {
                username: req.body.username,
                email: req.body.email,
                hashedPassword: hashedPassword,
                bio: "",
                numFollowers: 0,
                following: [],
                mashmates: [],
                mixtapes: [],
                likedMixtapes: [],
                dislikedMixtapes: [],
                genrePreferences: [
                    {genre: "Alternative Rock", val : 0.5},
                    {genre: "Ambient", val: 0.5},
                    {genre: "Blues", val: 0.5},
                    {genre: "Chill", val: 0.5},
                    {genre: "Classical", val: 0.5},
                    {genre: "Country", val: 0.5},
                    {genre: "Drum and Bass", val: 0.5},
                    {genre: "Dubstep", val: 0.5},
                    {genre: "Electronic", val: 0.5},
                    {genre: "Folk", val: 0.5},
                    {genre: "Hip Hop", val: 0.5},
                    {genre: "House", val: 0.5},
                    {genre: "Indie", val: 0.5},
                    {genre: "Instrumental", val: 0.5},
                    {genre: "Jazz", val: 0.5},
                    {genre: "LoFi", val: 0.5},
                    {genre: "Metal", val: 0.5},
                    {genre: "Musical Theater", val: 0.5},
                    {genre: "New Wave", val: 0.5},
                    {genre: "Other", val: 0.5},
                    {genre: "Pop", val: 0.5},
                    {genre: "Reggae", val: 0.5},
                    {genre: "Rock", val: 0.5},
                    {genre: "Ska", val: 0.5},
                    {genre: "Soundtrack", val: 0.5},
                    {genre: "Swing", val: 0.5}
                ],
                receivedMashmateRequests: [],
                active: true,
            }

            const newUser = new UserModel(user);
            await newUser.save();

            response.userCreated = true;

            res.send(response);
        }
    });
});

router.post("/changepassword", async (req, res) => {
    UserModel.findOne({$or: [{email: req.body.username}, {username: req.body.username}] }, 
        (err, user) => {
            if(err) throw err;

            if(!user){
                res.status(404).send("No user found");
            } else {
                bcrypt.compare(req.body.password, user.hashedPassword, async (err, result) => {
                    if(err) throw err;
                    if(result === true){
                        // User exists and password matches - change password
                        const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
                        user.update({hashedPassword: hashedPassword}, (err, result) => {
                            if(err) throw err;

                            // If no error, return success
                            res.send("Success");
                        })
                    } else {
                        // Password Mismatch
                        res.status(403).send("Password Incorrect");
                    }
                });
            }
        });
});

router.get("/user", (req, res) => {
    if(req.user){
        res.send(req.user);
    } else {
        res.status(404).send("No user found");
    }
});

module.exports = router;