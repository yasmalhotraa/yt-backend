import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import { commentBodySchema } from "../validators/comment.validator.js";
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
  .get(getVideoComments)
  .post(validate({ body: commentBodySchema }), addComment);
router
  .route("/c/:commentId")
  .delete(deleteComment)
  .patch(validate({ body: commentBodySchema }), updateComment);

export default router;
