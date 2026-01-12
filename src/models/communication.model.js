import mongoose, {Schema} from "mongoose";

const communicationSchema = new Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: true
  },

  type: {
    type: String,
    enum: ["Email", "SMS"],
    required: true
  },

  message: { type: String, required: true },
  
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  sentAt: {
    type: Date,
    default: Date.now
  }
});


export const Communication = mongoose.model("Communication", communicationSchema)