import dotenv from "dotenv";
import connectDB from "./db/mongo.js";
import { app } from "./app.js";
import { cloudinaryConfiguration } from "./utils/cloudinary.js";
import { connectRedis, getRedisClient } from "./db/redis.js";

dotenv.config();

connectDB()
  .then(async () => {
    await connectRedis();

    if (process.env.NODE_ENV === "production") {
      app.set("trust proxy", 1);
    }

    cloudinaryConfiguration();

    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at port ${process.env.PORT}`);
    });

    app.on("error", (error) => {
      console.log("Error:", error);
      throw error;
    });
  })
  .catch((err) => {
    console.log("Mongo DB connection failed !!!", err);
  });

process.on("SIGINT", async () => {
  const redisClient = getRedisClient();

  await redisClient.quit();
  process.exit(0);
});
