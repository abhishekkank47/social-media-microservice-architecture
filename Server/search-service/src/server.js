import express from "express";
import dotenv from "dotenv";
import { corsConfig } from "./Config/Cors/corsConfig.js";
import helmet from "helmet";
import { DbConnection } from "./Config/Database/searchServiceDB.js";
import { logger } from "./Utils/loggerUtil.js";
import { rateLimiterRedis } from "./Middleweres/redisRateLimit.js";
import { errorHandler } from "./Middleweres/errorHandler.js";
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

//ROUTES 

app.use(errorHandler)

//SERVER
app.listen(PORT, () => {
  logger.info(`SEARCH SERVICE SERVER IS RUNNING ON ${PORT}`);
});
