// app.ts
import express from "express";
export const app = express();
import cookieParser from "cookie-parser";
import Cors from "cors";
require("dotenv").config();
import { Request, Response, NextFunction } from "express";
import { ErrorMiddleWare } from "./utils/middleware/error";
import userRouter from "./routes/user.route";
import courseRouter from "./routes/course.route";
import orderRouter from "./routes/order.route";
import notificationRouter from "./routes/notification.route";
import layoutRouter from "./routes/layout.route";
import analyticsRouter from "./routes/analytics.route";
import { rateLimit } from "express-rate-limit";
import path from "path";

app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(
  Cors({
    origin: [
      "http://localhost:3000",
      "https://e-learning-lms-frontend-theta.vercel.app",      
    ],
    credentials: true,
  })
);

// ✅ API rate limiting (before routes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes in mili-sec
  max: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});
app.use(limiter);

// ✅ Serve static files from the build folder in production
const buildPath = path.join(__dirname, "../client/next");
app.use(express.static(buildPath));

app.use("/api/v1", userRouter);
app.use("/api/v1", courseRouter);
app.use("/api/v1", orderRouter);
app.use("/api/v1", notificationRouter);
app.use("/api/v1", analyticsRouter);
app.use("/api/v1", layoutRouter);

app.get("/test", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "API is working",
  });
});


app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});

// ✅ Global Error Handler Middleware
app.use(ErrorMiddleWare);


// Export for Vercel (Important)
export default app;