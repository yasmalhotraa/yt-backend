import * as z from "zod";
import { objectIdSchema } from "./objectId.validator.js";

const channelIdParamSchema = z.object({
  channelId: objectIdSchema,
});

const subscriberIdParamSchema = z.object({
  subscriberId: objectIdSchema,
});

export { channelIdParamSchema, subscriberIdParamSchema };
