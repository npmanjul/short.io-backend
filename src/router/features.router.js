import { Router } from "express";
import {
  setIsActive,
  checkUrlExpiry,
  setExpiry,
  changePassword,
  updateUserName,
  sendEmailOtp,
  verifyOtp,
  forgetPassword,
} from "../controller/features.controller.js";

const router = Router();

router.route("/checkurlexpiry/:id").get(checkUrlExpiry);
router.route("/setisactive/:id").post(setIsActive);
router.route("/seturlexpiry").post(setExpiry);

router.route("/changepassword/:id").post(changePassword);
router.route("/updateusername/:id").put(updateUserName);
router.route("/sendemailotp").post(sendEmailOtp);
router.route("/verifyotp").post(verifyOtp);
router.route("/forgetpassword").post(forgetPassword);

export default router;
