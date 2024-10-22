/** @format */

import mongoose from "mongoose";
import IUser from "../interfaces/user.interface";

const UserSchema = new mongoose.Schema<IUser>(
  {
    _id: { type: mongoose.Schema.Types.ObjectId },
    name: {
      type: String,
      trim: true,
      required: [true, "User name is required"],
    },
    username: {
      type: String,
      trim: true,
      required: [true, "Username is required"],
      unique: true,
    },
    email: {
      type: String,
      trim: true,
      required: [true, "User email is required"],
      unique: true,
    },
    password: {
      type: String,
      trim: true,
      required: [true, "User password is required"],
    },
    bio: { type: String, default: "" },
    profileImage: { type: String, default: "" },
    accountType: { type: String, enum: ["user", "admin"], default: "user" },
    status: {
      type: String,
      enum: ["active", "inactive", "restricted"],
      default: "active",
    },
    reports: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isVerify: { type: Boolean, default: false },
  },
  { timestamps: true }
);

UserSchema.index({ name: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
export default mongoose.model("User", UserSchema);
