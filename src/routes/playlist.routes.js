import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import {
  playlistBodySchema,
  playlistIdParamSchema,
  userIdParamSchema,
  playlistVideoParamSchema,
} from "../validators/playlist.validator.js";
import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserPlaylists,
  removeVideoFromPlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/").post(validate({ body: playlistBodySchema }), createPlaylist);

router
  .route("/:playlistId")
  .get(validate({ params: playlistIdParamSchema }), getPlaylistById)
  .patch(
    validate({ body: playlistBodySchema, params: playlistIdParamSchema }),
    updatePlaylist
  )
  .delete(validate({ params: playlistIdParamSchema }), deletePlaylist);

router
  .route("/add/:videoId/:playlistId")
  .patch(validate({ params: playlistVideoParamSchema }), addVideoToPlaylist);
router
  .route("/remove/:videoId/:playlistId")
  .patch(
    validate({ params: playlistVideoParamSchema }),
    removeVideoFromPlaylist
  );

router
  .route("/user/:userId")
  .get(validate({ params: userIdParamSchema }), getUserPlaylists);

export default router;
