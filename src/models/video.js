const mongoose = require("mongoose");
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const videoSchema = mongoose.Schema({

    videoFile: {
        type: String,                 //cloudinary url
        requird: true
    },
    thumbnail: {
        type: String,                 //cloudinary url
        required: true
    },
    title: {
        type: String,
        required: true
    },
    
    description: {
        type: String,
        required: true
    },
    duration: {
        type: Number,                //cloudinary url
        required: true
    },
    views: {
        type: String,
        required: true
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, {timastamp: true})






const Video = mongoose.model("Video", videoSchema)

module.exports = { Video }