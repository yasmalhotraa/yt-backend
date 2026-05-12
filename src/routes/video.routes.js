import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import {
  videoBodySchema,
  videoIdParamSchema,
  getAllVideosQuerySchema,
} from "../validators/video.validator.js";
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideo,
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
  .route("/")
  .get(validate({ query: getAllVideosQuerySchema }), getAllVideos)
  .post(
    upload.fields([
      {
        name: "videoFile",
        maxCount: 1,
      },
      {
        name: "thumbnail",
        maxCount: 1,
      },
    ]),
    validate({ body: videoBodySchema }),
    publishAVideo
  );

router
  .route("/:videoId")
  .get(validate({ params: videoIdParamSchema }), getVideoById)
  .delete(validate({ params: videoIdParamSchema }), deleteVideo)
  .patch(
    upload.single("thumbnail"),
    validate({ body: videoBodySchema, params: videoIdParamSchema }),
    updateVideo
  );

router
  .route("/toggle/publish/:videoId")
  .patch(validate({ params: videoIdParamSchema }), togglePublishStatus);

export default router;
