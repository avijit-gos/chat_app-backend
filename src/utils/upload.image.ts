/** @format */

import { v2 as cloudinary } from "cloudinary";
import cloudinaryInit from "../configs/cloudinary.config";

cloudinaryInit();

async function uploadImage(image: any): Promise<string> {
  const result = await cloudinary.uploader.upload(image, {
    folder: "chat_app",
  });
  return result.url;
}

export default uploadImage;
