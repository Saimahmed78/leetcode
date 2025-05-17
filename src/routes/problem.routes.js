import express from "express";
import isloggedIn from "../middlewares/auth.middlewares.js";
import { checkUser } from "../middlewares/problem.middlewares.js";
import {
  createProblem,
  deleteProblem,
  getAllProblems,
  getProblemById,
  updateProblem,
} from "../controllers/problem.controllers.js";

const problemRoutes = express();

problemRoutes.post("/create-problem", isloggedIn, checkUser, createProblem);
problemRoutes.get("/get-problems", isloggedIn, getAllProblems);
problemRoutes.get("/get-problems-by-id/:id", isloggedIn, getProblemById);
problemRoutes.delete("/get-problems-by-id/:id", isloggedIn, deleteProblem);
problemRoutes.put("/update-problem/:id", isloggedIn, updateProblem);

export default problemRoutes;
