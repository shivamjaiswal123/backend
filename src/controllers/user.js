const ApiError = require("../utils/ApiError.js");
const { User } = require("../models/user.js");
const { uploadOnCloudinary } = require("../utils/cloudinary.js");
const { ApiResponse } = require("../utils/ApiResponse.js");
const jwt = require('jsonwebtoken');


const generateAccessAndRefreshToken = async ( userId ) => {
    try {
        const user = await User.findById( userId );

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeState: false })

        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating the token");
    }
}


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
    // const coverImageLocalPath = req.files.coverImage[0].path                  //if any field is empty then it throw error
    
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

    //remove password and refresh token from userCreated object
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


const loginUser = async (req, res) => {
    // TODOs:
    // validate email and password
    // check user exist or not
    // generate a token
    // send cookies
    
    const { email, username, password } = req.body;

    if( !(username || email) ){
        throw new ApiError(400, "Username or Email required");
    }

    const user = await User.findOne({
        $or: [ { username } , { email }]
    });

    if(!user){
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    
    if(!isPasswordValid){
        throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("--password --refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json( new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in succussfully"
            )
        )
}


const logoutUser = async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id, 
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json( new ApiResponse(
            200, 
            {},
            "User logged out succussfully"
            )
        )

}


const refreshAccessToken = async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken;

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unathorized Access")
    }

    const decodedToken = jwt.verify(incomingRefreshToken, REFRESH_TOKEN_SECRET);

    const user = await User.findById(decodedToken._id);
    if(!user){
        throw new ApiError(401, "Invalid refresh token");
    }

    if(incomingRefreshToken != user._id){
        throw new ApiError(401, "Refresh token is expired or used")
    }

    const options = {
        httpOnly: true,
        secure: true
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json( new ApiResponse(
            200, 
            {
                accessToken, refreshToken
            },
            "Access token refreshed"
            )
        )

}

module.exports = { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}