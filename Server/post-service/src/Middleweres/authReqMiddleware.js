import { logger } from "../Utils/loggerUtil.js";

export const authReq = (req, res, next) => {
  try {
    const userID = req.headers["x-user-id"];
    if (!userID) {
      logger.warn("Access failded due to absence of UserID");
      return res.status(401).json({
        success: true,
        message: "Access failded due to absence of UserID",
      });
    }
    req.user = {userID}
    next()
  } catch (e) {
    logger.error("Error in Authentication request Middleware", e);
    return res.status(500).json({
      success: true,
      message: "Error in Authentication request Middleware",
    });
  }
};
