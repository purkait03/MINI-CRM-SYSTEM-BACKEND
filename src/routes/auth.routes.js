import { Router } from "express";
import { 
    loginUser, 
    logoutUser, 
    registerUser, 
    refreshAccessToken, 
    changeCurrentPassword,
    registerAdmin
} from "../controllers/auth.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {roleMiddleware} from "../middlewares/role.middleware.js"

const router = Router()

router.route("/register-admin").post(registerAdmin)

router.route("/login").post(loginUser)

// Secured routes
router.route("/register").post(verifyJWT, roleMiddleware("admin"), upload.single("avatar"), registerUser)
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)


export default router