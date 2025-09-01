"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserRoleservice = exports.getAllUsersService = exports.getUserById = void 0;
const redis_1 = require("../utils/redis");
const user_model_1 = __importDefault(require("../models/user.model"));
//get user by id
const getUserById = async (id, res) => {
    const userjson = await redis_1.redis.get(id);
    if (userjson) {
        const user = JSON.parse(userjson);
        res.status(201).json({ success: true, user });
    }
    else {
        // If user not found in Redis, try to get from database and save to Redis
        const user = await user_model_1.default.findById(id);
        if (user) {
            await redis_1.redis.set(id, JSON.stringify(user), "EX", 604800); // 7 days
            res.status(201).json({ success: true, user });
        }
        else {
            res.status(400).json({ success: false, message: "User not found" });
        }
    }
};
exports.getUserById = getUserById;
//get All users --->only for admin
const getAllUsersService = async (res) => {
    const users = await user_model_1.default.find().sort({ createdAt: -1 });
    res.status(201).json({ success: true, users });
};
exports.getAllUsersService = getAllUsersService;
//update user role -->Admin
const updateUserRoleservice = async (res, id, role) => {
    const user = await user_model_1.default.findByIdAndUpdate(id, { role }, { new: true });
    res.status(201).json({ success: true, user });
};
exports.updateUserRoleservice = updateUserRoleservice;
