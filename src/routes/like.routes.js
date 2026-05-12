import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { commentIdParamSchema } from "../validators/comment.validator.js";
import { tweetIdParamSchema } from "../validators/tweet.validator.js";
import { videoIdParamSchema } from "../validators/video.validator.js";
import { paginationQuerySchema } from "../validators/pagination.validator.js";
import {
  getLikedVideos,
  toggleCommentLike,
  toggleVideoLike,
  toggleTweetLike,
} from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
  .route("/toggle/v/:videoId")
  .post(validate({ params: videoIdParamSchema }), toggleVideoLike);
router
  .route("/toggle/c/:commentId")
  .post(validate({ params: commentIdParamSchema }), toggleCommentLike);
router
  .route("/toggle/t/:tweetId")
  .post(validate({ params: tweetIdParamSchema }), toggleTweetLike);
router
  .route("/videos")
  .get(validate({ query: paginationQuerySchema }), getLikedVideos);

export default router;
