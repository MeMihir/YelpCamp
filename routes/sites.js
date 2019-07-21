var express         = require('express');
var router          = express.Router({mergeParams: true});  
var Site            = require('../models/site');
var User            = require('../models/user');
var middleware      = require('../middleware');
var multer          = require('multer');
var cloudinary      = require('cloudinary');

//UPLOAD CONFIG
var storage         = multer.diskStorage({
    filename    : (req, file, callback) => {
        callback(null, Date.now() + file.originalname);
    }
});
var imageFilter     = (req, file, callback) => {
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return callback( new Error('Only image file are allowed'), false);
    }
    callback(null, true);
};
var upload          = multer({ storage : storage, fileFilter : imageFilter});

//CLOUDINARY CONFIG
cloudinary.config({
    cloud_name  : 'mi7cloud',
    api_key     : process.env.CLOUDINARY_API_KEY,
    api_secret  : process.env.CLOUDINARY_SECRET
})

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
router.post("/",middleware.isLoggedIn, upload.single('image'),function (req,res) {
    cloudinary.v2.uploader.upload(req.file.path , (err,result) => {

        if (err) {
            req.flash('error',err.message);
            res.redirect('back');
        }

        var author={
            id: req.user._id,
            username: req.user.username
        }

        var newSite={
            name: req.body.name,
            info: req.body.info,
            image : result.secure_url,
            imageID : result.public_id,
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