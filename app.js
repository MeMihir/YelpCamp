var express         = require('express'),
    app             = express(),
    bodyParser      = require('body-parser'),
    mongoose        = require('mongoose'),
    passport        = require('passport'),
    localStratergy  = require('passport-local'),
    Site            = require('./models/site'),
    SeedDB          = require('./seeds'),
    User            = require('./models/user'),
    Comment         = require('./models/comments'),
    methodOverride  = require('method-override'),
    flash           = require('connect-flash')
app.locals.moment   = require('moment'),
    require('dotenv').config();

var siteRoutes      = require('./routes/sites'),
    commentsRoutes  = require('./routes/comments'),
    authRoutes      = require('./routes/auth'),
    indexRoutes     = require('./routes/index'),
    usersRoutes     = require('./routes/users');

mongoose.connect(process.env.DB_URL,{useNewUrlParser:true});
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(methodOverride("_method"));
app.use(flash());
// SeedDB(); //SEEDS THE DB

//PASSPORT CONFIG
app.use(require("express-session")({
    secret : process.env.SECRET,
    resave: false, 
    saveUninitialized : false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(function (req,res,next) {
    res.locals.currUser = req.user;
    res.locals.error    = req.flash("error");
    res.locals.success  = req.flash("success");
    next();
})
passport.use(new localStratergy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//ROUTES CONFIG
app.use("/spots",siteRoutes);
app.use("/spots/:id/comments",commentsRoutes);
app.use(authRoutes);
app.use(indexRoutes);
app.use(usersRoutes);

app.listen(3000,function () {
    console.log("YelpCamp Server Initiated!!!");
})
