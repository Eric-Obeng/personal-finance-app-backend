import express, { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import morgan from "morgan";
import dotenv from "dotenv";
import cors from "cors";
import userRoute from "./src/routes/authRoutes";
import { errorHandler } from "./src/middleware/errorHandler";

dotenv.config();

export const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use(cors()); // Use cors middleware
app.use("/api/v1/auth", userRoute);

app.get("/", async (req: Request, res: Response, next: NextFunction) => {
  res.send({ message: "Awesome it works 🐻" });
});

app.use((req: Request, res: Response, next: NextFunction) => {
  next(createError(404));
});

app.use(errorHandler);
