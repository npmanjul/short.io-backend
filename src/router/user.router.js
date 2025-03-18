import { Router } from "express";
import { googleAuth, login, signup } from "../controller/user.controller.js";

const router = Router();

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/googleauth").post(googleAuth);

export default router;
