import { Router } from "express";
import {
    createReminder
} from "../controllers/reminder.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {roleMiddleware} from "../middlewares/role.middleware.js"

const router = Router()



router.route("/create").post(verifyJWT, createReminder) // Secured route for Admin and assigned user


export default router