import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { createTweet, deleteTweet, getUserAllTweets, updateTweet } from "../controllers/tweet.controller.js";


const router = Router();
router.use(verifyJwt);
router.route("/").post(createTweet)
router.route("/user/:userID").get(getUserAllTweets);
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet);


export default router;