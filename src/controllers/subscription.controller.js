import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription

  // validation (used before implementing zod)
  // if (!isValidObjectId(channelId)) {
  //   throw new ApiError(400, "Please provide a valid channelId");
  // }

  const subscriptionStatus = await Subscription.deleteOne({
    subscriber: req.user?._id,
    channel: channelId,
  });

  let isSubscribed;

  if (subscriptionStatus.deletedCount > 0) {
    isSubscribed = false;
  } else {
    isSubscribed = true;

    await Subscription.create({
      subscriber: req.user?._id,
      channel: channelId,
    });
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isSubscribed },
        "Subscription toggled successfully"
      )
    );
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  // validation (used before implementing zod)
  // if (!isValidObjectId(channelId)) {
  //   throw new ApiError(400, "Please provide a valid channel Id");
  // }

  // const subscribers = await Subscription.find({ channel: channelId });

  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriberInfo",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: {
                url: 1,
              },
            },
          },
        ],
      },
    },
    {
      $unwind: "$subscriberInfo",
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channelInfo",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: {
                url: 1,
              },
            },
          },
        ],
      },
    },
    {
      $unwind: "$channelInfo",
    },
    {
      $group: {
        _id: "$channel",
        channel: { $first: "$channelInfo" },
        subscribers: {
          $push: "$subscriberInfo",
        },
      },
    },
    {
      $project: {
        _id: 0,
        subscribers: 1,
        channel: 1,
      },
    },
  ]);

  if (!subscribers || subscribers.length === 0) {
    throw new ApiError(400, "No subscribers found under this channel");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribers[0],
        "Channel subscribers fetched successfully"
      )
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  // validation (used before implementing zod)
  // if (!isValidObjectId(subscriberId)) {
  //   throw new ApiError(400, "Subscriber id is not valid");
  // }

  const channels = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriberInfo",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: {
                url: 1,
              },
            },
          },
        ],
      },
    },
    {
      $unwind: "$subscriberInfo",
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channelInfo",
        pipeline: [
          {
            $project: {
              fullName: 1,
              username: 1,
              avatar: {
                url: 1,
              },
            },
          },
        ],
      },
    },
    {
      $unwind: "$channelInfo",
    },
    {
      $group: {
        _id: "$subscriber",
        subscriber: { $first: "$subscriberInfo" },
        channels: {
          $push: "$channelInfo",
        },
      },
    },
    {
      $project: {
        _id: 0,
        subscriber: 1,
        channels: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        channels[0],
        "Subscribed channels fetched successfully"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
