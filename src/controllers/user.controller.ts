/** @format */

import mongoose from "mongoose";
import IUser from "../interfaces/user.interface";
import userModel from "../models/user.model";
import { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import { compareUserPassword, hashUserPassword } from "../utils/bcrypt.utils";
import { generateAuthenticationToken } from "../utils/jwt.utils";
import CustomRequest from "../interfaces/custom.request";
import uploadImage from "../utils/upload.image";
import fileUpload from "express-fileupload";

/*** New user register ***/
export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, username, email, password } = req.body;
    /*** Check user inputs ***/
    if (!name.trim())
      throw createError.BadRequest("Please! provide the user name");
    if (!username.trim())
      throw createError.BadRequest("Please! provide the username");
    if (!email.trim())
      throw createError.BadRequest("Please! provide the user email");
    if (!password.trim())
      throw createError.BadRequest("Please! provide the user password");

    /*** Check is there any user present in the DB with same email or username ***/
    const isUserExists: IUser | null = await userModel.findOne({
      $or: [{ email }, { username }],
    });

    if (isUserExists && isUserExists.email === email) {
      throw createError.BadRequest("User with same email already exists");
    }
    if (isUserExists && isUserExists.username === username)
      throw createError.BadRequest("User with same username already exists");

    /*** If user does not exists ***/
    /*** Hash user password ***/
    const hashPassword: string | undefined = await hashUserPassword(password);
    /*** Create a new user instance ***/
    const newUser = new userModel({
      _id: new mongoose.Types.ObjectId(),
      name,
      email,
      username,
      password: hashPassword,
    });
    const user: IUser | null = await newUser.save();
    /*** Create token for the user ***/
    const token: string | undefined = await generateAuthenticationToken(user);
    res.status(201).json({
      message: "User successfully registered",
      status: 201,
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
};

/*** User login ***/
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userInfo, password } = req.body;
    if (!userInfo.trim())
      throw createError.BadRequest(
        "Please! provide username or email for login"
      );
    if (!password.trim())
      throw createError.BadRequest("Please! provide the account password");

    /*** Check is there any user present in the DB with same email or username ***/
    const isUserExists: IUser | null = await userModel.findOne({
      $or: [{ email: userInfo }, { username: userInfo }],
    });
    /*** If user does not exists with the given email or username ***/
    if (!isUserExists) throw createError.BadRequest("User does not exists");

    /*** If user exists then check the provided password ***/
    const isPasswordCorrect: boolean | undefined = await compareUserPassword(
      password,
      isUserExists.password
    );
    /*** If account password is not correct ***/
    if (!isPasswordCorrect)
      throw createError.BadRequest("Account password is not correct");
    /*** If password is correct then generate user authentication token ***/
    const token: string | undefined = await generateAuthenticationToken(
      isUserExists
    );
    res.status(200).json({
      message: "User successfully loggedIn",
      status: 200,
      user: isUserExists,
      token,
    });
  } catch (error) {
    next(error);
  }
};

/*** Get user profile ***/
export const getUserProfile = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user: IUser | null = await userModel
      .findById(req.user._id)
      .select("-password");
    if (!user) throw createError.BadRequest("No user found");
    if (user && req.user.accountType === "user" && user.accountType === "admin")
      throw createError.BadRequest("You cannot view the admin profile");
    res
      .status(200)
      .json({ message: "Successfully fetch user account", status: 200, user });
  } catch (error) {
    next(error);
  }
};

/*** Get all users list sorted by "active", "inactive" & "restricted" default should be all ***/
export const getUsersList = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page: number = Number(req.query.page) || 1;
    const limit: number = Number(req.query.limit) || 10;
    const users: IUser[] | null = await userModel
      .find({ $and: [{ status: "active" }, { _id: { $ne: req.user._id } }] })
      .select("name username profileImage email")
      .limit(limit)
      .skip(limit * (page - 1));
    res
      .status(200)
      .json({ message: "Get all users list", status: 200, users: users });
  } catch (error) {
    next(error);
  }
};

/*** Search user by name, email or username ***/
export const searchUser = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page: number = Number(req.query.page) || 1;
    const limit: number = Number(req.query.limit) || 10;
    const operations = req.query.value
      ? {
          $and: [
            {
              $or: [
                { name: { $regex: req.query.value, $options: "i" } },
                { username: { $regex: req.query.value, $options: "i" } },
                { email: { $regex: req.query.value, $options: "i" } },
              ],
            },
            { status: "active" },
            { _id: { $ne: req.user._id } },
          ],
        }
      : {
          $and: [{ status: "active" }, { _id: { $ne: req.user._id } }],
        };
    const users: IUser[] | [] = await userModel
      .find(operations)
      .select("name username email profileImage")
      .limit(limit)
      .skip(limit * (page - 1))
      .sort({ createdAt: -1 });
    res.status(200).json({
      message: req.query.value
        ? `Lists of all users for search value ${req.query.value}`
        : "Get all users list",
      status: 200,
      users,
    });
  } catch (error) {
    next(error);
  }
};

/*** Update user profile ***/
export const updateUserAccount = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const originalUserData: IUser | null = await userModel.findById(
      req.user._id
    );
    if (!originalUserData) throw createError.BadRequest("No user data found");
    let imageURL: string | undefined = "";
    if (req.files && req.files.image) {
      const image = req.files && (req.files.image as fileUpload.UploadedFile); // Type assertion
      imageURL = await uploadImage(image.tempFilePath);
    }
    const updateProfileData: IUser | null = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          name: req.body.name || originalUserData.name,
          bio: req.body.bio || originalUserData.bio,
          profileImage: imageURL || originalUserData.profileImage,
        },
      },
      { new: true }
    );
    res.status(200).json({
      message: "Account details has been updated",
      status: 200,
      user: updateProfileData,
    });
  } catch (error) {
    next(error);
  }
};

/*** Update user password ***/
export const updateAccountPassword = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { password, newPassword, confirmPassword } = req.body;
    if (!password)
      throw createError.BadRequest("Please! provide the old password");
    if (!newPassword)
      throw createError.BadRequest("Please! provide the new password");
    if (!confirmPassword)
      throw createError.BadRequest("Please! provide the confirm password");
    if (newPassword !== confirmPassword)
      throw createError.BadRequest(
        "New password & confirm password did not matched"
      );
    const isUserExists: IUser | null = await userModel
      .findById(req.user._id)
      .select("password");
    if (!isUserExists) throw createError.BadRequest("No user found");

    const checkPassword: boolean | undefined = await compareUserPassword(
      password,
      isUserExists.password
    );
    if (!checkPassword)
      throw createError.BadRequest("Provided password is not correct");
    const hashPassword: string | undefined = await hashUserPassword(
      newPassword
    );
    const updatedAccountPassword: IUser | null =
      await userModel.findByIdAndUpdate(
        req.user._id,
        { $set: { password: hashPassword } },
        { new: true }
      );
    res
      .status(200)
      .json({ message: "Account password has been changed", status: 200 });
  } catch (error) {
    next(error);
  }
};

/*** Delete account ***/
export const deleteAccount = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deletedProfile: IUser | null = await userModel.findByIdAndUpdate(
      req.user._id,
      { $set: { status: "inactive" } },
      { new: true }
    );
    res.status(200).json({ message: "Account has been deleted", status: 200 });
  } catch (error) {
    next(error);
  }
};

/*** Report user account ***/
export const reportUserAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
  } catch (error) {
    next(error);
  }
};
