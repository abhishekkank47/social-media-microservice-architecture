import { logger } from "./loggerUtil.js";

export const identityProxyOptions = {
  proxyReqPathResolver: (req, res) => {
    return req.originalUrl.replace(/^\/v1/, "/api");
  },
  proxyErrorHandler: (err, res, next) => {
    logger.error(`Proxy error : ${err}`);
    res.status(500).json({
      success: false,
      message: err,
    });
  },
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    proxyReqOpts.headers["Content-Type"] = "application/json";
    return proxyReqOpts;
  },
  userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
    logger.info(
      `Response received from Identity service: ${proxyRes.statusCode}`
    );

    return proxyResData;
  },
};

export const postProxyOptions = {
  proxyReqPathResolver: (req, res) => {
    return req.originalUrl.replace(/^\/v1/, "/api");
  },
  proxyErrorHandler: (err, res, next) => {
    logger.error(`Proxy error : ${err}`);
    res.status(500).json({
      success: false,
      message: err,
    });
  },
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    proxyReqOpts.headers["Content-Type"] = "application/json";
    proxyReqOpts.headers["x-user-id"] = srcReq.user.userID; // this is for pass info from middleware to consume in post middleware
    return proxyReqOpts;
  },
  userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
    logger.info(`Response received from Post service: ${proxyRes.statusCode}`);

    return proxyResData;
  },
};

export const mediaProxyOptions = {
  proxyReqPathResolver: (req, res) => {
    return req.originalUrl.replace(/^\/v1/, "/api");
  },
  proxyErrorHandler: (err, res, next) => {
    logger.error(`Proxy error : ${err}`);
    res.status(500).json({
      success: false,
      message: err,
    });
  },
  limit: "25mb",
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    if (srcReq.headers["content-type"]?.startsWith("multipart/form-data")) {
      proxyReqOpts.headers["Content-Type"] = srcReq.headers["content-type"];
      proxyReqOpts.headers["content-length"] = srcReq.headers["content-length"] || 0;
    } else {
      proxyReqOpts.headers["Content-Type"] = "application/json";
    }
    proxyReqOpts.headers["x-user-id"] = srcReq.user.userID;
    return proxyReqOpts;
  },
  userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
    logger.info(`Response received from Media service: ${proxyRes.statusCode}`);

    return proxyResData;
  },
};
