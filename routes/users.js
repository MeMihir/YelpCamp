var express     = require('express');
var router      = express.Router();
var User        = require('../models/user');
var Site        = require('../models/site');

//SHOW
router.get("/user/:id",function (req,res) {
    User.findById(req.params.id).populate('sites').exec(function (err, user) {
        if(err){
            console.log(err);
            req.flash("error","Something went wrong");
            res.redirect("back");
        }
        else{
            console.log
            res.render("users/show",{user: user});
        }
    })
})

//EDIT
router.get("/user/:id/edit",function (req,res){
    User.findById(req.params.id,function (err,user) {
        if(err){
            console.log(err);
            req.flash("error","Something went wrong");
            res.redirect("/spots");
        }
        else{
            res.render("/users/edit",{user: user});
        }
    })
})

module.exports= router;