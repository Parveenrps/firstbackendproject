import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async(req, res)=>{
    const {videoId} = req.params;

    //does video exist or not
    if(!videoId){
        throw new ApiError(400, "Video does not exist");
    }

    //is Video is liked or not
    const isVideoLiked = await Like.findOne( {video : videoId, likedBy: req.user._id});

    //if not liked then like create like for that user
    if(!isVideoLiked){
        const like = await Like.create({
            video : videoId,
            likedBy : req.user._id
        })

        return res
        .status(200)
        .json( new ApiResponse(
            200,
            like,
            "Liked the video"
        ))
    }
    //video is already liked
    else{
        const likeRemoved = await isVideoLiked.deleteOne();

        return res
        .status(200)
        .json( new ApiResponse(
            200,
            likeRemoved,
            "Like removed"
        ))

    }
})

const toggleCommentLike = asyncHandler(async( req, res )=>{
    const {commentId} = req.params;
    //comment exist or not
    if(!commentId){
        throw new ApiError(400, "Comment does not exist");
    }

    const isCommentLiked = await Like.findOne({
        comment : commentId,
        likedBy: req.user._id
    })

    //if not liked
    if(!isCommentLiked){
        const like = await Like.create({
            comment : commentId,
            likedBy : req.user._id
        })

        res
        .status(200)
        .json( new ApiResponse(
            200,
            like,
            "Comment Liked"
        ))
    }

    else{
        const likeRemoved = isCommentLiked.deleteOne();

        res
        .status(200)
        .json( new ApiResponse(
            200,
            likeRemoved,
            "Like removed from comment"
        ))
    }
    
})

const toggleTweetLike = asyncHandler( async(req, res)=>{
    const {tweetId} = req.params

    if(!tweetId){
        throw new ApiError(400, "Tweet does not exist");
    }

    const isTweetLiked = await Like.findOne({
        tweet : tweetId,
        likedBy: req.user._id
    })

    if(!isTweetLiked){
        const like = await Like.create({
            tweet : tweetId,
            likedBy : req.user._id
        })

        return res
        .status(200)
        .json( new ApiResponse(
            200,
            like,
            "Tweet Liked"
        ))
    }

    else{
        const likeRemoved = isTweetLiked.deleteOne();

        return res
        .status(200)
        .json( new ApiResponse(
            200,
            likeRemoved,
            "Like is removed from tweet"
        ))
    }
})

const getAllLikedVideo = asyncHandler(async(req, res)=>{
    const likedVideos = await Like.aggregate([
        {
            $match:{
                likedBy : req.user._id
            }
        },
        {
            $lookup:{
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails"
            }
        },
        {
            $lookup: {
                from: "user",
                localField: "likedBy",
                foreignField: "_id",
                as: "channel"
            }
        }
    ])

    if(!likedVideos){
        throw new ApiError(400, "Liked Video fetching failed")
    }

    return res
    .status(200)
    .json(
        200,
        likedVideos,
        "all liked videos"
    )
})
export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getAllLikedVideo
}