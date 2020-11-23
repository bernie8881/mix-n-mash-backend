const express = require('express');
let router = express.Router();
const UserModel = require('../models/User');
const bcrypt = require("bcryptjs");
const passport = require("passport");

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

router.get("/user", (req, res) => {
    if(req.user){
        res.send(req.user);
    } else {
        res.status(404).send("No user found");
    }
});

module.exports = router;