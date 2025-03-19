import jwt from "jsonwebtoken";
import { logger } from "../Utils/loggerUtil.js";

export const authenticationCheck = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const tokenCheck = authHeader && authHeader.split(" ")[1];
    if (!tokenCheck) {
      logger.warn("Token is not Exist, Unauthorized Access ");
      return res.status(401).json({
        success: false,
        message: "Token is not Exist, Unauthorized Access",
      });
    }

    //VERIFY TOKEN
    jwt.verify(tokenCheck, process.env.JWT_SECRETE , (err,user)=>{
        if(err){
            logger.warn("Unauthorized Access")
            return res.status(401).json({
                success: false,
                message: "Unauthorized Access",
              });
        }

        req.user = user
        next()
    })

  } catch (e) {
    logger.error("Error in Auhtentication Check Middleware ", e);
    res.status(500).json({
      success: false,
      message: "Error in Auhtentication Check Middleware",
    });
  }
};
