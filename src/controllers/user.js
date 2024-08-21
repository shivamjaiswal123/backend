const ApiError = require("../utils/ApiError.js")
const { User } = require("../models/user.js");
const { uploadOnCloudinary } = require("../utils/cloudinary.js");
const { ApiResponse } = require("../utils/ApiResponse.js");

const registerUser = async (req, res) =>{
    //TODOs:
    // get user details
    // validation
    // check if user already exist
    // check for image and avatar. Upload to cloudinary
    // create user in db
    // check for user creation
    // return the reponse

    const { username, email, fullname, password } = req.body;

    if( [username, email, fullname, password ].some( (field) => field.trim() === "" ) ){
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({
        $or: [{ username } , { email }]
    });

    if(existingUser){
        throw new ApiError(409, "User already exist");
    }
    
    const avatarLocalPath = req.files.avatar[0].path
    // const coverImageLocalPath = req.files.coverImage[0].path                  //if coverimage is empty then it throw error
    
    //coverImagePath can be 0 or undefined(user may not give CIP) 
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400, "Avatar file is required")
    }

    const newUser = await User.create({
        username: username.toLowerCase(),
        email,
        fullname,
        avatar: avatar.url,
        coverImage: coverImage && coverImage.url ? coverImage.url : "",
        password
    });

    //remove password and refresh token when getting response
    const userCreated = await User.findById(newUser._id).select(
        "--password --refreshToken"
    );

    if(!userCreated){
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(200, userCreated, "User registered succussfully")
    )
}

module.exports = { registerUser }