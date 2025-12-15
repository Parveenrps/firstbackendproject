import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { addVideoToPlaylist, createPlaylist, deletePlaylist, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller.js";


const router = Router();

router.use(verifyJwt);

router.route("/").post(createPlaylist);
router.route("/:playlistId").delete(deletePlaylist).patch(updatePlaylist).get()
router.route("/add/:playlistId/:videoId").patch(addVideoToPlaylist);
router.route("/remove/:playlistId/:videoId").patch(removeVideoFromPlaylist);

export default router;
