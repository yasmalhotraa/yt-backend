import { ApiError } from "../utils/ApiError.js";

const validate = ({
  body: bodySchema,
  params: paramsSchema,
  query: querySchema,
} = {}) => {
  return (req, _, next) => {
    const validationErrors = [];

    // validate body
    if (bodySchema) {
      const result = bodySchema.safeParse(req.body);

      if (!result.success) {
        validationErrors.push(
          ...result.error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          }))
        );
      } else {
        req.body = result.data;
      }
    }

    // validate params
    if (paramsSchema) {
      const result = paramsSchema.safeParse(req.params);

      if (!result.success) {
        validationErrors.push(
          ...result.error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          }))
        );
      } else {
        req.params = result.data;
      }
    }

    // validate query
    if (querySchema) {
      const result = querySchema.safeParse(req.query);

      if (!result.success) {
        validationErrors.push(
          ...result.error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          }))
        );
      } else {
        Object.assign(req.query, result.data);
      }
    }

    if (validationErrors.length > 0) {
      return next(new ApiError(400, "Validation Failed", validationErrors));
    }

    next();
  };
};

export { validate };
