import { nanoid } from "nanoid";
import URL from "../model/url.model.js";
import User from "../model/user.model.js";
import expressAsyncHandler from "express-async-handler";

//@description     short the url
//@route           POST /url/generate
//@access
//@response        url,userId

const urlshortner = expressAsyncHandler(async (req, res) => {
  try {
    const { url, userId } = req.body;
    if (!url) {
      return res.status(400).json({ message: "URL is required" });
    }

    let shortId = nanoid(6);
    const shortIdExists = await URL.findOne({ shortId });
    if (shortIdExists) {
      shortId = nanoid(6);
    }
    const urlCreated = await URL.create({
      redirectURL: url,
      shortId: shortId,
      isActive: true,
      isExpiry: false,
      expiryDate: "",
      expiryTime: "",
    });

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.url.push(urlCreated._id);
    await user.save();

    res.status(201).json({
      message: "Short URL generated successfully",
      shortId: shortId,
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
});

//@description     redirect url
//@route           GET /url/:id
//@access
//@response        redirectURL,isActive
const redirectURL = expressAsyncHandler(async (req, res) => {
  try {
    const shortId = req.params.id;
    const entry = await URL.findOne({
      shortId: shortId,
    });

    // res.redirect(entry.redirectURL);
    res.status(201).json({
      redirectURL: entry.redirectURL,
      isActive: entry.isActive,
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
});

export { urlshortner, redirectURL };
