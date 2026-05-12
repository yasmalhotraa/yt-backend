import * as z from "zod";
import { objectIdSchema } from "./objectId.validator.js";

const playlistBodySchema = z.object({
  name: z
    .string({ error: "Playlist name is required" })
    .trim()
    .min(2, "Playlist name should be at least 2 characters"),

  description: z
    .string({ error: "Description is required" })
    .trim()
    .min(5, "Description should be at least 5 characters")
    .max(300, "Description should be not more than 300 characters "),
});

const playlistIdParamSchema = z.object({
  playlistId: objectIdSchema,
});

const userIdParamSchema = z.object({
  userId: objectIdSchema,
});

const playlistVideoParamSchema = z.object({
  playlistId: objectIdSchema,
  videoId: objectIdSchema,
});

export {
  playlistBodySchema,
  playlistIdParamSchema,
  userIdParamSchema,
  playlistVideoParamSchema,
};
