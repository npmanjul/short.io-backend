import { Router } from "express";
import {
  getAnalytics,
  pushAnalytics,
} from "../controller/analytics.controller.js";

const router = Router();

router.route("/getanalytics").get(getAnalytics);
router.route("/pushanalytics").post(pushAnalytics);

export default router;
