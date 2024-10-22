/** @format */

import mongoose from "mongoose";

interface IUser {
  readonly _id: mongoose.Schema.Types.ObjectId;
  name: string;
  username: string;
  email: string;
  password: string;
  profileImage: string;
  bio: string;
  accountType: "user" | "admin";
  status: "active" | "inactive" | "restricted";
  reports: mongoose.Schema.Types.ObjectId[];
  isVerify: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
export default IUser;
