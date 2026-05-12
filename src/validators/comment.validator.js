import * as z from "zod";
import { objectIdSchema } from "./objectId.validator.js";

const commentBodySchema = z.object({
  content: z
    .string({ error: "Content is required" })
    .trim()
    .min(1, "Content is required"),
});

const commentIdParamSchema = z.object({
  commentId: objectIdSchema,
});

export { commentBodySchema, commentIdParamSchema };
