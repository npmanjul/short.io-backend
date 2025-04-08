import { Router } from "express";
import {
  getAnalyticsDeviceBattery,
  getAnalyticsDeviceInfo,
  getAnalyticsDeviceLocation,
  getAnalyticsDeviceNetwork,
  getAnalyticsOverview,
  getAnalyticsProfile,
  getAnalyticsRecentActivity,
  getAnalyticsURL,
  getIpAddress,
  pushAnalytics,
  visitAnalytics,
} from "../controller/analytics.controller.js";

const router = Router();

//push analytics
router.route("/pushanalytics").post(pushAnalytics);

//profile
router.route("/analyticsprofile/:userId").get(getAnalyticsProfile);

// overview
router.route("/analyticsoverview/:userId").get(getAnalyticsOverview);
router.route("/analyticsvisit/:userId").get(visitAnalytics);
router.route("/analyticsinfo/:userId").get(getAnalyticsDeviceInfo);
router.route("/analyticsBattery/:userId").get(getAnalyticsDeviceBattery);
router.route("/analyticsnetwork/:userId").get(getAnalyticsDeviceNetwork);
router.route("/analyticslocation/:userId").get(getAnalyticsDeviceLocation);
router
  .route("/analyticsrecentactivity/:userId")
  .get(getAnalyticsRecentActivity);
router.route("/analyticsurl/:userId").get(getAnalyticsURL);

// Proxy server for ip address
router.route("/ip").get(getIpAddress);

export default router;
