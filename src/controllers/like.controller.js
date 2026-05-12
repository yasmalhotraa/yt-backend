import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video

  // validation (used before implementing zod)
  // if (!isValidObjectId(videoId)) {
  //   throw new ApiError(400, "Video id is not valid");
  // }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const deleteResponse = await Like.deleteOne({
    video: videoId,
    likedBy: req.user?._id,
  });

  let isLiked;

  if (deleteResponse.deletedCount > 0) {
    isLiked = false;
  } else {
    await Like.create({
      video: videoId,
      likedBy: req.user?._id,
    });

    isLiked = true;
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { isLiked }, "Video like toggled successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment

  // validation (used before implementing zod)
  // if (!isValidObjectId(commentId)) {
  //   throw new ApiError(400, "Comment Id is not valid");
  // }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  const deleteResponse = await Like.deleteOne({
    comment: commentId,
    likedBy: req.user?._id,
  });

  let isLiked;

  if (deleteResponse.deletedCount > 0) {
    isLiked = false;
  } else {
    await Like.create({
      comment: commentId,
      likedBy: req.user?._id,
    });

    isLiked = true;
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, { isLiked }, "Comment like toggled successfully")
    );
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet

  // validation (used before implementing zod)
  // if (!isValidObjectId(tweetId)) {
  //   throw new ApiError(400, "Tweet id is not valid");
  // }

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  const deleteResponse = await Like.deleteOne({
    tweet: tweetId,
    likedBy: req.user?._id,
  });

  let isLiked;

  if (deleteResponse.deletedCount > 0) {
    isLiked = false;
  } else {
    await Like.create({
      tweet: tweetId,
      likedBy: req.user?._id,
    });

    isLiked = true;
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { isLiked }, "Tweet like toggled successfully"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  // TODO: get all liked videos

  const { page = 1, limit = 10 } = req.validatedQuery;

  const aggregate = Like.aggregate([
    {
      $match: {
        likedBy: req.user._id,
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videoDetails",
      },
    },
    {
      $unwind: "$videoDetails",
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $project: {
        _id: 1,
        videoTitle: "$videoDetails.title",
        videoDescription: "$videoDetails.description",
        thumbnail: "$videoDetails.thumbnail.url",
        video: "$videoDetails.videoFile.url",
      },
    },
  ]);

  const options = {
    page,
    limit,
  };

  const result = await Like.aggregatePaginate(aggregate, options);

  if (!result.docs.length) {
    throw new ApiError(404, "No liked videos found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Liked videos fetched successfully"));
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
