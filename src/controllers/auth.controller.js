import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponce.js"
import jwt from "jsonwebtoken"

const options = {          //the options is used in refreshtoken controller
    httpOnly: true,
    secure: true
}


const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Somthing went wrong while generating refresh and access token")
    }
}


const registerUser = asyncHandler(async (req, res) => {

    const { email, fullname, role, password } = req.body

    
    if (
        [email, fullname, role, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const allowedRoles = ["admin", "sales", "support"]

    if (!allowedRoles.includes(role)) {
        throw new ApiError(400, "Invalid role")
    }

    const existedUser = await User.findOne({ email })

    if (existedUser) {
        throw new ApiError(409, "User with email already exists")
    }

    let avatarLocalPath = ""
    if (req.file?.path) {
        const avatar = await uploadOnCloudinary(req.file.path);
        avatarLocalPath = avatar?.url || "";
    }

    if (avatarLocalPath === "") {
        avatarLocalPath = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullname)}&background=random&color=fff`;
    }

    const user = await User.create({
        fullname,
        avatar: avatarLocalPath,
        email,
        role,
        password
    })


    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, createdUser, "User registered successfully")
        )
})


const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body


    if (!email || !password) {
        throw new ApiError(400, "Email and password is required")
    }

    const user = await User.findOne({ email })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    if (!user.isActive) {
        throw new ApiError(403, "Your account is deactivated. Contact admin.")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select(" -password -refreshToken")


    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        )

})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true // for this one, this method returns the new updated data
        }
    )


    res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User Logged Out"))

})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefrshToken = req.cookie.refreshToken || req.body.refreshToken

    if (!incomingRefrshToken) {
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefrshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (incomingRefrshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                200,
                {
                    accessToken, refreshToken: newRefreshToken
                },
                "Access token refreshed"
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }


})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"))

})


 const registerAdmin = async (req, res) => {
  const { fullname, email, password } = req.body;

  const adminExists = await User.exists({ role: "admin" });

  if (adminExists) {
    throw new ApiError(
      403,
      "Admin already exists. Only admin can create new admins."
    );
  }

  let avatarLocalPath = ""
    if (req.file?.path) {
        const avatar = await uploadOnCloudinary(req.file.path);
        avatarLocalPath = avatar?.url || "";
    }

    if (avatarLocalPath === "") {
        avatarLocalPath = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullname)}&background=random&color=fff`;
    }

  const admin = await User.create({
    fullname,
    email,
    password,
    avatar : avatarLocalPath,
    role: "admin",
  });

  return res
  .status(201)
  .json(
    new ApiResponse(201, admin, "First admin created successfully")
  );
};






export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    registerAdmin
}