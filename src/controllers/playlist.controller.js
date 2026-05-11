import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  //TODO: create playlist

  // validation (used before implementing zod)
  // if ([name, description].some((field) => !field || field?.trim() === "")) {
  //   throw new ApiError(400, "Name and Description both are required");
  // }

  const playlist = await Playlist.create({
    name: name,
    description: description,
    videos: [],
    owner: req.user._id,
  });

  if (!playlist) {
    throw new ApiError(
      500,
      "Something went wrong while creating the playlist."
    );
  }

  return res
    .status(201)
    .json(new ApiResponse(201, playlist, "Playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user Id");
  }

  const playlists = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videoDetails",
        pipeline: [
          {
            $project: {
              thumbnail: {
                url: "$thumbnail.url",
              },
              title: 1,
              description: 1,
              views: 1,
              duration: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        totalVideos: {
          $size: "$videoDetails",
        },
        totalDuration: {
          $sum: "$videoDetails.duration",
        },
      },
    },
    {
      $project: {
        name: 1,
        description: 1,
        totalVideos: 1,
        totalDuration: 1,
        videos: "$videoDetails",
        createdAt: 1,
        updatedAt: 1,
      },
    },
    {
      $sort: { createdAt: -1 },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, playlists, "Playlists fetched successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid Playlist Id");
  }

  const playlist = await Playlist.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(playlistId) },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videoDetails",
        pipeline: [
          {
            $match: {
              $or: [
                { isPublished: true },
                {
                  owner: new mongoose.Types.ObjectId(req.user._id),
                },
              ],
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "ownerDetails",
              pipeline: [
                {
                  $project: {
                    username: 1,
                    fullName: 1,
                    avatar: {
                      url: "$avatar.url",
                    },
                  },
                },
              ],
            },
          },
          {
            $unwind: "$ownerDetails",
          },
          {
            $project: {
              thumbnail: {
                url: "$thumbnail.url",
              },
              title: 1,
              duration: 1,
              views: 1,
              owner: "$ownerDetails",
              createdAt: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: {
                url: "$avatar.url",
              },
            },
          },
        ],
      },
    },
    {
      $unwind: "$ownerDetails",
    },
    {
      $addFields: {
        videoCount: { $size: "$videoDetails" },
        totalDuration: { $sum: "$videoDetails.duration" },
      },
    },
    {
      $project: {
        name: 1,
        description: 1,
        videoCount: 1,
        totalDuration: 1,
        videos: "$videoDetails",
        owner: "$ownerDetails",
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  if (!playlist.length) {
    throw new ApiError(404, "Playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist[0], "Playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid Playlist Id");
  }

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video Id");
  }

  const [playlist, video] = await Promise.all([
    Playlist.findById(playlistId),
    Video.findById(videoId),
  ]);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (
    !video.isPublished &&
    video.owner.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "Cannot add unpublished video to the playlist");
  }

  const updatedPlaylist = await Playlist.findOneAndUpdate(
    {
      _id: playlistId,
      owner: req.user._id,
      videos: { $ne: videoId },
    },
    {
      $addToSet: { videos: videoId },
    },
    { new: true }
  );

  if (!updatedPlaylist) {
    throw new ApiError(
      400,
      "Playlist not found, unauthorized, or video already exists in the playlist"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPlaylist,
        "Video added to playlist successfully"
      )
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id");
  }

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const updatedPlaylist = await Playlist.findOneAndUpdate(
    {
      _id: playlistId,
      owner: req.user._id,
      videos: videoId,
    },
    {
      $pull: { videos: videoId },
    },
    {
      new: true,
    }
  ).select("_id name videos");

  if (!updatedPlaylist) {
    throw new ApiError(
      404,
      "Playlist not found, unauthorized access, or video not present in playlist"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPlaylist,
        "Video removed from the playlist successfully"
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id");
  }

  const deletedPlaylist = await Playlist.findOneAndDelete({
    _id: playlistId,
    owner: req.user._id,
  });

  if (!deletedPlaylist) {
    throw new ApiError(404, "Playlist not found or access denied");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, { deletedPlaylist }, "Playlist deleted successfully")
    );
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id");
  }

  // validation (used before implementing zod)
  // if ([name, description].some((field) => !field || field?.trim() === "")) {
  //   throw new ApiError(400, "Name and Description both are required");
  // }

  const updatedPlaylist = await Playlist.findOneAndUpdate(
    {
      _id: playlistId,
      owner: req.user._id,
    },
    {
      name: name,
      description: description,
    },
    {
      new: true,
    }
  );

  if (!updatedPlaylist) {
    throw new ApiError(404, "Playlist not found or access denied");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, { updatedPlaylist }, "Playlist updated successfully")
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
