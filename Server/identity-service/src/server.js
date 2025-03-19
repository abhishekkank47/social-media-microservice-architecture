import express from "express";
import dotenv from "dotenv";
import { corsConfig } from "../src/Config/Cors/corsConfig.js";
import helmet from "helmet";
import { DbConnection } from "../src/Config/Database/IdentityServiceDB.js";
import { authRouter } from "./Routes/authRoutes.js";
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
app.use("/api/auth/identity-services", authRouter);

app.use(errorHandler)

//SERVER
app.listen(PORT, () => {
  logger.info(`SERVER IS RUNNING ON ${PORT}`);
});
