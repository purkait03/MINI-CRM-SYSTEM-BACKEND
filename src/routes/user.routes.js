import { Router } from "express";
import { 
    getCurrentUser, 
    updateAdminAccountDetails, 
    updateAdminAvatar,
    updateUserDetails,
    getAllUsers,
    getAUser,
    toggleUserStatus,
    updateUserRole
} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {roleMiddleware} from "../middlewares/role.middleware.js"


const router = Router()


router.route("/current-user").get(verifyJWT, getCurrentUser)

//secure admin routes
router.route("/update-admin-account").patch(verifyJWT, roleMiddleware("admin"), updateAdminAccountDetails)
router.route("/update-avatar").patch(verifyJWT, roleMiddleware("admin"), upload.single("avatar"), updateAdminAvatar)
router.route("/update-user-details/:userId").patch(verifyJWT, roleMiddleware("admin"), updateUserDetails)
router.route("/get-all-users").get(verifyJWT, roleMiddleware("admin"), getAllUsers)
router.route("/get-single-user/:userId").get(verifyJWT, roleMiddleware("admin"), getAUser)
router.route("/status/:userId").patch(verifyJWT, roleMiddleware("admin"), toggleUserStatus)
router.route("/role/:userId").patch(verifyJWT, roleMiddleware("admin"), updateUserRole)

export default router