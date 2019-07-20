var middlewareObj={}
var Site    = require('../models/site');
var Comment = require('../models/comments');    

middlewareObj.isLoggedIn=function (req,res,next) {
    if(req.isAuthenticated()){
        return next();
    }
    else{
        req.flash("error","You need to log in first");
        res.redirect("/login");
    }
}

middlewareObj.siteAuthorization=function (req,res,next) {
    if (req.isAuthenticated()) {
        Site.findById(req.params.id,function (err,site) {
            if (err) {
                console.log(err);
            } else {
                if (site.uploader.id.equals(req.user._id) || req.user.isAdmin===true) {
                    next();
                } else {
                    req.flash("error","You are NOT AUTHORIZED to do that");
                    res.redirect("back");
                }
            }
        })
    } else {
        req.flash("error","You need to be log in first");
        res.redirect("/login");   
    }
}

middlewareObj.commentAuthorization=function (req,res,next) {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.idc,function (err,comment) {
            if (err) {
                console.log(err);
            } else {
                if (comment.author.id.equals(req.user._id) || req.user.isAdmin===true) {
                    next();
                } else {
                    req.flash("error","You are NOT AUTHORIZED to do that");
                    res.redirect("back");
                }
            }
        })
    } else {
        req.flash("error","You need to be log in first");
        res.redirect("/login");   
    }
}

middlewareObj.escapeRegex= function (text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

module.exports=middlewareObj;