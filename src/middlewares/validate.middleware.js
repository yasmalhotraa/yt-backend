import { ApiError } from "../utils/ApiError.js";

const validate = (schema) => {
  return (req, _, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return next(new ApiError(400, "Validation Failed", errors));
    }
    req.body = result.data;

    next();
  };
};

export { validate };
