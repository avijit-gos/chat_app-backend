/** @format */

import mongoose from "mongoose";

function DBInit() {
  mongoose.connect(process.env.DB_URL as string);
  mongoose.connection.on("error", () => {
    console.log("DB is not connected");
  });
  mongoose.connection.on("connected", () => {
    console.log("DB successfully connected");
  });
}

export default DBInit;
