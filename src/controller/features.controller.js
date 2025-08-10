import expressAsyncHandler from "express-async-handler";
import URL from "../model/url.model.js";

const checkUrlExpiry = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const url = await URL.findOne({ shortId: id });

  if (!url) {
    return res.status(404).json({ message: "URL not found" });
  }

  // Check if URL has expiry settings
  if (url.expiryDate && url.expiryTime) {
    // Create expiry date in local timezone (IST)
    const [year, month, day] = url.expiryDate.split("-").map(Number);
    const [hour, minute] = url.expiryTime.split(":").map(Number);
    const expiryDateTimeIST = new Date(year, month - 1, day, hour, minute, 0);

    if (isNaN(expiryDateTimeIST)) {
      return res
        .status(400)
        .json({ message: "Invalid expiry date or time format" });
    }

    // Get current IST time
    const nowIST = new Date();

    if (nowIST > expiryDateTimeIST) {
      // URL has expired - auto-deactivate
      url.isActive = false;
      url.isExpiry = true;
      await url.save();

      return res.status(200).json({
        message: "URL has expired",
        isExpiry: true,
        isActive: false,
      });
    } else {
      // URL is still valid - ensure it's active
      url.isActive = true;
      url.isExpiry = false;
      await url.save();

      return res.status(200).json({
        message: "URL is active",
        isExpiry: false,
        isActive: true,
      });
    }
  }

  // No expiry set - check current status and return
  return res.status(200).json({
    message: url.isActive ? "URL is active" : "URL is inactive",
    isExpiry: url.isExpiry,
    isActive: url.isActive,
  });
});

const setIsActive = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive, isExpiry, expiryDate, expiryTime } = req.body;
  const url = await URL.findOne({ shortId: id });

  if (!url) {
    return res.status(404).json({ message: "URL not found" });
  }

  url.isActive = isActive;
  url.isExpiry = isExpiry;
  url.expiryDate = expiryDate;
  url.expiryTime = expiryTime;
  await url.save();

  res.status(200).json({
    isActive: url.isActive,
  });
});

const setExpiry = expressAsyncHandler(async (req, res) => {
  const { urlId, expiryDate, expiryTime } = req.body;

  const url = await URL.findById(urlId);
  if (!url) {
    return res.status(404).json({ message: "URL not found" });
  }

  // Validate both date and time
  if (expiryDate && expiryTime) {
    const expiryDateTime = new Date(`${expiryDate}T${expiryTime}`);
    if (isNaN(expiryDateTime)) {
      return res
        .status(400)
        .json({ message: "Invalid expiry date or time format" });
    }

    url.expiryDate = expiryDate;
    url.expiryTime = expiryTime;

    // Create expiry date in local timezone (IST)
    const [year, month, day] = expiryDate.split("-").map(Number);
    const [hour, minute] = expiryTime.split(":").map(Number);
    const expiryDateTimeIST = new Date(year, month - 1, day, hour, minute, 0);

    const nowIST = new Date();

    // Check if expiry date is in future or past
    if (nowIST > expiryDateTimeIST) {
      // Date is in the past - URL has expired
      url.isActive = false;
      url.isExpiry = true;
    } else {
      // Date is in the future - URL is active
      url.isActive = true;
      url.isExpiry = false;
    }
  } else {
    // No expiry date/time provided - remove expiry
    url.expiryDate = null;
    url.expiryTime = null;
    url.isActive = true; // URL should be active when no expiry is set
    url.isExpiry = false; // Not expired when no expiry is set
  }

  await url.save();

  res.status(200).json({
    message: "URL expiry updated successfully",
    data: url,
  });
});

export { checkUrlExpiry, setIsActive, setExpiry };
