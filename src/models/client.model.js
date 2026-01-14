import mongoose, { Schema } from "mongoose";

const clientSchema = new Schema({
  fullname: {
    type: String,
    required: true
  },

  companyName: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true
  },

  phone: {
    type: String,
    required: true
  },

  address: String,

  notes: String,

  leadStatus: {
    type: String,
    enum: ["New", "In Progress", "Converted", "Lost"],
    default: "New"
  },

  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  isDeleted: {
  type: Boolean,
  default: false
},

deletedAt: {
  type: Date,
  default: null
}


}, { timestamps: true });


export const Client = mongoose.model("Client", clientSchema)