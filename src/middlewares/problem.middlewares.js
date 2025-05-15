import { db } from "../db/db.js";
import { ApiError } from "../utils/ApiError.js";

export const checkUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log(`UserId=${userId}`);
    const user = await db.User.findUnique({
      where: {
        id: userId,
      },
      select: {
        role: true,
      },
    });
    console.log(user);
    if (!user || user.role !== "ADMIN") {
      console.log("error");
      throw new ApiError(404, "Only admin is allowed to make any change");
    }
    next();
  } catch (e) {
    console.log("Error in checking User role");
    throw new ApiError(404, "error in checking User role", e);
  }
};
