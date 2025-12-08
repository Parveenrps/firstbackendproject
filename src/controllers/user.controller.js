import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";


const generateAccessAndRefreshToken = async(userId)=>{
    try {
        console.log("generating")
        const user = await User.findById(userId);
        console.log(user);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        console.log("token genrated");
        //save karenge to sab cheej kickin na ho to use validateBeforeSave
        try {
            await user.save({validateBeforeSave: true});
        } catch (error) {
            console.log("error while saving user", error);
        }

        return {accessToken, refreshToken};

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }

}

const registerUser = asyncHandler( async(req, res)=>{
    //get user data from frontend
    //validation any field empty? or in correct format
    //check if already exist, check by usename, email
    //check for images, check for avtar compalsory
    //upload them to cloudinary it return response in url, check avtar is uploaded
    //create object, in mongodb nosql ->create entry in db
    //remove password and refresh token field from response
    //check for user creation
    // return response


    //get user data from frontend
    const {fullName, username, email, password} = req.body;
    console.log(username);

    //validation any field empty? or in correct format
    // if(username === ""){
    //     throw new ApiError(400, "full name is required");
    // }

    //by sum method
    if(
        [fullName, username, email, password].some( (field) =>
        field?.trim() === "" )
    ){
        throw new ApiError(400, "All fields are required");
    }

    if(!email.includes("@")){
        throw new ApiError(400, "email should contain @");
    }

    //check if already exist, check by usename, email
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if(existedUser){
        throw new ApiError(409, "User with username or email is already exists" )
    }

    //check for images, check for avtar compalsory
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    console.log(avatarLocalPath);
    console.log(coverImageLocalPath);

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required");
    }

    //upload them to cloudinary it return response in url, check avtar is uploaded

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    console.log(avatar);
    console.log(coverImage);
    
    if(!avatar){
        throw new ApiError(400, "Avatar file is required");
    }

    //create object, in mongodb nosql ->create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "", //coverImage pe vailidation nhi hai so we check hai to url do nhi to empty rakh do
        email,
        password,
        username: username.toLowerCase()
    })
    
    //remove password and refresh token field from response

    //check for user creation -> mongodb automatically create _id
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken" //jo include nhi karna minus sign ke sath string mein add karna hai
    )

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registring the user")
    }

    // return response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully")
    )
})

const loginUser = asyncHandler(async(req, res) => {
    //get user data from frontend
    //check for fields
    //check for user exist or not
    //check password is correct or not
    //generate token
    //logged in

    //get user data from frontend

    const {username, email, password} = req.body;
    //check for fields
    if( !(username || email) ){
        throw new ApiError(400, "username or email is required");
    }

    //check for user exist or not
    const user = await User.findOne({
        $or : [{username}, {email}]
    })

    if(!user){
        throw new ApiError(404, "Invailid User");
    }

    //check password is correct or not
    const isPasswordValid = await user.isPasswordCorrect(password)
    
    if(!isPasswordValid){
        throw new ApiError(401, "Password incorrect!");
    }
    //access or refresh token
    const {accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    // send cookies
    const loggedInUser = await User.findById(user._id).
    select("-passowrd -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User Logged in Successfully"
        )
    )
})

const logoutUser = asyncHandler(async(req, res) => {
    //user kaha se leke aaya yaha koi form nhi hai
    //access of req.user
    await User.findByIdAndDelete(
        req.user._id,
        {
            $set : {
                 refreshToken : undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out"))
})

const refreshAccessToken = asyncHandler(async(req, res)=>{
    const incommingRefreshToken = req.cookie.refreshToken || req.body.refreshToken

    if(!incommingRefreshToken){
        throw new ApiError(401, "unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incommingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401, "invalid Refresh Token");
        }
    
        //compare incoming and user refresh token
        if( incommingRefreshToken !== user.refreshToken ){
            throw new ApiError(401, "Refresh Token is expired or used");
        }
    
        options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id);
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options )
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token");
    }
})


const changeCurrentPassword = asyncHandler(async(req, res)=>{
    const { oldPassword, newPassword } = req.body

    const user = await User.findById(res._id);
    const isPasswordCorrect = await user.isPasswordCorrect(user.oldPassword);

    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid Old Password");
    }

    user.password = newPassword;
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Password is Changed Successfully"
        )
    )
})

const getCurrentUser = asyncHandler(async(req, res)=>{
    return res
    .status(200)
    .json(
        200,
        req.user,
        "Current user fetched successfully"
    )
})

const updateAccountDetails = asyncHandler(async(req, res)=>{
    const {fullName, email} = req.body

    if(!fullName || !email){
        throw new ApiError(400, "All fields are required");
    }

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                fullName : fullName,
                email: email
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "account details updated successfully")
    )

})

const updateUserAvatar = asyncHandler(async(req, res)=>{
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar local file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    
    if(!avatar.url){
        throw new ApiError(400, "Error while uploading on Avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                avatar : avatar.url
            }
        },
        { new: true }
    
    ).select("-password")

    return res
    .status(200)
    .json(
        200,
        user,
        "Avatar updated Successfully"
    )
})

const updateUserCoverImage = asyncHandler(async(req, res)=>{
    const coverImageLocalPath = req.file.path

    if(!coverImageLocalPath){
        throw new ApiError(400, "Cover Image is missing");
    }

    const coverImage = uploadOnCloudinary(coverImageLocalPath);

    if(!coverImage.url){
        throw new ApiError(400, "Error while uploading Cover Image")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                coverImage : coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        200,
        user,
        "Cover Image updated Successfully"
    )



});

const getUserChannelProfile = asyncHandler(async(req, res)=>{
    const {username} = req.params;

    if(!username){
        throw new ApiError(400, "username is missing");
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel", //channel ko select karenge to subs milenge
                as: "subscribers"
            }
        },
        {
            $lookup:{
                from: "subscriptions",
                localField: "_id",
                foreignField: "subcriber", //subscriber ko select karenge to channel milenge jo subscribe kiye hue hai
                as: "subscribedTo"
            }
        },
        {
            $addFields:{
                subscriberCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subcribedTo"
                },
                isSubscribed: {
                    $cond:{
                        if: { 
                            $in: [req.user?._id, "$subscribers.subscriber"]
                        },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {   //saari values nhi dega only projected value dega
            $project:{
                fullName: 1,
                username: 1,
                subscriberCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed:1,
                avatar:1,
                coverImage:1,
                email:1,
            }
        }
    ])

    if(!channel?.length){
        throw new ApiError(404, "Channel does not exist");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            channel[0],
            "User channel does fetched successfully"
        )
    )
})
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
}