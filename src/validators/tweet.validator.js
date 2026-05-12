import * as z from "zod";
import { objectIdSchema } from "./objectId.validator.js";

const tweetContentSchema = z.object({
  content: z
    .string({ error: "Content is required" })
    .trim()
    .min(10, "Content should be more than 10 characters")
    .max(300, "Content should not be more than 300 characters"),
});

const tweetIdParamSchema = z.object({
  tweetId: objectIdSchema,
});

const userIdParamSchema = z.object({
  userId: objectIdSchema,
});

export { tweetContentSchema, tweetIdParamSchema, userIdParamSchema };
