/** @format */

import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import fileUpload from "express-fileupload";
import createError from "http-errors";
import DBInit from "./configs/DB.config";
import logger from "./logger/logger";

dotenv.config();
DBInit();
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(
  fileUpload({
    useTempFiles: true, // Ensure the files are stored temporarily
    tempFileDir: "/tmp/", // Temp folder to store uploaded files
  })
);

//*** Importing user API ***//
import UserRoute from "./routes/user.route";
app.use("/api/users", UserRoute);

app.use(async (req, res, next) => {
  next(createError.NotFound("Page not found"));
});
// Error message
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error({
    message: err.message,
    url: req.url,
    method: req.method,
  });
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  });
});

const port = (process.env.PORT as string) || 3030;

app.listen(port, () => {
  console.log(`Server listening on port:${port}`);
});
