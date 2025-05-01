import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import { ApiError } from "./utils/ApiError.js";
import cookieParser from "cookie-parser";
dotenv.config({
  path: ".env",
});

const app = express();
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:8080"],
    credentials: true,
    methods: ["PUT", "DELETE", "UPDATE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/v1/users", authRoutes);
app.use((err, req, res, next) => {
  console.error("💥 Error Middleware Triggered:", err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: err.success,
      message: err.message, // ✅ Add this line
      statusCode: err.statusCode,
      errors: err.errors || [], // ✅ Optional: only if you're using .errors in your ApiError
    });
  }

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    statusCode: 500,
  });
});

export default app;
