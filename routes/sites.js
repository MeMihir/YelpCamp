var express         = require('express');
var router          = express.Router({mergeParams: true});  
var Site            = require('../models/site');
var User            = require('../models/user');
var middleware      = require('../middleware');

//INDEX
router.get("/",function (req,res) {
    if(req.query.query){
        const regex= new RegExp(middleware.escapeRegex(req.query.query),"gi");
        Site.find({name : regex},function (err,sites) {
            if(err)
            {
                req.flash("error","Something went wrong");
                console.log(err);
            }
            else{
                if(sites.length===0){
                    req.flash("error","No such Sites exist");
                    res.redirect("back");
                }
                else
                    res.render("sites/index",{sites:sites});
            }
        })
    }
    else{
        Site.find({},function (err,sites) {
            if(err)
            {
                req.flash("error","Something went wrong");
                console.log(err);
            }
            else
                res.render("sites/index",{sites:sites});
        })  
    }
})

//CREATE
router.post("/",middleware.isLoggedIn, function (req,res) {
    var author={
        id: req.user._id,
        username: req.user.username
    }
    var newSite={
        name: req.body.name,
        image: req.body.image,
        info: req.body.info,
        uploader: author
    }

    Site.create(newSite,function (err,site) {
        if(err)
        {
            req.flash("error","Something went wrong!");
            res.redirect("/spots");
            console.log(err);
        }
        else{
            User.findById(newSite.uploader.id,function (err,user) {
                user.sites.push(site);
                user.save();
                req.flash("success","Site created Sucessfully!");
                res.redirect("/");
            })
        }
    })
})

// NEW
router.get("/new",middleware.isLoggedIn,function (req,res) {
    res.render("sites/new");
})

//SHOW
router.get("/:id",function (req,res) {
    Site.findById(req.params.id).populate("comments").exec(function (err, site) {
        if(err){
            console.log(err);
            req.flash("error","Something went wrong");
            res.redirect("/spots");
        }
        else{
            res.render("sites/show",{site: site});
        }
    })
})

//EDIT
router.get("/:id/edit",middleware.siteAuthorization,function (req,res) {
    Site.findById(req.params.id,function (err,site) {
        if(err){
            console.log(err);
            req.flash("error","Something went wrong");
            res.redirect("/spots");
        }
        else{
            res.render("sites/edit",{site: site});
        }
    })
})
//UPDATE
router.put("/:id",middleware.siteAuthorization,function (req,res) {
    Site.findByIdAndUpdate(req.params.id,req.body,function (err,site) {
        if(err){
            console.log(err);
            req.flash("error","Something went wrong!");
            res.redirect("/spots");
        }
        else if (!site) {
            return res.status(400).send("Item not found.")
        }
        else {
            req.flash("success","Site updated Sucessfully!");
            res.redirect("/spots/"+ site._id);
        }
    })
})

//DELETE
router.delete("/:id",middleware.siteAuthorization,function (req,res) {
    Site.findByIdAndDelete(req.params.id,function (err,site) {
        if(err){
            console.log(err);
            req.flash("error","Something went wrong");
            res.redirect("/spots");
        }
        else{
            req.flash("success","Site deleted successfully!");
            res.redirect("/spots");
        }
    })
})


module.exports= router;