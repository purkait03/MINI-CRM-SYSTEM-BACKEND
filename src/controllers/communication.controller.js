import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponce.js";
import { Client } from "../models/client.model.js"
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Communication } from "../models/communication.model.js";


const createComm = asyncHandler(async (req, res)=>{
    const {clientId, type, message} = req.body

    if (
        [clientId, type, message].some((field)=> field.trim() === "")
    ) {
        throw new ApiError(400, "All required fields must be provided")
    }

    if (
        !["Email", "SMS"].includes(type)
    ) {
        throw new ApiError(400, "Invalid communication type")
    }

    const client = await Client.findOne(
        {
            _id: clientId,
            isDeleted : false
        }
    )

    if (!client) {
        throw new ApiError(404, "Client not found")
    }

    const communication = await Communication.create({
        clientId,
        type,
        message,
        sentBy: req.user._id,
        sentAt: new Date()
    })

    return res
    .status(200)
    .json(
        new ApiResponse(200, communication, "Communication logged successfully")
    )
})

const getCommByClientId = asyncHandler(async (req, res)=>{
    const {clientId} = req.params

    const client = await Client.findById(clientId)
    if (!client) {
        throw new ApiError(404, "Client not found")
    }

    if (!(req.user._id.toString() === client.assignedTo?.toString() || req.user.role === "admin")) {
        throw new ApiError(403, "Access denied")
    }

    const communications = await Communication.find({
        clientId
    }).sort({sentAt: -1}).populate("sentBy", "fullname email role avatar")

    return res
    .status(200)
    .json(
        new ApiResponse(200, communications, "All communication details are fetched successfully")
    )
})

const getCommById = asyncHandler(async (req, res)=>{
    const {commId} = req.params

    const communication = await Communication.findById(commId).populate("clientId").populate("sentBy", "fullname email role avatar")

    if (!communication) {
        throw new ApiError(404, "Communication details not found")
    }

    if (!(req.user._id.toString() === communication.clientId?.assignedTo?.toString() || req.user.role === "admin")) {
        throw new ApiError(403, "Access denied")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, communication, "Communication fetched successfully")
    )
})

export{
    createComm,
    getCommByClientId,
    getCommById
}