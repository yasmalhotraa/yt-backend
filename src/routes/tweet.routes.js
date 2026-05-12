import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import {
  tweetContentSchema,
  tweetIdParamSchema,
  userIdParamSchema,
} from "../validators/tweet.validator.js";
import {
  createTweet,
  deleteTweet,
  getUserTweets,
  updateTweet,
} from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/").post(validate({ body: tweetContentSchema }), createTweet);
router
  .route("/user/:userId")
  .get(validate({ params: userIdParamSchema }), getUserTweets);
router
  .route("/:tweetId")
  .patch(
    validate({ body: tweetContentSchema, params: tweetIdParamSchema }),
    updateTweet
  )
  .delete(validate({ params: tweetIdParamSchema }), deleteTweet);

export default router;
