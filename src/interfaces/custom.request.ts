/** @format */

import { Request } from "express";
interface CustomRequest extends Request {
  user?: any;
}

export default CustomRequest;
