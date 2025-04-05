import { Router } from "express";
import {
  urlshortner,
  redirectURL,
  urlExpiry,
} from "../controller/url.controller.js";

const router = Router();

router.route("/generate").post(urlshortner);
router.route("/:id").get(redirectURL);
router.route("/urlexpiry").post(urlExpiry);

export default router;
