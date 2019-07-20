var express     = require('express');
var router      = express.Router({mergeParams: true});  
var Comment     = require('../models/comments');
var Site        = require('../models/site');
var middleware  =require('../middleware');

//NEW
router.get("/new",middleware.isLoggedIn, function (req,res) {
    Site.findById(req.params.id,function (err,site) {
        if(err){
            console.log(err);
            req.flash("error","Something went worng");
            res.redirect("/spots");
        }
        else
            res.render("comments/new.ejs",{site: site});
    })
})

//CREATE
router.post("/",middleware.isLoggedIn, function (req,res) {
    Site.findById(req.params.id,function (err,site) {
        if(err){
            console.log(err);
            req.flash("error","Something went worng");
            res.redirect("/spots");
        }
        else
        {
            //create new comment
            Comment.create(req.body.comment,function (err,comment) {
                if(err){
                    console.log(err);
                    req.flash("error","Something went worng");
                    res.redirect("/spots");
                }
                else{
                    //Adding user to the comment and saving
                    comment.author.id= req.user._id;
                    comment.author.username= req.user.username
                    comment.save()
                    //adding comment to the spot and saving
                    site.comments.push(comment);
                    site.save();
                    req.flash("success","Comment added successfully!");
                    res.redirect("/spots/"+ site._id );
                }
            })
        }
    })
})

//EDIT
router.get("/:idc/edit",middleware.commentAuthorization,function (req,res) {
    Site.findById(req.params.id,function (err,site) {
        if (err) {
            console.log(err);
            req.flash("error","Something went worng");
            res.redirect("/spots");
        } else {
            Comment.findById(req.params.idc,function (err,comment) {
                if (err) {
                    console.log(err);
                    req.flash("error","Something went worng");
                    res.redirect("/spots");
                } else {
                    req.flash("success","Comment edited successfully!");
                }
            })
        }
    })
})

//UPDATE
router.put("/:idc",middleware.commentAuthorization,function (req,res) {
    Comment.findByIdAndUpdate(req.params.idc,req.body.comment,function (err,comment) {
        if (err) {
            console.log(err);
            req.flash("error","Something went worng");
            res.redirect("/spots");
        } else if (!comment) {
            return res.status(400).send("Item not found.")
        } else {
            res.render('comments/edit',{comment: comment,site: site});
            res.redirect("/spots/"+req.params.id);
        }
    })
})

//DELETE
router.delete("/:idc",middleware.commentAuthorization,function (req,res) {
    Comment.findByIdAndDelete(req.params.idc,function (err,comment) {
        if (err) {
            req.flash("error","Something went wrong");
            res.redirect("/spots");z
            console.log(err);
        } else {
            req.flash("success","Comment deleted successfully!");
            res.redirect("/spots/"+req.params.id);
        }
    })
})


module.exports= router;