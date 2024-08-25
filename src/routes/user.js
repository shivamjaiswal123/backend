const { Router } = require("express");
const { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails} = require("../controllers/user.js");
const { upload } = require("../middlewares/multer_middleware.js");
const { verifyJWT } = require("../middlewares/auth_middleware.js");

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser);

router.route("/login").post(loginUser);

router.route("/logout").post(verifyJWT, logoutUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("change-password").post(verifyJWT, changeCurrentPassword)

router.route("current-user").post(verifyJWT, getCurrentUser)

router.route("update-account").post(verifyJWT, updateAccountDetails)

module.exports = router;