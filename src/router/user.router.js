import { Router } from "express";
import {
  checkUser,
  googleAuth,
  login,
  signup,
} from "../controller/user.controller.js";

const router = Router();

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/googleauth").post(googleAuth);
router.route("/checkuser").post(checkUser);

export default router;
