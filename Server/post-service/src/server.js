import express from "express";
import dotenv from "dotenv";
import { corsConfig } from "./Config/Cors/corsConfig.js";
import helmet from "helmet";
import { DbConnection } from "./Config/Database/postServiceDB.js";
import { logger } from "./Utils/loggerUtil.js";
import { rateLimiterRedis, redisClient } from "./Middleweres/redisRateLimit.js";
import { errorHandler } from "./Middleweres/errorHandler.js";
import { postRoutes } from "./Routes/postRoutes.js";
import { authReq } from "./Middleweres/authReqMiddleware.js";
import { connectRabitMq } from "./Config/RabbitMQ/rabbitMQConfig.js";
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
app.use('/api/post/post-services', authReq , postRoutes)

app.use(errorHandler)

//SERVER + RABBITMQ
const startServer = async()=>{
  try {
    app.listen(PORT, () => {
      logger.info(`POST SERVICE SERVER IS RUNNING ON ${PORT}`);
    });
    await connectRabitMq()
  } catch (e) {
    logger.error('failed to start Server : ', e )
    process.exit(1)
  }
}

startServer()


