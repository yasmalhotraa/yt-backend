import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video

  if ([title, description].some((field) => field.trim() === "")) {
    throw new ApiError(400, "Title and description are required");
  }

  const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0].path;

  if (!videoFileLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, "Video and thumbnail are required");
  }

  const videoFile = await uploadOnCloudinary(videoFileLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!videoFile || !thumbnail) {
    throw new ApiError(500, "Something went wrong while uploading the video");
  }

  const video = await Video.create({
    videoFile: {
      url: videoFile.url,
      public_id: videoFile.public_id,
    },
    thumbnail: {
      url: thumbnail.url,
      public_id: thumbnail.public_id,
    },
    title,
    description,
    duration: videoFile.duration || 0,
    isPublished: true,
    owner: req.user?._id,
  });

  if (!video) {
    throw new ApiError(500, "Something went wrong while publishing the video");
  }

  res
    .status(201)
    .json(new ApiResponse(201, video, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video id");
  }

  const pipeline = [];

  // get video matching id and isPublished
  pipeline.push({
    $match: {
      _id: new mongoose.Types.ObjectId(videoId),
      isPublished: true,
    },
  });

  // get isLiked and total likes on video
  pipeline.push(
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $addFields: {
        likesCount: {
          $size: "$likes",
        },
        isLiked: {
          $in: [new mongoose.Types.ObjectId(req.user._id), "$likes.likedBy"],
        },
      },
    }
  );

  // get comments with comments info
  pipeline.push({
    $lookup: {
      from: "comments",
      localField: "_id",
      foreignField: "video",
      as: "comments",
      pipeline: [
        { $sort: { createdAt: -1 } },
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
            likesCount: { $size: "$likes" },
            isLiked: {
              $in: [
                new mongoose.Types.ObjectId(req.user._id),
                "$likes.likedBy",
              ],
            },
          },
        },
        {
          $project: {
            "owner.username": 1,
            "owner.avatar.url": 1,
            likesCount: 1,
            isLiked: 1,
            content: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ],
    },
  });

  // get owner info
  pipeline.push(
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    { $unwind: "$owner" },
    {
      $lookup: {
        from: "subscriptions",
        localField: "owner._id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $addFields: {
        "owner.subscribersCount": {
          $size: "$subscribers",
        },
        "owner.isSubscribed": {
          $in: [
            new mongoose.Types.ObjectId(req.user._id),
            "$subscribers.subscriber",
          ],
        },
      },
    }
  );

  // Projection
  pipeline.push({
    $project: {
      "videoFile.public_id": 0,
      "thumbnail.public_id": 0,
      likes: 0,
      subscribers: 0,
      "owner.password": 0,
      "owner.refreshToken": 0,
      "owner.email": 0,
      "owner.watchHistory": 0,
      "owner.createdAt": 0,
      "owner.updatedAt": 0,
      "owner.__v": 0,
      "owner.username": 0,
      "owner.coverImage": 0,
      "owner.avatar.public_id": 0,
    },
  });

  const video = await Video.aggregate(pipeline);

  if (!video || video.length === 0) {
    throw new ApiError(404, "Video doesn't exist");
  }

  // to increase views on video
  await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } }, { new: true });

  // add to current user watch watchHistory
  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { watchHistory: videoId },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, video[0], "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
  const { title, description } = req.body;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video Id");
  }

  if ([title, description].some((field) => field.trim() === "")) {
    throw new ApiError(400, "Title and Description are required");
  }

  const thumbnailLocalPath = req.file?.path;

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail is required");
  }

  const existingVideo = await Video.findOne({
    _id: videoId,
    owner: req.user?._id,
  }).select("thumbnail.public_id");

  if (!existingVideo) {
    throw new ApiError(404, "Video not found or unauthorized");
  }

  const oldThumbnailId = existingVideo?.thumbnail?.public_id;

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!thumbnail?.url) {
    throw new ApiError(400, "Something went wrong while uploading thumbnail");
  }

  const updatedVideo = await Video.findOneAndUpdate(
    {
      _id: videoId,
      owner: req.user?._id,
    },
    {
      $set: {
        title: title.trim(),
        description: description.trim(),
        thumbnail: {
          url: thumbnail.url,
          public_id: thumbnail.public_id,
        },
      },
    },
    {
      new: true,
    }
  );

  if (!updatedVideo) {
    await deleteFromCloudinary(thumbnail.public_id);

    throw new ApiError(404, "Video not found or unauthorized");
  }

  try {
    if (oldThumbnailId) {
      await deleteFromCloudinary(oldThumbnailId);
    }
  } catch (error) {
    console.log(`Failed to delete old thumbnail ${error}`);
  }

  res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video Id");
  }

  const deletedVid = await Video.findOneAndDelete({
    _id: videoId,
    owner: req.user._id,
  });

  if (!deletedVid) {
    throw new ApiError(
      404,
      "Video not found or you are not authorized to delete it"
    );
  }

  try {
    const promises = [];

    if (deletedVid?.videoFile?.public_id) {
      promises.push(
        deleteFromCloudinary(deletedVid.videoFile.public_id, "video")
      );
    }

    if (deletedVid?.thumbnail?.public_id) {
      promises.push(deleteFromCloudinary(deletedVid.thumbnail.public_id));
    }

    await Promise.allSettled(promises);
  } catch (error) {
    console.log(`Failed to delete video and thumbnail from cloud ${error}`);
  }

  // delete likes and comments under that video too
  await Promise.all([
    Like.deleteMany({ video: videoId }),
    Comment.deleteMany({ video: videoId }),
  ]);

  res
    .status(200)
    .json(new ApiResponse(200, deletedVid, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video Id");
  }

  const video = await Video.findOneAndUpdate(
    {
      _id: videoId,
      owner: req.user._id,
    },
    [
      {
        $set: {
          isPublished: { $not: "$isPublished" },
        },
      },
    ],
    {
      new: true,
      updatePipeline: true,
      lean: true,
    }
  );

  if (!video) {
    throw new ApiError(404, "Video not found or unauthorized");
  }

  res
    .status(200)
    .json(new ApiResponse(200, video, "Publish status toggled successfully"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
