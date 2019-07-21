var mongoose=require('mongoose');

var siteSchema=new mongoose.Schema({
    name: String,
    image: String,
    imageId : String,
    info: String,
    createdAt : { type: Date, default: Date.now},
    uploader: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments :[
        {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Comment"
        }
    ]
});

module.exports= mongoose.model("Site",siteSchema);