import { Router } from "express";
import {
    createClient,
    getAllClients,
    updateClientDetails,
    getClientById,
    getAssignedClients,
    assignClient,
    deleteClient,
    restoreClient,
    updateLeadStatus
} from "../controllers/client.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {roleMiddleware} from "../middlewares/role.middleware.js"

const router = Router()

router.route("/get-client/:clientId").get(verifyJWT, getClientById)
router.route("/assigned").get(verifyJWT, getAssignedClients)


router.route("/create-client").post(verifyJWT, roleMiddleware("admin", "sales"), createClient)
router.route("/get-all-clients").get(verifyJWT, roleMiddleware("admin"), getAllClients)
router.route("/update-client-details/:clientId").patch(verifyJWT, roleMiddleware("admin", "sales"), updateClientDetails)
router.route("/assign/:clientId").patch(verifyJWT, roleMiddleware("admin"), assignClient)
router.route("/delete/:clientId").delete(verifyJWT, deleteClient)
router.route("/restore/:clientId").patch(verifyJWT, roleMiddleware("admin"), restoreClient)
router.route("/update-lead/:clientId").patch(verifyJWT, updateLeadStatus)
export default router