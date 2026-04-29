import { ApiError } from "../utils/http.js";

export const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return next(new ApiError(403, "Forbidden"));
  }

  next();
};
