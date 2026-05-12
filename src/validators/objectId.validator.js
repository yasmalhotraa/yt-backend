import * as z from "zod";
import mongoose from "mongoose";

const objectIdSchema = z.string().refine(
  (value) => {
    return mongoose.Types.ObjectId.isValid(value);
  },
  {
    message: "Invalid ObjectId",
  }
);

export { objectIdSchema };
