import express from "express";
import dotenv from "dotenv";
import { corsConfig } from "../src/Config/Cors/corsConfig.js";
import helmet from "helmet";
import { rateLimiterRedis } from "./Middleweres/redisRateLimit.js";
import { logger } from "./Utils/loggerUtil.js";
import { errorHandler } from "./Middleweres/errorHandler.js";
import proxy from "express-http-proxy";
import { identityProxyOptions, mediaProxyOptions, postProxyOptions } from "./Utils/proxyUtil.js";
import { authenticationCheck } from "./Middleweres/authCheckMiddleware.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT;

//MIDDLEWARE
app.use(helmet());
// app.use(express.json());
app.use(corsConfig());
app.use(errorHandler);
app.use((req, res, next) => {
  rateLimiterRedis
    .consume(req.ip)
    .then(() => next())
    .catch(() => {
      logger.warn(`Rate Limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        success: false,
        message: "Too Many Requests",
      });
    });
});

//ROUTES
app.use(
  "/v1/auth/identity-services",
  proxy(process.env.IDENTITY_SERVICE_URL, { ...identityProxyOptions })
);
app.use(
  "/v1/post/post-services", authenticationCheck,
  proxy(process.env.POST_SERVICE_URL, { ...postProxyOptions })
);
app.use(
  "/v1/media/media-services", authenticationCheck,
  proxy(process.env.MEDIA_SERVICE_URL, { ...mediaProxyOptions })
);

//SERVER
app.listen(PORT, () => {
  logger.info(`API GATEWAY SERVER IS RUNNING ON ${PORT}`);
});
