import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.model.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  // total videos
  // total views by adding all video views
  // total subscribers
  // total likes
  // total comments

  const userId = new mongoose.Types.ObjectId(req.user._id);

  // Get total views and videos
  const videoStats = await Video.aggregate([
    {
      $match: {
        owner: userId,
      },
    },
    {
      $group: {
        _id: "$owner",
        totalViews: { $sum: "$views" },
        totalVideos: { $sum: 1 },
      },
    },
  ]);

  const vStats = videoStats[0] || { totalVideos: 0, totalViews: 0 };

  // get total subscribers
  const totalSubscribers = await Subscription.countDocuments({
    channel: userId,
  });

  // total likes on videos, comments, and tweets owned by the authenticated user
  const [videoLikes, commentLikes, tweetLikes] = await Promise.all([
    // likes on videos
    Like.aggregate([
      {
        $lookup: {
          from: "videos",
          localField: "video",
          foreignField: "_id",
          as: "videos",
          pipeline: [
            {
              $match: {
                owner: userId,
              },
            },
          ],
        },
      },
      {
        $match: { videos: { $ne: [] } },
      },
      {
        $count: "totalVideoLikes",
      },
    ]),

    // likes on comments
    Like.aggregate([
      {
        $lookup: {
          from: "comments",
          localField: "comment",
          foreignField: "_id",
          as: "comments",
          pipeline: [
            {
              $match: {
                owner: userId,
              },
            },
          ],
        },
      },
      {
        $match: { comments: { $ne: [] } },
      },
      {
        $count: "totalCommentLikes",
      },
    ]),

    // likes on tweets
    Like.aggregate([
      {
        $lookup: {
          from: "tweets",
          localField: "tweet",
          foreignField: "_id",
          as: "tweets",
          pipeline: [
            {
              $match: {
                owner: userId,
              },
            },
          ],
        },
      },
      {
        $match: {
          tweets: { $ne: [] },
        },
      },
      {
        $count: "totalTweetLikes",
      },
    ]),
  ]);

  const likeStats = {
    totalVideoLikes: videoLikes[0]?.totalVideoLikes || 0,
    totalCommentLikes: commentLikes[0]?.totalCommentLikes || 0,
    totalTweetLikes: tweetLikes[0]?.totalTweetLikes || 0,
  };

  // total comments
  const comments = await Comment.aggregate([
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videos",
        pipeline: [
          {
            $match: {
              owner: userId,
            },
          },
        ],
      },
    },
    {
      $match: { videos: { $ne: [] } },
    },
    {
      $count: "totalComments",
    },
  ]);

  const commentStats = comments[0]?.totalComments || 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalVideos: vStats.totalVideos,
        totalViews: vStats.totalViews,
        totalSubscribers,
        totalLikes: likeStats,
        totalComments: commentStats,
      },
      "Channel stats fetched successfully"
    )
  );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel

  const userId = new mongoose.Types.ObjectId(req.user._id);
  const { page = 1, limit = 10 } = req.validatedQuery;

  // validation (used before implementing zod)
  // if (!page || isNaN(parseInt(page))) {
  //   throw new ApiError(400, "Please provide a valid page number");
  // }
  // if (!limit || isNaN(parseInt(limit))) {
  //   throw new ApiError(400, "Please provide a valid limit number");
  // }

  const videos = Video.aggregate([
    {
      $match: { owner: userId },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $project: {
        "videoFile.public_id": 0,
        "thumbnail.public_id": 0,
      },
    },
  ]);

  const options = {
    page: page,
    limit: limit,
  };

  const result = await Video.aggregatePaginate(videos, options);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };
