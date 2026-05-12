import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { paginationQuerySchema } from "../validators/pagination.validator.js";
import {
  getChannelStats,
  getChannelVideos,
} from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/stats").get(getChannelStats);
router
  .route("/videos")
  .get(validate({ query: paginationQuerySchema }), getChannelVideos);

export default router;
