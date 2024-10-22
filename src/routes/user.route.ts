/** @format */

import express from "express";
import {
  deleteAccount,
  getUserProfile,
  getUsersList,
  loginUser,
  registerUser,
  reportUserAccount,
  searchUser,
  updateAccountPassword,
  updateUserAccount,
} from "../controllers/user.controller";
import authentication from "../middleware/authentication";
const router = express.Router();

/*** New user register ***/
router.post("/register", registerUser);

/*** User login ***/
router.post("/login", loginUser);

/*** Get user profile ***/
router.get("/", authentication, getUserProfile);

/*** Get all users list sorted by "active", "inactive" & "restricted" default should be all ***/
router.get("/list", authentication, getUsersList);

/*** Search user by name, email or username ***/
router.get("/search-user", authentication, searchUser);

/*** Update user profile ***/
router.put("/update-profile", authentication, updateUserAccount);

/*** Update user password ***/
router.patch("/update-password", authentication, updateAccountPassword);

/*** Delete account ***/
router.delete("/delete-account", authentication, deleteAccount);

/*** Report user account ***/
router.patch("/report-account/:id", reportUserAccount);

export default router;
