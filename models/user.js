var mongoose    = require('mongoose');
var passportLocalMongoose   = require('passport-local-mongoose');

var UserSchema= new mongoose.Schema({
    username    : String,
    password    : String,
    firstName   : String,
    lastName    : String,
    email       : String,
    profilePic  : String,
    isAdmin     : {
        type : Boolean,
        default: false
    },
    sites       :[
        {
            type    : mongoose.Schema.Types.ObjectId,
            ref     : "Site"
        }
    ]
});

UserSchema.plugin(passportLocalMongoose);
module.exports= mongoose.model("User",UserSchema);