import { Router } from "express";
import {
  forgotPassValidators,
  resendVerifcationEmailValidators,
  resetPassValidators,
  userloginValidators,
  userRegistrationvalidators,
} from "../validators/auth.validators.js";
import validators from "../middlewares/validations.middlewares.js";
import {
  forgotPass,
  getProfile,
  loginUser,
  logOut,
  resendverificationemail,
  resetCurrentPass,
  resetPass,
  userRegister,
  verifyUser,
} from "../controllers/auth.controllers.js";
import isloggedIn from "../middlewares/auth.middlewares.js";

const authRoutes = Router();
authRoutes.post(
  "/register",
  userRegistrationvalidators(),
  validators,
  userRegister,
);
authRoutes.get("/verify/:token", verifyUser);
authRoutes.post(
  "/resend-verifyEmail",
  resendVerifcationEmailValidators(),
  validators,
  resendverificationemail,
);
authRoutes.post("/login", userloginValidators(), validators, loginUser);
authRoutes.get("/getMe", isloggedIn, getProfile);
authRoutes.get("/logOut", isloggedIn, logOut);
authRoutes.get("/forgotPass", forgotPassValidators(), validators, forgotPass);
authRoutes.post(
  "/resetPass/:token",
  resetPassValidators(),
  validators,
  resetPass,
);
authRoutes.post(
  "/resetCurrentPass",
  resetPassValidators(),
  isloggedIn,
  validators,
  resetCurrentPass,
);
export default authRoutes;
