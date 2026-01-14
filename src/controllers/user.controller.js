import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { Client } from "../models/client.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponce.js"



const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "Current user fetched successfully"))
})

const updateAdminAccountDetails = asyncHandler(async (req, res) => {
    const { fullname, email } = req.body

    if (!fullname || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const emailExist = await User.findOne({
        email,
        _id: { $ne: req.user._id }
    })

    if (emailExist) {
        throw new ApiError(409, "Email already in use")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname,
                email
            }
        },
        { new: true }
    ).select("-password -refreshToken")

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"))
})

const updateAdminAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: { avatar: avatar.url }
        },
        { new: true }
    ).select("-password -refreshToken")

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Avatar is updated successfully"))

})

const updateUserDetails = asyncHandler(async (req, res) => {
    const { userId } = req.params
    const { fullname, email, role } = req.body

    if (
        [fullname, email, role].some(
            (field) => !field || field.toString().trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const allowedRoles = ["admin", "sales", "support"]
    if (!allowedRoles.includes(role)) {
        throw new ApiError(400, "Invalid role")
    }

    const emailExists = await User.findOne({
        email,
        _id: { $ne: userId }
    })

    if (emailExists) {
        throw new ApiError(409, "Email already in use")
    }

    const user = await User.findByIdAndUpdate(
        userId,
        {
            $set: {
                fullname,
                email,
                role
            }
        },
        { new: true }
    ).select("-password -refreshToken")

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    return res.status(200).json(
        new ApiResponse(200, user, "User updated successfully")
    )
})

const getAllUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1

    const limit = 20
    const skip = (page - 1) * limit

    const allUsers = await User.find({
        role: {
            $ne: "admin"
        }
    })
        .select("-password -refreshToken")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)

    const totalUsers = await User.countDocuments({ role: { $ne: "admin" } })



    return res
        .status(200)
        .json(
            new ApiResponse(200, {
                page,
                limit,
                totalUsers,
                totalPages: Math.ceil(totalUsers / limit),
                allUsers
            }, "All users fetched successfully")
        )
})

const getAUser = asyncHandler(async (req, res) => {
    const { userId } = req.params
    const pageAssigned = parseInt(req.query.pageAssigned, 10) || 1
    const pageCreated = parseInt(req.query.pageCreated, 10) || 1

    const limit = 20

    const skipAssigned = (pageAssigned - 1) * limit
    const skipCreated = (pageCreated - 1) * limit


    const [user, assignedClients, totalAssignedClient, createdClients, totalCreatedClient] = await Promise.all([
        User.findById(userId).select("-password -refreshToken"),

        Client.find({ assignedTo: userId, isDeleted: false })
            .sort({ createdAt: -1 })
            .skip(skipAssigned)
            .limit(limit)
            .populate("createdBy", "fullname email role avatar"),

        Client.countDocuments({ assignedTo: userId, isDeleted: false }),

        Client.find({ createdBy: userId })
            .sort({ createdAt: -1 })
            .skip(skipCreated)
            .limit(limit)
            .populate("assignedTo", "fullname email role avatar"),

        Client.countDocuments({ createdBy: userId })
    ])

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    return res.status(200).json(
        new ApiResponse(200, {
            user,

            assigned: {
                page: pageAssigned,
                limit,
                total: totalAssignedClient,
                totalPages: Math.ceil(totalAssignedClient / limit),
                clients: assignedClients
            },

            created: {
                page: pageCreated,
                limit,
                total: totalCreatedClient,
                totalPages: Math.ceil(totalCreatedClient / limit),
                clients: createdClients
            }
        }, "User fetched successfully")
    )

})

const toggleUserStatus = asyncHandler(async (req, res) => {
    const { userId } = req.params

    const user = await User.findById(userId)

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // if (req.user._id.toString() === user._id.toString()) {
    //     throw new ApiError(400, "Admin cannot deactivate self")
    // }

    user.isActive = !user.isActive
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(
            new ApiResponse(200, {isActive: user.isActive}, `User ${user.isActive ? activated : deactivated} successfully`)
        )
})

const updateUserRole = asyncHandler(async (req, res)=>{
    const {userId} = req.params
    const {role} = req.body

    if (
        !["admin", "sales", "support"].includes(role)
    ) {
        throw new ApiError(400, "Invalid role")
    }

    const user = await User.findByIdAndUpdate(
        userId,
        {
            $set:{
                role
            }
        },
        {
            new: true
        }
    )

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, {role: user.role}, `Role is changed to ${user.role} successfully`)
    )
})


export {
    getCurrentUser,
    updateAdminAccountDetails,
    updateAdminAvatar,
    updateUserDetails,
    getAllUsers,
    getAUser,
    toggleUserStatus,
    updateUserRole
}