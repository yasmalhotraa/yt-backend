import { Router } from "express";
import { ApiResponse } from "../utils/ApiResponse.js";

const router = Router();

router.route("/").get((req, res) => {
  res.status(200).json(
    new ApiResponse(
      200,
      {
        documentation:
          "https://documenter.getpostman.com/view/54296440/2sBXwmPY7G",
      },
      "VidHub Backend API is running"
    )
  );
});

export default router;
