import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { addComment, deleteComment, getAllVideoComments, updateComment } from "../controllers/comment.controller.js";

const router = Router()

router.use(verifyJwt)

router.route("/:videoId").post(addComment).get(getAllVideoComments);
router.route("/c/:commentId").delete(deleteComment).patch(updateComment); //patch -> update // Put -> replace

export default router;