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

export {
    toggleVideoLike
}