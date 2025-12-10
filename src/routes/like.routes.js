import { Router } from 'express'
import { verifyJwt } from '../middlewares/auth.middleware.js';
import { toggleVideoLike } from '../controllers/like.controller.js';

const router = Router()

//after login hi hoga na check so
router.use(verifyJwt);

router.route("/toggle/v/:videoId").post(toggleVideoLike);

export default router;