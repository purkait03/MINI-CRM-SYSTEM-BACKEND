import { Schema } from "mongoose";
import mongoose from "mongoose";

const reminder = new Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        Ref: "Client",
        require: true
    },

    channel: {
        type: String,
        enum: ["Email", "SMS"],
        require: true
    },

    subject: String,

    message: {
        type: String,
        require: true
    },

    remindAt:{
        type: Date,
        default: Date.now
    },

    status:{
        type: String,
        enum: ["PENDING", "SENT"],
        default: "PENDING"
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true
    }
})

export const Reminder = mongoose.model("Reminder", reminder)