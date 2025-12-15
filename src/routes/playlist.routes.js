import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { createPlaylist, deletePlaylist } from "../controllers/playlist.controller.js";


const router = Router();

router.use(verifyJwt);

router.route("/").post(createPlaylist);
router.route("/:playlistId").delete(deletePlaylist)

export default router;
