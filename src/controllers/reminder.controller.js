import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponce";
import { Client } from "../models/client.model"
import { User } from "../models/user.model";
import { asyncHandler } from "../utils/asyncHandler";
import { Reminder } from "../models/reminder.model.js";


const createReminder = asyncHandler(async (req, res)=>{
    const {clientId, channel, subject, message, remindAt, status} = req.body

    if (
        [clientId, channel, message, remindAt].some((field)=> field.toString().trim() === "")
    ) {
        throw new ApiError(400, "All required fields must be provided")
    }

    if (status) {
        if (
            ["PENDING", "SENT"].includes(status)
        ) {
            throw new ApiError(400, "Invalid status")
        }
    }

    const client = await Client.findOne({
        _id: clientId,
        isDeleted: false
    })

    if (!client) {
        throw new ApiError(404, "Client not found")
    }

    if (!(req.user._id.toString() === client.assignedTo?.toString() || req.user.role === "admin")) {
        throw new ApiError(403, "Access denied")
    }

    const reminder = await Reminder.create({
        clientId,
        channel,
        message,
        remindAt,
        status
    })

    return res
    .status(200)
    .json(
        new ApiResponse(200, reminder, "Reminder created successfully")
    )
})



export{
    createReminder
}