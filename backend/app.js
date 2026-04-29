import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./src/routes/auth.routes.js";
import subscriptionRoutes from "./src/routes/subscription.routes.js";
import scoreRoutes from "./src/routes/score.routes.js";
import charityRoutes from "./src/routes/charity.routes.js";
import drawRoutes from "./src/routes/draw.routes.js";
import winnerRoutes from "./src/routes/winner.routes.js";
import dashboardRoutes from "./src/routes/dashboard.routes.js";
import donationRoutes from "./src/routes/donation.routes.js";
import adminRoutes from "./src/routes/admin.routes.js";
import paymentRoutes from "./src/routes/payment.routes.js";
import { errorHandler, notFoundHandler } from "./src/middlewares/error.middleware.js";

const app = express();

// Emergency Health Check for Vercel Debugging
app.get("/api/ping", (req, res) => res.status(200).json({ status: "alive", time: new Date().toISOString() }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Static files handling for Vercel
const uploadsPath = path.resolve(__dirname, "uploads");
app.use("/uploads", express.static(uploadsPath));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/scores", scoreRoutes);
app.use("/api/charities", charityRoutes);
app.use("/api/draws", drawRoutes);
app.use("/api/winners", winnerRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);

app.get("/health", (req, res) => {
  console.log(req.method, req.host, req.url, new Date().toLocaleTimeString());
  res.json({ message: "this is health check server is ok" });
});

app.get("/", (req, res) => {
  res.json({ message: "TheGolfDraw API is running!" });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
