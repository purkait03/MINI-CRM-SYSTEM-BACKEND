import { Router } from "express";
import { 
    createComm,
    getCommByClientId,
    getCommById
} from "../controllers/communication.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {roleMiddleware} from "../middlewares/role.middleware.js"

const router = Router()


router.route("/create").post(verifyJWT, createComm)
router.route("/client/:clientId").get(verifyJWT, getCommByClientId)
router.route("/:commId").get(verifyJWT, getCommById)


export default router