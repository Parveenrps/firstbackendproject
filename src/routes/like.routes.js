import { Router } from 'express'
import { verifyJwt } from '../middlewares/auth.middleware.js';
import { getAllLikedVideo, toggleCommentLike, toggleTweetLike, toggleVideoLike } from '../controllers/like.controller.js';

const router = Router()

//after login hi hoga na check so
router.use(verifyJwt);

router.route("/toggle/v/:videoId").post(toggleVideoLike);
router.route("/toggle/c/:commentId").post(toggleCommentLike);
router.route("/toggle/t/:tweetId").post(toggleTweetLike);
router.route("/videos").get(getAllLikedVideo)

export default router;