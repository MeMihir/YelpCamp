var express = require('express');
var router  = express.Router();  
var User    = require('../models/user');
var passport= require('passport');

//ADMIN REGISTRATION
router.get("/register/admin", function (req,res) {
    res.render("auth/adminRegistration");
})

//RESITER ROUTES
router.get("/register",function (req,res) {
    res.render("auth/register");

})

router.post("/register", function (req,res) {
    newUser={
        username    : req.body.username,
        isAdmin     : admin(req.body.key,req,res),
        email       : req.body.email,
        firstName   : req.body.firstName,
        lastName    : req.body.lastName,
        profilePic  : req.body.profilePic
    }
    User.register(new User(newUser), req.body.password, function (err, user) {
        if(err){
            console.log(err);
            req.flash("error",err.message);
            res.redirect("/register");
        }
        else{
            passport.authenticate("local")(req,res, function () {
                req.flash("success","Signed in successfully! Welcome "+user.username);
                res.redirect("/spots");
            })
        }
    })
})


//LOGIN ROUTES
router.get("/login",function (req,res) {
    req.flash("error","You need to log in");
    res.render("auth/login");
})

router.post("/login",passport.authenticate("local",
{
    // successFlash    : req.flash("success","Logged in successfully!"),
    successRedirect : "/spots",
    // failureFlash    : req.flash("error","Your Userid or password is incorrect");
    failureRedirect : "/login"
}), function (req,res) {})


//LOGOUT ROUTE
router.get("/logout", function (req,res) {
    req.logout();
    req.flash("success","Logged out successfully");
    res.redirect("/spots");
})

function admin(key,req,res)
{
    if(key==="1MB@tm@n")
        return true;
    else{
        return false;
    }
}

module.exports= router;