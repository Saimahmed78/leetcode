import express from "express";
import dotenv from "dotenv";
import cors from "cors";
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

export default app;
