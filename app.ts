import express, { Request, Response, NextFunction } from "express";
import createError from "http-errors";
import morgan from "morgan";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import userRoute from "./src/routes/authRoutes";
import transactionRoute from "./src/routes/transactionRoutes";
import budgetRoute from "./src/routes/budgetRoutes";
import notificationRoute from "./src/routes/notificationRoutes";
import potsRoute from "./src/routes/potRoutes";
import accountRoute from "./src/routes/accountRoutes";
import recurringBillRoute from "./src/routes/recurringBillRoutes";
import { errorHandler } from "./src/middleware/errorHandler";
import recurringTransactionWorker from "./src/workers/recurringTransactionWorker";
import helmet from "helmet";

dotenv.config();

export const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set security headers
app.use(helmet());
app.use(morgan("dev"));
app.use(
  cors({
    origin: ["http://localhost:3000", "https://finance-ai-app-rho.vercel.app"],
    credentials: true,
  })
);

// Serve static files from public directory
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Routes
app.use("/api/v1/auth", userRoute);
app.use("/api/v1/transactions", transactionRoute);
app.use("/api/v1/budgets", budgetRoute);
app.use("/api/v1/notifications", notificationRoute);
app.use("/api/v1/pots", potsRoute);
app.use("/api/v1/account", accountRoute);
app.use("/api/v1/recurring-bills", recurringBillRoute);

app.get("/", async (req: Request, res: Response, next: NextFunction) => {
  res.send({ message: "Awesome it works 🐻" });
});

// Start the recurring transaction worker
recurringTransactionWorker.start();

app.use((req: Request, res: Response, next: NextFunction) => {
  next(createError(404));
});

// Removed redundant helmet middleware application

app.use(errorHandler);
