import { Router } from "express";
import { validate } from "../middlewares/validate.middleware.js";
import {
  RegisterSchema,
  LoginSchema,
  ChangePassSchema,
  UpdateAccountSchema,
  channelProfileParamSchema,
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
import { authLimiter } from "../middlewares/rateLimit.middleware.js";

const router = Router();

router.route("/register").post(
  authLimiter("register"),
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  validate({ body: RegisterSchema }),
  registerUser
);

router
  .route("/login")
  .post(authLimiter("login"), validate({ body: LoginSchema }), loginUser);

// Secured Routes
router.route("/logout").post(verifyJWT, logoutUser);
router
  .route("/refresh-token")
  .post(authLimiter("refresh-token"), refreshAccessToken);

router.route("/me").get(verifyJWT, getCurrentUser);

router
  .route("/change-password")
  .patch(
    verifyJWT,
    validate({ body: ChangePassSchema }),
    changeCurrentPassword
  );

router
  .route("/update-account")
  .patch(
    verifyJWT,
    validate({ body: UpdateAccountSchema }),
    updateAccountDetails
  );

router
  .route("/update-avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

router
  .route("/update-cover")
  .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

router
  .route("/channel/:username")
  .get(
    verifyJWT,
    validate({ params: channelProfileParamSchema }),
    getUserChannelProfile
  );

router.route("/watch-history").get(verifyJWT, getWatchHistory);

export default router;
