var mongoose    = require('mongoose');
 
const TokenSchema = new mongoose.Schema({
    userId  : { 
        type : mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    },
    createdAt   : {
        type    : Date,
        default : Date.now,
        expires : 3600 
    }
})

module.exports = mongoose.model("Token",TokenSchema);