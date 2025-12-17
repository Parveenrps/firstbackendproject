import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const createPlaylist = asyncHandler(async(req, res)=>{
    const { name, description } = req.body;

    if(!name){
        throw new ApiError(400, "Playlist name is required!");
    }

    const playlist = await Playlist.create({
        name : name,
        description : description | "",
        owner : req.user._id
    })

    if(!playlist){
        throw new ApiError(400, "Playlist creation failed")
    }

    return res
    .status(200)
    .json( new ApiResponse(
        200,
        playlist,
        "Playlist created successfully"
    ))
})

const deletePlaylist = asyncHandler( async(req, res)=>{
    const {playlistId} = req.params

    if(!playlistId){
        throw new ApiError(400, "PlaylistId invalid")
    }

    const deletedPlaylist = await Playlist.findOneAndDelete(playlistId)

    if(!deletePlaylist){
        throw new ApiError(400, "removing playlist failed")
    }

    return res
    .status(200)
    .json( new ApiResponse(
        200,
        deletePlaylist,
        "Playlist deleted successfully"
    ))
})

const updatePlaylist = asyncHandler(async(req, res)=>{
    const {playlistId} = req.params
    const {name, description} = req.body

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid objectId");
    }

    if(!name || !description){
        throw new ApiError(400, "Name and Description is required");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name : name,
                description: description
            }
        },
        { new : true }
    )

    if(!updatePlaylist){
        throw new ApiError(400, "Playlist update failed")
    }

    return res
    .status(200)
    .json( new ApiResponse(
        200,
        updatePlaylist,
        "Playlist updated successfully"
    ))
})

const addVideoToPlaylist = asyncHandler(async(req, res)=>{
    const { playlistId, videoId } = req.params

    if( !isValidObjectId(playlistId) || !isValidObjectId(videoId) ){
        throw new ApiError( 400, "Invalid playlist or video id");
    }
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet :{ //add only if not present
                videos : videoId
            }
        },
        { new : true}
    )

    if(!updatedPlaylist){
        throw new ApiError(400, "Video add in playlist failed")
    }

    return res
    .status(200)
    .json( new ApiResponse(
        200,
        updatedPlaylist,
        "video added in the playlist"
    ))
})

const removeVideoFromPlaylist = asyncHandler(async(req, res)=>{
    const {playlistId, videoId} = req.params

    if(!isValidObjectId(playlistId) || isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid playlist id or video id")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull:{
                videos : videoId
            }
        },
        { new : true }
    )

    if(!updatedPlaylist){
        throw new ApiError(400, "Error while removing video from playlist")
    }

    return res
    .status(200)
    .json( new ApiResponse(
        200,
        updatedPlaylist,
        "Video removed from playlist"
    ))

})

const getPlaylistById = asyncHandler(async(req, res)=>{
    const {playlistId} = req.params

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist ID")
    }

    const playlist = await Playlist.aggregate([
        {
            $mactch : {
                _id : new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup : {
                from : "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline : [
                    {
                        $project : {
                        username: 1,
                        fullName: 1,
                        avatar: 1
                    }
                }

                ]
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videos",
                pipeline: [
                    {
                        $lookup: {
                            from : "users",
                            localField: "owner",
                            foreignField: "_id",
                            as : "owner"
                        },
                        pipeline: [
                            {
                                $project: {
                                    username: 1,
                                    avatar: 1
                                }
                            }
                        ]
                    },
                    {
                        $unwind : "$owner"
                    },
                    {
                        $addFields:{
                            views: {
                                $cond: {
                                    if : { $isArray : "$views"},
                                    then: { $size: "$views"},
                                    else: { $ifNull : ["views", 0]}
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            title: 1,
                            thumbnail: 1,
                            duration: 1,
                            views: 1,
                            owner: 1,
                            createdAt: 1
                        }
                    }
                ]
            },
            
        },
        {
            $unwind: "$owner"
        }
    ]);

    if(!playlist){
        throw new ApiError(400, "Playlist not found")
    }
    
    return res
    .status(200)
    .json( new ApiResponse(
        200,
        playlist[0],
        "Playlist fetched successfully"
    ))


})

export {
    createPlaylist,
    deletePlaylist,
    updatePlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    getPlaylistById
}
