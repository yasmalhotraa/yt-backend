import { createClient } from "redis";

let redisClient = null;

export const connectRedis = async () => {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL,
    });

    redisClient.on("error", (err) => {
      console.log("Redis Client Error:", err);
    });

    redisClient.on("connect", () => {
      console.log("Redis connected successfully");
    });
  }

  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};

export const getRedisClient = () => {
  if (!redisClient) {
    throw new Error("Redis client is not initialized");
  }

  return redisClient;
};
