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
import categoryRoute from "./src/routes/categoryRoutes";
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
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.sendStatus(204);
});

app.use((req, res, next) => {
  console.log("Incoming Request:", req.method, req.path);
  console.log("Headers:", req.headers);
  next();
});

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:3000",
        "https://finance-ai-app-rho.vercel.app",
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
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
app.use("/api/v1/categories", categoryRoute);

app.get("/", async (req: Request, res: Response, next: NextFunction) => {
  res.send({ message: "Awesome it works 🐻" });
});

// Start the recurring transaction worker
recurringTransactionWorker.start();

app.use((req: Request, res: Response, next: NextFunction) => {
  next(createError(404));
});

app.use(errorHandler);
