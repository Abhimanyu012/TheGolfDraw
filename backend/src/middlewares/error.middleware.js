import { ApiError } from "../utils/http.js";

export const notFoundHandler = (req, res, next) => {
  next(new ApiError(404, "Route not found"));
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};
