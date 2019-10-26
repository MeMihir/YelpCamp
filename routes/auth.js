var express = require('express');
var router  = express.Router();  
var User    = require('../models/user');
var Token   = require('../models/token');
var passport= require('passport');
var nodemailer = require('nodemailer');
require('dotenv');

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
            // passport.authenticate("local")(req,res, function () {
            //     req.flash("success","Signed in successfully! Welcome "+user.username);
            //     res.redirect("/spots");
            // })

            var token ={
                userId  : user._id,
            }
            Token.create(token, (err, token) => {
                if (err) {
                    console.log(err);
                    req.flash("error",err.message);
                    res.redirect("/register");
                } else {
                    var transporter = nodemailer.createTransport({
                        service : 'Gmail',
                        auth    : {
                            user    : process.env.GMAIL_ID,
                            pass    : process.env.GMAIL_PASS
                        }            
                    });

                    var mailOptions = { 
                        from: 'no-reply@yelpcamp.com', 
                        to: user.email, subject: 'Account Verification Token', 
                        text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation\/' + token._id + '.\n' 
                    };
                    transporter.sendMail(mailOptions, (err) => {
                        if(err){
                            console.log(err);
                            req.flash("error",err.message);
                            res.redirect("/register");
                        }
                        else{
                            req.flash("success","A verification link has been sent to your email");
                            res.redirect("/register");
                        }
                    })
                }
            })
        }
    })
})

//EMAIL VERFICATION
router.get('/confirmation/:code', (req,res) => {
    Token.findById(req.params.code, (err, token) => {
        if(err){
            console.log(err);
            req.flash("error",err.message);
            res.redirect("/register");
        }
        else{
            User.findById(token.userId, (err, user) => {
                if(err){
                    console.log(err);
                    req.flash("error",err.message);
                    res.redirect("/register");
                }
                else{
                    user.isVerified = true;
                    user.save( (err) => {
                        if(err){
                            console.log(err);
                            req.flash("error",err.message);
                            res.redirect("/register");
                        }
                        else{
                            req.flash("success",'Your Account has been verified');
                            res.redirect("/login");
                        }
                    });
                }
            })
        }
    })
})

//LOGIN ROUTES
router.get("/login",function (req,res) {
    req.flash("error","You need to log in");
    res.render("auth/login");
})

router.post("/login", passport.authenticate("local",
{
    // successFlash    : req.flash("success","Logged in successfully!"),
    successRedirect : "/spots",
    // failureFlash    : req.flash("error","Your Userid or password is incorrect");
    failureRedirect : "/login"
}))


//LOGOUT ROUTE
router.get("/logout", function (req,res) {
    req.logout();
    req.flash("success","Logged out successfully");
    res.redirect("/spots");
})

function admin(key,req,res)
{
    if(key===process.env.ADMIN_KEY)
        return true;
    else{
        return false;
    }
}

check_verification = (user) => {
    User.findOne({"username" : req.body.username}, (err, user) => {
        if(user.isVerified === false){
            req.flash("error","Your account is not yet verified");
            res.redirect("/spots");
        }
    })
}

module.exports= router;