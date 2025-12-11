import mongoose from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const createTweet = asyncHandler(async(req, res)=>{
    const {tweetContent} = req.body;

    if(!tweetContent){
        throw new ApiError(400, "no tweet found")
    }

    const tweet = await Tweet.create({
        content: tweetContent,
        owner: req.user._id
    })

    return res
    .status(200)
    .json( new ApiResponse(
        200,
        tweet,
        "tweet is created successfully"
    ))
})

const updateTweet = asyncHandler(async(req, res)=>{
    const {tweetId} = req.params
    const {updatedTweetContent} = req.body

    if(!tweetId){
        throw new ApiError(400, "invailid tweetId")
    }

    if(!updatedTweetContent){
        throw new ApiError(400, "tweet content is required to update")
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set:{
                content: updatedTweetContent
            }
        },
        {new : true}
    )

    return res
    .status(200)
    .json( new ApiResponse(
        200,
        updateTweet,
        "Tweet updated successfully"
    ))
})

const deleteTweet = asyncHandler(async(req, res)=>{
    const {tweetId} = req.params

    if(!tweetId){
        throw new ApiError(400, "Invalid tweet ID");
    }

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);
    console.log(deleteTweet)
    return res
    .status(200)
    .json( new ApiResponse(
        200,
        deletedTweet,
        "Tweet deleted successfully"
    ))
})

const getUserAllTweets = asyncHandler(async(req, res)=>{
    const {userId} = req.params;

    if(!userId){
        throw new ApiError(400, "user id does not exist");
    }

    const allUserTweets = await User.aggregate([
        {
            $match : {
                _id : new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup:{
                from : "tweets",
                localField: "_id",
                foreignField: "owner",
                as: "tweets"
            }
        },
        {
            $unwind: "$tweets"
        },
        {
            $lookup:{
                from : "likes",
                let : { tweetId : "$tweets._id"},
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq : ["$tweet", "$$tweetId"]
                            }
                        }
                    },
                    {
                        $count : "count"
                    }
                ],
                as: "likesCount"
            }
        },
        {
            $addFields: {
                "tweets.likeCount" : {
                    $ifNull : [ {
                        $arrayElemAt : [ "$likeCount.count", 0 ] 
                    }, 0]
                }
            }
        },
        {
            $project:{
                fullName: 1,
                username: 1,
                avatar: 1,
                tweets: 1
            }
        }

    ])
})
export {
    createTweet,
    updateTweet,
    deleteTweet,
    getUserAllTweets
}