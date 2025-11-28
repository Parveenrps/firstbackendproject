import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from "../models/user.model.js";

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
    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })

    if(existedUser){
        throw new ApiError(409, "User with username or email is already exists" )
    }

    //check for images, check for avtar compalsory
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required");
    }

    //upload them to cloudinary it return response in url, check avtar is uploaded
    //create object, in mongodb nosql ->create entry in db
    //remove password and refresh token field from response
    //check for user creation
    // return response
})

export {registerUser}