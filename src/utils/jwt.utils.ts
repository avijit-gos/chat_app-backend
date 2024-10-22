/** @format */

import jwt from "jsonwebtoken";
import createError from "http-errors";
import IUser from "../interfaces/user.interface";

export const generateAuthenticationToken = async (
  user: IUser
): Promise<string | undefined> => {
  try {
    const token: string | undefined = await jwt.sign(
      {
        _id: user._id,
        accountType: user._id,
        status: user.status,
      },
      process.env.SECRET_KEY as string,
      { expiresIn: "365d" }
    );
    return token;
  } catch (error) {
    throw createError.BadRequest("Could not generate the user token");
  }
};
