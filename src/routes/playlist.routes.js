import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { createPlaylist, deletePlaylist, updatePlaylist } from "../controllers/playlist.controller.js";


const router = Router();

router.use(verifyJwt);

router.route("/").post(createPlaylist);
router.route("/:playlistId").delete(deletePlaylist).patch(updatePlaylist)
router.route("/add/:playlistId/:videoId").patch();
router.route("/remove/:playlistId/:videoId").patch();

export default router;
