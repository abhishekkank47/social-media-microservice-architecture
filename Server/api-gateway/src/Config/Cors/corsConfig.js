import cors from "cors";

export const corsConfig = () => {
  return cors({
    origin: (origin, cb) => {
      const allowedOrigin = ["http://localhost:5173", "https://Domain.com"];

      if (!origin || allowedOrigin.indexOf(origin) !== 1) {
        cb(null, true);
      } else {
        cb(new Error("Not Allowed By CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept-Version"],
    exposedHeaders: ["X-Total-Count", "Content-Range"],
    preflightContinue: false,
    maxAge: 600, // sec
    credentials: true,
  });
};
