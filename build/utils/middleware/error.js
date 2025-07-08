"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorMiddleWare = void 0;
const ErrorHandler_1 = __importDefault(require("../ErrorHandler"));
const ErrorMiddleWare = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";
    //wrong mongodbID
    if (err.name === "CastError") {
        const message = `Resource not found . Invalid:${err.path}`;
        err = new ErrorHandler_1.default(message, 400);
    }
    //duplicate key error
    if (err.name === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        err = new ErrorHandler_1.default(message, 400);
    }
    //jwt token error
    if (err.name === "JsonWebTokenError") {
        const message = `Json web token is invalid, try again `;
        err = new ErrorHandler_1.default(message, 400);
    }
    //JWT expired error
    if (err.name === "TokenExpiredError") {
        const message = `Json web token is expired , try again`;
        err = new ErrorHandler_1.default(message, 400);
    }
    res.status(err.statusCode).json({
        success: false,
        message: err.message,
    });
};
exports.ErrorMiddleWare = ErrorMiddleWare;
