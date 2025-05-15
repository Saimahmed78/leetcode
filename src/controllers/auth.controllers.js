import { db } from "../db/db.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asynchandler.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();
import {
  emailVerificationConfirmationContent,
  emailVerificationContent,
  resendEmailVerificationContent,
  resetPasswordEmailContent,
  sendMail,
} from "../utils/mail.js";
import { userRole } from "../generated/prisma/index.js";
const userRegister = asyncHandler(async (req, res) => {
  // get email and password from the user
  const { name, email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  // then find the user by email
  const existingUser = await db.User.findUnique({ where: { email } });
  // if user exist then send error
  if (existingUser)
    throw new ApiError(409, "Validation failed", ["User already exist"]);
  // if not exist then create verification token and verificationCreate a user
  const token = crypto.randomBytes(62).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const tokenExpiry = new Date(Date.now() + 5 * 60 * 1000);

  const newUser = await db.User.create({
    data: {
      email,
      password: hashedPassword,
      name,
      verificationToken: hashedToken,
      verificationTokenExpiry: tokenExpiry,
      role: role || userRole.MEMBER,
    },
  });

  //Check if the tokens are generated ,
  if (!newUser.verificationToken && !newUser.verificationTokenExpiry) {
    throw new ApiError(400, "User registration is failed", [
      "Verification token failed",
      "Verifcation Token expiry failed",
    ]);
  }

  //send Mail
  const verificationURL = `${process.env.BASE_URL}/api/v1/users/verify/${token}`;
  try {
    await sendMail({
      email: newUser.email,
      subject: "User Verification Email",
      mailGenContent: emailVerificationContent(name, verificationURL),
    });
  } catch (err) {
    throw new ApiError(400, "Email Verification failed", err);
  }
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "User is registered and Verification Email sent successfully",
      ),
    );
});
const verifyUser = asyncHandler(async (req, res) => {
  // get token from req.params
  console.log("reached verfiy User ");
  const { token } = req.params;

  // validate it
  if (!token) {
    throw new ApiError(404, "Token not found");
  }
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // find user by token
  const userToVerify = await db.User.findFirst({
    where: {
      verificationToken: hashedToken,
      verificationTokenExpiry: { gt: new Date() },
    },
  });

  // if user do not exist send error
  if (!userToVerify) {
    throw new ApiError(404, "User not found. Maybe Token is invalid");
  }
  // if user exist empty the tokens
  await db.User.update({
    where: {
      id: userToVerify.id,
    },
    data: {
      verificationToken: null,
      isVerified: true,
      verificationTokenExpiry: null,
    },
  });
  const name = userToVerify.name;

  try {
    await sendMail({
      email: userToVerify.email,
      subject: "Email Verification Confirmation",
      mailGenContent: emailVerificationConfirmationContent(name),
    });
  } catch (error) {
    throw new ApiError(400, "Email Verification Confirmation email not sent");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "User is verified Successfully"));
});
const resendverificationemail = asyncHandler(async (req, res) => {
  // get email from req.body
  const { email } = req.body;

  // find user by token
  const userToVerify = await db.User.findUnique({ where: { email } });

  // if user do not exist send error
  if (!userToVerify) {
    throw new ApiError(404, "User not found. Please register your account ");
  }
  // Check if the User is verified
  if (userToVerify.isVerified) {
    throw new ApiError(400, "User is Already verified");
  }

  // if user exist create the tokens
  const token = crypto.randomBytes(62).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const tokenExpiry = new Date(Date.now() + 5 * 60 * 1000);
  // save in db
  await db.User.update({
    where: {
      id: userToVerify.id,
    },
    data: {
      verificationToken: hashedToken,
      verificationTokenExpiry: tokenExpiry,
    },
  });
  const name = userToVerify.name;

  // send email to User
  const verificationURL = `${process.env.BASE_URL}/api/v1/users/verify/${token}`;
  try {
    await sendMail({
      email: userToVerify.email,
      subject: "User Resend Verification Email",
      mailGenContent: resendEmailVerificationContent(name, verificationURL),
    });
  } catch (err) {
    throw new ApiError(400, "Email Verification failed", err);
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "User verification Email Sent Successfully"));
});
const loginUser = asyncHandler(async (req, res) => {
  // get email and password from the req.body
  const { email, password } = req.body;
  // find user by email
  const loggedinUser = await db.User.findUnique({ where: { email } });
  // if no then send err
  if (!loggedinUser) {
    throw new ApiError(404, "Email or Password is incorrect");
  }
  // if yes then matches given password with User's password
  const isValid = await bcrypt.compare(password, loggedinUser.password);
  //if no then send err
  if (!isValid) {
    throw new ApiError(404, "Email or Password is incorrect");
  }
  //if yes then generate Access and refresh token
  const refreshToken = jwt.sign(
    {
      id: loggedinUser.id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "15m" },
  );
  const accessToken = jwt.sign(
    {
      id: loggedinUser.id,
      password: loggedinUser.password,
      email: loggedinUser.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" },
  );
  //save access token in cookies
  const accessTokenCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 10 * 60 * 1000,
  };

  res.cookie("AccessToken", accessToken, accessTokenCookieOptions);
  //save refresh token in cookies
  const refreshTokenCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 20 * 60 * 1000,
  };

  res.cookie("RefreshToken", refreshToken, refreshTokenCookieOptions);
  //save refresh token in database
  loggedinUser.refreshToken = refreshToken;

  // save the user
  await db.User.update({
    where: {
      id: loggedinUser.id,
    },
    data: {
      refreshToken: refreshToken,
    },
  });
  res.status(200).json(new ApiResponse(200, " User is logged In"));
});
const getProfile = asyncHandler(async (req, res) => {
  const loggedinUser = await db.User.findUnique({ where: { id: req.user.id } });
  if (!loggedinUser) {
    throw new ApiError(404, "User is logged Out");
  }
  return res.status(200).json(new ApiResponse(200, "You are on Profile Page "));
});
const logOut = asyncHandler(async (req, res) => {
  //  find the user by id
  const loggedinUser = await db.User.findUnique({ where: { id: req.user.id } });

  // if user not found throw error
  if (!loggedinUser) {
    throw new ApiError(404, "User not found");
  }
  // if find then delete the cookies
  const accessTokenCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  };
  res.clearCookie("AccessToken", accessTokenCookieOptions);
  const refreshTokenCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 20 * 60 * 1000,
  };
  res.clearCookie("RefreshToken", refreshTokenCookieOptions);

  return res.status(200).json(new ApiResponse(200, "User is loggedOut"));
});
const forgotPass = asyncHandler(async (req, res) => {
  // get email from req.body
  const { email } = req.body;
  // find user by email
  const user = await db.User.findUnique({ where: { email } });
  // if user not exist throw error
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const name = user.name;
  // if exist generate tokens
  const token = crypto.randomBytes(62).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000);
  // save in db
  await db.User.update({
    where: { id: user.id },
    data: {
      forgotPasswordToken: hashedToken,
      forgotPasswordExpiry: tokenExpiry,
    },
  });

  // send email
  const resetPassUrl = `${process.env.BASE_URL}/api/v1/users/forgotPass/${token}`;
  await sendMail({
    email: user.email,
    subject: " Reset Password Email",
    mailGenContent: resetPasswordEmailContent(name, resetPassUrl),
  });
  res.status(200).json(new ApiResponse(200, "Email send Successfully"));
});
const resetPass = asyncHandler(async (req, res) => {
  // get token from req.params
  const { token } = req.params;
  // get password,confirm Password from req.body
  const { password, confirmPassword } = req.body;
  if (!token) {
    throw new ApiError(404, "Token not found");
  }
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const resetPassUser = await db.User.findUnique({
    where: {
      forgotPasswordToken: hashedToken,
      forgotPasswordExpiry: { gt: new Date() },
    },
  });
  if (!resetPassUser) {
    throw new ApiError(404, "User not found");
  }
  const bcryptPass = await bcrypt.hash(password, 10);
  await db.User.update({
    where: {
      id: resetPassUser.id,
    },
    data: {
      forgotPasswordToken: null,
      forgotPasswordExpiry: null,
      password: bcryptPass,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Password changed Successfully"));
});
const resetCurrentPass = asyncHandler(async (req, res) => {
  const { password, confirmPassword } = req.body;
  const loggedinUser = await db.User.findUnique({ where: { id: req.user.id } });

  if (!loggedinUser) {
    throw new ApiError(404, "User not found");
  }
  const bcryptPass = await bcrypt.hash(password, 10);

  await db.User.update({
    where: {
      id: loggedinUser.id,
    },
    data: {
      password: bcryptPass,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Password Changed Successfully"));
});
export {
  userRegister,
  verifyUser,
  resendverificationemail,
  loginUser,
  logOut,
  getProfile,
  forgotPass,
  resetPass,
  resetCurrentPass,
};
