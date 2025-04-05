import { Router } from "express";
import {
  batteryInfoAnalytics,
  deviceInfoAnalytics,
  locationAnalytics,
  networkInfoAnalytics,
  urlanalytics,
  visitAnalytics,
} from "../controller/urlanalytics.controller.js";

const router = Router();

router.route("/urlanalytics/:urlId").get(urlanalytics);
router.route("/analyticsvisit/:urlId").get(visitAnalytics);
router.route("/locationanalytics/:urlId").get(locationAnalytics);
router.route("/deviceinfoanalytics/:urlId").get(deviceInfoAnalytics);
router.route("/networkinfoanalytics/:urlId").get(networkInfoAnalytics);
router.route("/batteryinfoanalytics/:urlId").get(batteryInfoAnalytics);

export default router;
