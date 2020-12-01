const express = require('express');
let router = express.Router();
const UserModel = require('../models/User');
const ForgotPasswordModel = require('../models/ForgotPassword');
const bcrypt = require("bcryptjs");
const passport = require("passport");

const sgMail = require("@sendgrid/mail");
sgMail.setApiKey("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");

// sgMail
//   .send(msg)
//   .then(() => {
//     console.log('Email sent')
//   })
//   .catch((error) => {
//     console.error(error)
// });

router.post("/forgotPassword", (req, res, next) => {
    const email = req.body.email;
    UserModel.findOne({email: email},async(err, result)=>{
        if (err){
            throw err;
        }
        if (result){

            const forgotpwd = new ForgotPasswordModel({email: email});
            await forgotpwd.save();

            tempCode = forgotpwd._id;

            const msg = {
                to: email, // Change to your recipient
                from: 'mixnmash.noreply@gmail.com', // Change to your verified sender
                subject: 'Forgotten Mix N\' Mash Password',
                text: 'Here is your temporary code: '+tempCode,
            }
            sgMail.send(msg);
        }
        res.send("success");
    })
});

router.post("/verifyCode",(req, res, next) => {
    const tempCode = req.body.tempCode;
    console.log(tempCode);
    ForgotPasswordModel.findById(tempCode,async(err, result)=>{
        if (err){
            throw err;
        }
        if (result){
            const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
            UserModel.findOneAndUpdate({email: req.body.email}, {hashedPassword: hashedPassword}, (err,result)=>{
                if(err){
                    throw err
                }
                if(result){
                    res.send("success");
                }
                else{
                    res.status(404).send("failure");
                }
            });
        }
        else{
            res.status(401).send("failure");
        }
    });
});

router.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if(err){
            res.status(500).send("Error during authentication");
        }

        if(!user){
            console.log(err);
            console.log(info);
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
                genrePreferences: [],
                sentMashmateRequests: [],
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