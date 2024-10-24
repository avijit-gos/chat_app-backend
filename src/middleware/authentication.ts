/** @format */

import { Response, NextFunction } from "express";
import createError from "http-errors";
import jwt from "jsonwebtoken";
import CustomRequest from "../interfaces/custom.request";
import userModel from "../models/user.model";
import IUser from "../interfaces/user.interface";

async function authentication(
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token: string | undefined =
      req.body.token || req.headers["x-access-token"];
    if (!token) throw createError.BadRequest("Token not found");
    const verify = await jwt.verify(token, process.env.SECRET_KEY as string);
    req.user = verify;
    const user: IUser | null = await userModel
      .findById(req.user._id)
      .select("status");
    if (!user) throw createError.BadRequest("No user data found");
    if (user && user.status !== "active")
      throw createError.BadRequest("User profile is not active");
    next();
  } catch (error) {
    next(error);
  }
}

export default authentication;
