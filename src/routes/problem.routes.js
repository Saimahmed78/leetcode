import express from "express";
import isloggedIn from "../middlewares/auth.middlewares.js";
import { checkUser } from "../middlewares/problem.middlewares.js";
import { createProblem } from "../controllers/problem.controllers.js";

const problemRoutes = express();

problemRoutes.post("/problem", isloggedIn, checkUser, createProblem);

export default problemRoutes;
