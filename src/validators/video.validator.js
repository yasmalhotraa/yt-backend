import * as z from "zod";
import { objectIdSchema } from "./objectId.validator.js";

const videoBodySchema = z.object({
  title: z
    .string({ error: "Video title is required" })
    .trim()
    .min(2, "Title should be at least 2 characters"),
  description: z
    .string({ error: "Video description is required" })
    .trim()
    .min(5, "Description should be at least 5 characters")
    .max(300, "Description should be not more than 300 characters "),
});

const videoIdParamSchema = z.object({
  videoId: objectIdSchema,
});

const getAllVideosQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(50).default(10),

  query: z.string().trim().optional(),

  sortBy: z.enum(["createdAt", "views", "title"]).default("createdAt"),

  sortType: z.enum(["asc", "desc"]).default("desc"),

  userId: objectIdSchema.optional(),
});

export { videoBodySchema, videoIdParamSchema, getAllVideosQuerySchema };
