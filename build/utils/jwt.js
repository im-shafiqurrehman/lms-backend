"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToken = exports.refreshTokenOptions = exports.accessTokenOptions = void 0;
require("dotenv").config();
const redis_1 = require("./redis");
const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRE || "300", 10);
const RefreshTokenExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRE || "1200", 10);
const isProduction = process.env.NODE_ENV === "production";
const isSecureContext = process.env.NODE_ENV === "production";
exports.accessTokenOptions = {
    expires: new Date(Date.now() + accessTokenExpire * 60 * 60 * 1000),
    maxAge: accessTokenExpire * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: isSecureContext ? "none" : "lax",
    secure: isSecureContext,
    path: "/",
};
exports.refreshTokenOptions = {
    expires: new Date(Date.now() + RefreshTokenExpire * 24 * 60 * 60 * 1000),
    maxAge: RefreshTokenExpire * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: isSecureContext ? "none" : "lax",
    secure: isSecureContext,
    path: "/",
};
const sendToken = (user, statusCode, res) => {
    const accessToken = user.SignAccessToken();
    const refreshToken = user.SignRefreshToken();
    //upload session to redis
    redis_1.redis.set(user._id, JSON.stringify(user));
    // Debug logging for production
    if (process.env.NODE_ENV === "production") {
        console.log("🔍 SendToken Debug - Setting cookies for user:", user._id);
        console.log("🔍 SendToken Debug - Access token options:", exports.accessTokenOptions);
        console.log("🔍 SendToken Debug - Refresh token options:", exports.refreshTokenOptions);
    }
    console.log("Login successful");
    res.cookie("access_token", accessToken, exports.accessTokenOptions);
    res.cookie("refresh_token", refreshToken, exports.refreshTokenOptions);
    res.status(statusCode).json({ success: true, user, accessToken });
};
exports.sendToken = sendToken;
