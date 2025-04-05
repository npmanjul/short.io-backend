import { nanoid } from "nanoid";
import URL from "../model/url.model.js";
import User from "../model/user.model.js";
import asyncHandler from "express-async-handler";

const urlshortner = asyncHandler(async (req, res) => {
  try {
    const { url, userId } = req.body;
    if (!url) {
      return res.status(400).json({ message: "URL is required" });
    }

    let shortId = nanoid(10);
    const shortIdExists = await URL.findOne({ shortId });
    if (shortIdExists) {
      shortId = nanoid(10);
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

const redirectURL = asyncHandler(async (req, res) => {
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

const urlExpiry = asyncHandler(async (req, res) => {
  let { isActive, expiryDate, expiryTime, urlId } = req.body;

  const url = await URL.findOne({ _id: urlId });

  if (!url) {
    return res.status(404).json({ message: "URL not found" });
  }

  if (expiryDate && expiryTime) {
    url.expiryDate = expiryDate;
    url.expiryTime = expiryTime;
    url.isExpiry = true;
  }

  if (!expiryDate && !expiryTime) {
    url.isExpiry = false;
  }

  url.isActive = isActive;
  await url.save();

  res.status(201).json({
    message: "URL updated successfully",
  });
});

export { urlshortner, redirectURL, urlExpiry };
