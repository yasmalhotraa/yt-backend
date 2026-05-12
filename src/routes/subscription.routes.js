import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import {
  channelIdParamSchema,
  subscriberIdParamSchema,
} from "../validators/subscription.validator.js";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
  .route("/c/:channelId")
  .get(validate({ params: channelIdParamSchema }), getUserChannelSubscribers)
  .post(validate({ params: channelIdParamSchema }), toggleSubscription);

router
  .route("/u/:subscriberId")
  .get(validate({ params: subscriberIdParamSchema }), getSubscribedChannels);

export default router;
