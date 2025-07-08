// app.ts

import express, { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { rateLimit } from "express-rate-limit";

import { ErrorMiddleWare } from "./utils/middleware/error";
import userRouter from "./routes/user.route";
import courseRouter from "./routes/course.route";
import orderRouter from "./routes/order.route";
import notificationRouter from "./routes/notification.route";
import layoutRouter from "./routes/layout.route";
import analyticsRouter from "./routes/analytics.route";

dotenv.config();

export const app = express();


app.set("trust proxy", true);


app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://e-learning-lms-frontend-theta.vercel.app",      
    ],
    credentials: true,
  })
);


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again in 15 minutes.",
  },
});
app.use(limiter);


const buildPath = path.join(__dirname, "../client/next");
app.use(express.static(buildPath));


app.use("/api/v1", userRouter);
app.use("/api/v1", courseRouter);
app.use("/api/v1", orderRouter);
app.use("/api/v1", notificationRouter);
app.use("/api/v1", analyticsRouter);
app.use("/api/v1", layoutRouter);

app.get("/test", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "API is working ✅",
  });
});

app.all("*", (req: Request, _res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});


app.use(ErrorMiddleWare);

export default app;
