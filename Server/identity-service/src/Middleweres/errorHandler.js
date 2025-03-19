import { logger } from "../Utils/loggerUtil.js";

export const errorHandler  = async(err,req,res,next)=>{
    logger.error(err.stack)
    res.status(err.status || 500).json(
        {
            message: err.message || "Internal Server Error"
        }
    )
    next()
}