import * as z from "zod";

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

export { videoBodySchema };
