import mongoose from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from "../models/like.model.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  // get content from frontend
  const { content } = req.body;

  // validation (used before implementing zod)
  // if (!content || content.trim() === "") {
  //   throw new ApiError(400, "Content is required");
  // }

  // create tweet
  const tweet = await Tweet.create({
    content,
    owner: req.user._id,
  });

  if (!tweet) {
    throw new ApiError(500, "Something went wrong while creating tweet");
  }

  // return response
  return res
    .status(201)
    .json(new ApiResponse(201, tweet, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const { userId } = req.params;

  // validation (used before implementing zod)
  // if (!isValidObjectId(userId)) {
  //   throw new ApiError(400, "User not found");
  // }

  const tweets = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $unwind: "$owner",
    },
    {
      $project: {
        "owner.email": 0,
        "owner.watchHistory": 0,
        "owner.password": 0,
        "owner.createdAt": 0,
        "owner.updatedAt": 0,
        "owner.refreshToken": 0,
      },
    },
    {
      $project: {
        content: 1,
        "owner.username": 1,
        "owner.fullName": 1,
        "owner.avatar.url": 1,
        "owner.coverImage.url": 1,
      },
    },
  ]);

  if (!tweets || tweets.length === 0) {
    throw new ApiError(400, "No tweets found under this user");
  }

  res
    .status(200)
    .json(new ApiResponse(200, tweets, "Tweets fetched successully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { content } = req.body;
  const { tweetId } = req.params;

  // validation (used before implementing zod)
  // if (!content || content.trim() === "") {
  //   throw new ApiError(400, "Content is required to update the tweet");
  // }

  // validation (used before implementing zod)
  // if (!isValidObjectId(tweetId)) {
  //   throw new ApiError(400, "tweet id is invalid");
  // }

  const updatedTweet = await Tweet.findOneAndUpdate(
    {
      _id: tweetId,
      owner: req.user._id,
    },
    {
      content,
    },
    {
      new: true,
    }
  );

  if (!updatedTweet) {
    throw new ApiError(
      404,
      "Tweet not found or you are not authorized to update it"
    );
  }

  res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;

  // validation (used before implementing zod)
  // if (!isValidObjectId(tweetId)) {
  //   throw new ApiError(400, "tweet id is invalid");
  // }

  const deletedTweet = await Tweet.findOneAndDelete({
    _id: tweetId,
    owner: req.user._id,
  });

  if (!deletedTweet) {
    throw new ApiError(
      404,
      "Tweet not found or you are not authorized to delete it"
    );
  }

  // delete likes under that tweet too
  await Like.deleteMany({
    tweet: tweetId,
  });

  res
    .status(200)
    .json(new ApiResponse(200, deletedTweet, "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
