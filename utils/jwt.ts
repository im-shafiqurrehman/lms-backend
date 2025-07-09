require("dotenv").config();
import { Iuser } from "../models/user.model";
import { Response } from "express";
import { redis } from "./redis";

interface ITokenOptions {
  expires: Date;
  maxAge: number;
  httpOnly: boolean;
  sameSite: "lax" | "strict" | "none" | undefined;
  secure?: boolean;
  path?: string;
}

const accessTokenExpire = parseInt(
  process.env.ACCESS_TOKEN_EXPIRE || "300",
  10
);
const RefreshTokenExpire = parseInt(
  process.env.REFRESH_TOKEN_EXPIRE || "1200",
  10
);

const isProduction = process.env.NODE_ENV === "production";
const isSecureContext = process.env.NODE_ENV === "production";

export const accessTokenOptions: ITokenOptions = {
  expires: new Date(Date.now() + accessTokenExpire * 60 * 60 * 1000),
  maxAge: accessTokenExpire * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: isSecureContext ? "none" : "lax",
  secure: isSecureContext,
  path: "/",
};

export const refreshTokenOptions: ITokenOptions = {
  expires: new Date(Date.now() + RefreshTokenExpire * 24 * 60 * 60 * 1000),
  maxAge: RefreshTokenExpire * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: isSecureContext ? "none" : "lax",
  secure: isSecureContext,
  path: "/",
};
export const sendToken = (user: Iuser, statusCode: number, res: Response) => {
  const accessToken = user.SignAccessToken();
  const refreshToken = user.SignRefreshToken();

  //upload session to redis
  redis.set(user._id, JSON.stringify(user) as any);

  // Debug logging for production
  if (process.env.NODE_ENV === "production") {
    console.log("🔍 SendToken Debug - Setting cookies for user:", user._id);
    console.log("🔍 SendToken Debug - Access token options:", accessTokenOptions);
    console.log("🔍 SendToken Debug - Refresh token options:", refreshTokenOptions);
  }

  console.log("Login successful");
  res.cookie("access_token", accessToken, accessTokenOptions);
  res.cookie("refresh_token", refreshToken, refreshTokenOptions);

  res.status(statusCode).json({ success: true, user, accessToken });
};
