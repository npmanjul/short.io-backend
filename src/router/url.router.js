import { Router } from "express";
import { urlshortner, redirectURL } from "../controller/url.controller.js";

const router = Router();

router.route("/generate").post(urlshortner);
router.route("/:id").get(redirectURL);

export default router;
