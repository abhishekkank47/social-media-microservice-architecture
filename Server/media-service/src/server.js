import express from "express";
import dotenv from "dotenv";
import { corsConfig } from "./Config/Cors/corsConfig.js";
import helmet from "helmet";
import { DbConnection } from "./Config/Database/mediaServiceDB.js";
import { logger } from "./Utils/loggerUtil.js";
import { rateLimiterRedis, redisClient } from "./Middleweres/redisRateLimit.js";
import { errorHandler } from "./Middleweres/errorHandler.js";
import { uploaderRoute } from "./Routes/uploadMediaRoute.js";
import { authReq } from "./Middleweres/authReqMiddleware.js";
import { connectRabitMq, consumeEvent } from "./Config/RabbitMQ/rabbitMQConfig.js";
import { consumeEventHelper } from "./Helper/consumeEventHelper.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT;

//DATABASE
DbConnection();

//MIDDLEWARE
app.use(helmet());
app.use(express.json());
app.use(corsConfig());
app.use((req, res, next) => {
  rateLimiterRedis
    .consume(req.ip)
    .then(() => next())
    .catch(() => {
      logger.warn(`Rate Limit exceeded for IP: ${req.ip}`);
      res.status(429).json(
        {
            success: false,
            message:'Too Many Requests'
        }
      )
    });
});
app.use((req,res,next)=>{
  req.redisClient = redisClient
  next()
})

//ROUTES 
app.use("/api/media/media-services", authReq, uploaderRoute )

app.use(errorHandler)

//SERVER + RABBITMQ
const startServer = async()=>{
  try {
    app.listen(PORT, () => {
      logger.info(`MEDIA SERVICE SERVER IS RUNNING ON ${PORT}`);
    });

    await connectRabitMq()
    //consume Events
    await consumeEvent('postService-post.deleted', consumeEventHelper)

  } catch (e) {
    logger.error('failed to start Server : ', e )
    process.exit(1)
  }
}

startServer()
