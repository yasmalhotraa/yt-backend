import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { Like } from "../models/like.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  // validation (used before implementing zod)
  // if (!isValidObjectId(videoId)) {
  //   throw new ApiError(400, "Invalid video id");
  // }

  if (isNaN(parseInt(page)) || isNaN(parseInt(limit))) {
    throw new ApiError(400, "please provide a valid and page and limit");
  }

  const aggregate = Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $sort: { createdAt: -1 },
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
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "comment",
        as: "likes",
      },
    },
    {
      $addFields: {
        likeCount: {
          $size: "$likes",
        },
        isLiked: {
          $in: [new mongoose.Types.ObjectId(req.user._id), "$likes.likedBy"],
        },
      },
    },
    {
      $project: {
        content: 1,
        video: 1,
        owner: {
          username: 1,
          avatar: {
            url: 1,
          },
        },
        likeCount: 1,
        isLiked: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };

  const result = await Comment.aggregatePaginate(aggregate, options);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Comments fetched successfully"));
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  const { content } = req.body;

  // validation (used before implementing zod)
  // if (!isValidObjectId(videoId)) {
  //   throw new ApiError(400, "Video id is not valid");
  // }

  // validation (used before implementing zod)
  // if (!content || content.trim() === "") {
  //   throw new ApiError(400, "Content is required");
  // }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: req.user._id,
  });

  if (!comment) {
    throw new ApiError(500, "Could not add comment");
  }

  res
    .status(201)
    .json(new ApiResponse(201, comment, "Comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;
  const { content } = req.body;

  // validation (used before implementing zod)
  // if (!isValidObjectId(commentId)) {
  //   throw new ApiError(400, "Comment id is not valid");
  // }

  // validation (used before implementing zod)
  // if (!content || content.trim() === "") {
  //   throw new ApiError(400, "Content is required");
  // }

  const updatedComment = await Comment.findOneAndUpdate(
    {
      _id: commentId,
      owner: req.user._id,
    },
    {
      content,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedComment) {
    throw new ApiError(404, "Comment not found or access denied");
  }

  res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;

  // validation (used before implementing zod)
  // if (!isValidObjectId(commentId)) {
  //   throw new ApiError(400, "Comment id is not valid");
  // }

  const deleteResponse = await Comment.findOneAndDelete({
    _id: commentId,
    owner: req.user._id,
  });

  if (!deleteResponse) {
    throw new ApiError(404, "Comment not found or access denied");
  }

  // delete likes under that comment too
  await Like.deleteMany({
    comment: commentId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, commentId, "Comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
