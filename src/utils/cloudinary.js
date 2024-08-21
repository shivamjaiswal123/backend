const cloudinary = require('cloudinary').v2;
const fs = require("fs");

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localPath) => {
    try {
        if(!localPath){
            console.error("Couldn't found the file path.")
            return null;
        }

        //upload the file
        const response = await cloudinary.uploader
        .upload(localPath, {resource_type: "auto"})

        console.log("File has been uploaded");
        fs.unlinkSync(localPath);
        return response;

    } catch (error) {
        console.error(error);
        fs.unlink(localPath)          // remove the locally saved temp file as upload got failed 
    }
}


module.exports = { uploadOnCloudinary }
