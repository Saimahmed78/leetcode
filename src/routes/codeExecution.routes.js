import express from "express";
import isloggedIn from "../middlewares/auth.middlewares.js";
import { codeExecution } from "../controllers/codeExecution.controllers.js";

const executionRoutes = express.Router();

executionRoutes.post("/code-execution", isloggedIn, codeExecution);
export default executionRoutes;
