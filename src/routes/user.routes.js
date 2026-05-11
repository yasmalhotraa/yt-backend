import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import {
  validRegisterSchema,
  validLoginSchema,
  validChangePassSchema,
  validUpdateAccountSchema,
} from "../validators/user.validator.js";
import {
  changeCurrentPassword,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  validate(validRegisterSchema),
  registerUser
);

router.route("/login").post(validate(validLoginSchema), loginUser);

// Secured Routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);

router.route("/me").get(verifyJWT, getCurrentUser);

router
  .route("/change-password")
  .post(verifyJWT, validate(validChangePassSchema), changeCurrentPassword);

router
  .route("/update-account")
  .patch(verifyJWT, validate(validUpdateAccountSchema), updateAccountDetails);

router
  .route("/update-avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

router
  .route("/update-cover")
  .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

router.route("/channel/:username").get(verifyJWT, getUserChannelProfile);

router.route("/watch-history").get(verifyJWT, getWatchHistory);

export default router;
