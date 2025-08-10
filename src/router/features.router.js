import { Router } from "express";
import {
  setIsActive,
  checkUrlExpiry,
  setExpiry,
} from "../controller/features.controller.js";

const router = Router();

router.route("/checkurlexpiry/:id").get(checkUrlExpiry);
router.route("/setisactive/:id").post(setIsActive);
router.route("/seturlexpiry").post(setExpiry);

export default router;
