import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import {
  commentBodySchema,
  commentIdParamSchema,
} from "../validators/comment.validator.js";
import { paginationQuerySchema } from "../validators/pagination.validator.js";
import { videoIdParamSchema } from "../validators/video.validator.js";
import {
  addComment,
  deleteComment,
  getVideoComments,
  updateComment,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
  .route("/:videoId")
  .get(
    validate({ params: videoIdParamSchema, query: paginationQuerySchema }),
    getVideoComments
  )
  .post(
    validate({ body: commentBodySchema, params: videoIdParamSchema }),
    addComment
  );
router
  .route("/c/:commentId")
  .delete(validate({ params: commentIdParamSchema }), deleteComment)
  .patch(
    validate({ body: commentBodySchema, params: commentIdParamSchema }),
    updateComment
  );

export default router;
