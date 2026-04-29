import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const JWT_EXPIRE = process.env.JWT_EXPIRE || "7d";

export const signToken = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRE });

export const verifyToken = (token) => jwt.verify(token, JWT_SECRET);
