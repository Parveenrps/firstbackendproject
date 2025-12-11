import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";


const addComment = asyncHandler(async(req, res)=>{
    //get comment from frontend
    const {commentContent} = req.body
    const {videoId} = req.params.videoId
    const {userId} = req.user._id

    //check comment and video
    if(!videoId){
        throw new ApiError(400, "Video Id does not exist");
    }

    if(!commentContent){
        throw new ApiResponse(400, "Comment does not exist");
    }

    const comment = await Comment.create({
        commet: commentContent,
        video: videoId,
        owner: userId
    })

    await comment.save()

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        comment,
        "comment added successfully"
    ))
    
})

const updateComment = asyncHandler(async(req, res)=>{
    //whi route denge jismein comment hai jismein comment id hai
    const {commentId} = req.params
    const {updatedCommentContent} = req.body

    if(!commentId){
        throw new ApiError(400, "commentId does not exist");
    }

    if(!updatedCommentContent){
        throw new ApiError(400, "udpated comment does not exits");
    }

    //now find the content by commentId and update it with updated comment
    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set:{
                content : updatedCommentContent //udpate the old content with new one
            }
        },
        {
            new: true //mongodb give new document if new not used it will give old one
        }
    )

    return res
    .status(200)
    .json( new ApiResponse(
        200,
        updatedComment,
        "Comment updated successfully"
    ))
})

const deleteComment = asyncHandler(async(req, res)=>{
    const {commentId} = req.params

    if(!commentId){
        throw new ApiError(400, "commentId does not exist");
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId);

    return res
    .status(200)
    .json( new ApiResponse(
        200,
        deletedComment,
        "comment deleted successfully"
    ))
})

const getAllVideoComments = asyncHandler(async(req, res)=>{
    //get video id
    const {videoId} = req.params
    const {page = 1, limit = 10 } = req.query;

    const options = {
        page,
        limit
    }

    if(!videoId){
        throw new ApiError(400, "video id is required");
    }

    //search all comment from that video id
    //along with that comment id take correspond username and avatar

    const allComments = await Comment.aggregate([
        {
            $match: {
                video : new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup:{ //look up always return an array
                from: "users", //lowercase mein aur plural mein ho jata hai
                localField: "owner",
                foreignField : "_id",
                as: "commentor"
            }
        },
        { //unwind convery lookup array into object
            $unwind: "$commentor" //$ unwind the value inside the field
        },
        { //which field we want in final output
            $project:{
                _id: 1, //one mean include
                content: 1,
                "commentor._id": 1,
                "commentor.username": 1,
                "commentor.fullName": 1,
                "commentor.avatar": 1,
                "commentor.createdAt": 1
            }
        }
    ])

    if(!allComments){
        throw new ApiError(400, "No comments fetched")
    }

    const paginatedComments = await Comment.aggregatePaginate(allComments, options);

    return res
    .status(200)
    .json( new ApiResponse(
        200,
        paginatedComments,
        "All comment fetched successfully"
    ))

})


export {
    addComment,
    updateComment,
    deleteComment,
    getAllVideoComments
}