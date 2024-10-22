/** @format */

import bcrypt from "bcrypt";
import createError from "http-errors";

export const hashUserPassword = async (
  password: string
): Promise<string | undefined> => {
  try {
    const hash: string | undefined = await bcrypt.hash(password, 10);
    return hash;
  } catch (error) {
    throw createError.BadRequest("Could not generate hash password");
  }
};

export const compareUserPassword = async (
  password: string,
  userPassword: string
): Promise<boolean | undefined> => {
  try {
    const result: boolean | undefined = await bcrypt.compare(
      password,
      userPassword
    );
    return result;
  } catch (error) {
    throw createError.BadRequest("Could not generate hash password");
  }
};
