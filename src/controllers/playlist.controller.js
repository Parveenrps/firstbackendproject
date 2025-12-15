import { Playlist } from "../models/playlist.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";


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

export {
    createPlaylist,
    deletePlaylist
}