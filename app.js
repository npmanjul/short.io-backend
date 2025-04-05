import express from "express";
import { API_VERSION } from "./constants.js";
import cors from "cors";
import errorHandler from "./src/middleware/error.middleware.js";

const app = express();

const corsOptions = {
  origin: "*",
  allowedHeaders: "Content-Type, Authorization",
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json()); // middleware converts that JSON into a JavaScript object
app.use(express.urlencoded({ extended: true })); // convert into javascript object form form-urlencoded

// import route
import urlshortnerRouter from "./src/router/url.router.js";
import userAuth from "./src/router/user.router.js";
import analyticsRouter from "./src/router/analytics.router.js";
import urlanalyticsRouter from "./src/router/urlanalytics.router.js";

// router implementation
app.use(`${API_VERSION}/url`, urlshortnerRouter);
app.use(`${API_VERSION}/user`, userAuth);
app.use(`${API_VERSION}/analytics`, analyticsRouter);
app.use(`${API_VERSION}/urlanalytics`, urlanalyticsRouter);

app.use(errorHandler);

export default app;
