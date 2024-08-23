const jwt = require('jsonwebtoken');
const ApiError = require("../utils/ApiError.js");
const { User } = require("../models/user.js");

const verifyJWT = async (req, res, next) => {
    try {
        const token = req.cookies && req.cookies.accessToken ? req.cookies.accessToken :
        req.header("Authorization").replace("Bearer ", "");

        if(!token){
            throw new ApiError(401, "Unathorized requiest");
        }

        const decodedValue = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById( decodedValue._id).select( "--password --refreshToken" );

        if(!user){
            throw new ApiError(401, "Invalid Access Token");
        }

        req.user = user;
        next();

    } catch (error) {
        throw new ApiError(401, "Verification failed");
    }
}

module.exports = { verifyJWT }