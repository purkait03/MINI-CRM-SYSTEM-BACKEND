import mongoose, {Schema} from "mongoose";

const taskSchema = new Schema({
  title: { type: String, required: true },

  description: String,

  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: true
  },

  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  dueDate: Date,

  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium"
  },

  status: {
    type: String,
    enum: ["Pending", "Completed"],
    default: "Pending"
  }
  
}, { timestamps: true });


export const Task = mongoose.model("Task", taskSchema)