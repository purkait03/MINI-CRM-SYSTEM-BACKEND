import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponce";
import { Client } from "../models/client.model"
import { User } from "../models/user.model";
import { asyncHandler } from "../utils/asyncHandler";
import mongoose from "mongoose";



const createClient = asyncHandler(async (req, res) => {
    const { fullname, companyName, email, phone, address, note, leadStatus, assignedTo } = req.body


    if (
        [fullname, companyName, email, phone, address, leadStatus].some((field) => field?.toString().trim() === "")
    ) {
        throw new ApiError(400, "All required fields must be provided")
    }

    const lead = ["New", "In Progress", "Converted", "Lost"]
    if (!lead.includes(leadStatus)) {
        throw new ApiError(400, "Invalid lead status")
    }

    const client = await Client.create({
        fullname,
        companyName,
        email,
        phone,
        address,
        note,
        leadStatus,
        assignedTo: assignedTo || null,
        createdBy: req.user._id
    })

    const createdClient = await Client.findById(client._id)
        .populate("createdBy", "-password -refreshToken")
        .populate("assignedTo", "-password -refreshToken")

    // const createdClient = await Client.aggregate([
    //     {
    //         $match: {
    //             _id: new mongoose.Types.ObjectId(client._id)
    //         }
    //     },
    //     {
    //         $lookup: {
    //             from: "users",
    //             localField: "createdBy",
    //             foreignField: "_id",
    //             as: "createdBy",
    //             pipeline: [
    //                 {
    //                     $project: {
    //                         fullname: 1,
    //                         email: 1,
    //                         avatar: 1,
    //                         role: 1
    //                     }
    //                 }
    //             ]
    //         }
    //     },
    //     {
    //         $lookup: {
    //             from: "users",
    //             localField: "assignedTo",
    //             foreignField: "_id",
    //             as: "assignedTo",
    //             pipeline: [
    //                 {
    //                     $project: {
    //                         fullname: 1,
    //                         email: 1,
    //                         avatar: 1,
    //                         role: 1
    //                     }
    //                 }
    //             ]
    //         }
    //     },
    //     {
    //         $unwind: {
    //             path: "$createdBy",
    //             preserveNullAndEmptyArrays: true
    //         }
    //     },
    //     {
    //         $unwind: {
    //             path: "$assignedTo",
    //             preserveNullAndEmptyArrays: true
    //         }
    //     }
    // ])

    return res
        .status(200)
        .json(
            new ApiResponse(200, createdClient, "The client is created successfully")
        )

})

const getAllClients = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1
    const limit = 20

    const skip = (page - 1) * limit

    // const clients = await Client.find()
    // .sort({ createdAt: -1 })
    // .skip(skip)
    // .limit(limit)
    // .populate("assignedTo", "fullname email role avatar")
    // .populate("createdBy", "fullname email role avatar")

    // const clients = await Client.aggregate([
    //     {
    //         $sort: { createdAt: -1 }
    //     },
    //     {
    //         $skip: skip
    //     },
    //     {
    //         $limit: limit
    //     },
    //     {
    //         $lookup: {
    //             from: "users",
    //             localField: "createdBy",
    //             foreignField: "_id",
    //             as: "createdBy",
    //             pipeline: [
    //                 {
    //                     $project: {
    //                         fullname: 1,
    //                         email: 1,
    //                         role: 1,
    //                         avatar: 1
    //                     }
    //                 }
    //             ]
    //         }
    //     },
    //     {
    //         $lookup: {
    //             from: "users",
    //             localField: "assignedTo",
    //             foreignField: "_id",
    //             as: "assignedTo",
    //             pipeline: [
    //                 {
    //                     $project: {
    //                         fullname: 1,
    //                         email: 1,
    //                         role: 1,
    //                         avatar: 1
    //                     }
    //                 }
    //             ]
    //         }
    //     },
    //     {
    //         $unwind: {
    //             path: "$createdBy",
    //             preserveNullAndEmptyArrays: true
    //         }
    //     },
    //     {
    //         $unwind: {
    //             path: "$assignedTo",
    //             preserveNullAndEmptyArrays: true
    //         }
    //     }
    // ])

    const result = await Client.aggregate([
        {
            $facet: {
                data: [
                    { $sort: { createdAt: -1 } },
                    { $skip: skip },
                    { $limit: limit },

                    {
                        $lookup: {
                            from: "users",
                            localField: "createdBy",
                            foreignField: "_id",
                            as: "createdBy",
                            pipeline: [
                                {
                                    $project: {
                                        fullname: 1,
                                        email: 1,
                                        role: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "assignedTo",
                            foreignField: "_id",
                            as: "assignedTo",
                            pipeline: [
                                {
                                    $project: {
                                        fullname: 1,
                                        email: 1,
                                        role: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $unwind: {
                            path: "$createdBy",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $unwind: {
                            path: "$assignedTo",
                            preserveNullAndEmptyArrays: true
                        }
                    }
                ],
                totalCount: [
                    { $count: "count" }
                ]
            }
        }
    ])

    const clients = result[0].data
    const totalClients = result[0].totalCount[0]?.count || 0
    const totalPages = Math.ceil(totalClients / limit)

    return res
        .status(200)
        .json(
            new ApiResponse(200, {
                page,
                limit,
                totalPages,
                totalClients,
                clients
            }, "All clients are fetched successfully")
        )
})

const updateClientDetails = asyncHandler(async (req, res) => {
    const { clientId } = req.params
    const { fullname, companyName, email, phone, address, note } = req.body

    if (
        [fullname, companyName, email, phone, address].some((field) => field?.toString().trim() === "")
    ) {
        throw new ApiError(400, "All required fields must be provided")
    }

    const client = await Client.findById(clientId)

    if (!client) {
        throw new ApiError(404, "Client not found")
    }

    if (!(req.user._id.toString() === client.assignedTo?.toString() || req.user?.role === "admin")) {
        throw new ApiError(403, "The user is not allowed to change this client data")
    }

    const updatedClient = await Client.findByIdAndUpdate(
        clientId,
        {
            fullname,
            companyName,
            email,
            phone,
            address,
            note
        },
        {
            new: true,
            runValidators: true
        }
    )

    if (!updatedClient) {
        throw new ApiError(404, "Somthing went wrong while updating client details")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedClient, "Client details updated successfully")
        )
})

const getClientById = asyncHandler(async (req, res) => {
    const { clientId } = req.params


    const client = await Client.findOne({ _id: clientId, isDeleted: false })
        .populate("assignedTo", "fullname email role avatar")
        .populate("createdBy", "fullname email role avatar")

    if (!client) {
        throw new ApiError(404, "Client not found")
    }

    if (!(req.user._id.toString() === client.assignedTo?._id.toString() || req.user.role === "admin")) {
        throw new ApiError(403, "The user is not allowed to access this client")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, client, "Client fetched successfully")
        )
})

const getAssignedClients = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1
    const limit = 20
    const skip = (page - 1) * limit

    const [clients, totalClients] = await Promise.all([
        Client.find({ assignedTo: req.user._id, isDeleted: false })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("createdBy", "fullname email role avatar"),

        Client.countDocuments({ assignedTo: req.user._id, isDeleted: false })
    ])

    return res
        .status(200)
        .json(
            new ApiResponse(200, {
                page,
                limit,
                totalClients,
                totalPages: Math.ceil(totalClients / limit),
                clients
            }, "All assigned clients are fetched successfully")
        )
})

const assignClient = asyncHandler(async (req, res) => { // taking user id as "userId" from req.body

    const { clientId } = req.params
    const { userId } = req.body

    const client = await Client.findById(clientId)
    if (!client) {
        throw new ApiError(404, "Client not found");
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (!["sales", "support"].includes(user.role)) {
        throw new ApiError(
            400,
            "Client can only be assigned to sales or support"
        );
    }

    client.assignedTo = user._id;
    await client.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, client, "Client assigned successfully")
    )
})

const deleteClient = asyncHandler(async (req, res) => {
    const { clientId } = req.params;

    const client = await Client.findOne({
        _id: clientId,
        isDeleted: false
    });

    if (!client) {
        throw new ApiError(404, "Client not found");
    }

    const isAdmin = req.user.role === "admin";
    const isOwner = client.assignedTo?.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
        throw new ApiError(403, "You are not allowed to delete this client");
    }

    client.isDeleted = true;
    client.deletedAt = new Date();
    await client.save();

    return res.status(200).json(
        new ApiResponse(200, null, "Client deleted successfully")
    );
});

const restoreClient = asyncHandler(async (req, res) => {
    const { clientId } = req.params;

    const client = await Client.findOne({
        _id: clientId,
        isDeleted: true
    });

    if (!client) {
        throw new ApiError(404, "Client not found or not deleted");
    }

    client.isDeleted = false;
    client.deletedAt = null;
    await client.save();

    return res.status(200).json(
        new ApiResponse(200, client, "Client restored successfully")
    );
});


export {
    createClient,
    getAllClients,
    updateClientDetails,
    getClientById,
    getAssignedClients,
    assignClient,
    deleteClient,
    restoreClient
}