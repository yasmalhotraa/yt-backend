import * as z from "zod";

const tweetContentSchema = z.object({
  content: z
    .string({ required_error: "Content is required" })
    .trim()
    .min(10, "Content should be more than 10 characters")
    .max(300, "Content should not be more than 300 characters"),
});

export { tweetContentSchema };
