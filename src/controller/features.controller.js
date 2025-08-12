import expressAsyncHandler from "express-async-handler";
import URL from "../model/url.model.js";
import User from "../model/user.model.js";
import OTP from "../model/otp.modal.js";
import nodemailer from "nodemailer";

const checkUrlExpiry = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const url = await URL.findOne({ shortId: id });

  if (!url) {
    return res.status(404).json({ message: "URL not found" });
  }

  // Check if URL has expiry settings
  if (url.expiryDate && url.expiryTime) {
    const [year, month, day] = url.expiryDate.split("-").map(Number);
    const [hour, minute] = url.expiryTime.split(":").map(Number);
    const expiryDateTimeIST = new Date(year, month - 1, day, hour, minute, 0);

    if (isNaN(expiryDateTimeIST)) {
      return res
        .status(400)
        .json({ message: "Invalid expiry date or time format" });
    }

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

  // If expiry date and time are provided
  if (expiryDate && expiryTime) {
    // Parse expiry date and time in IST
    const [year, month, day] = expiryDate.split("-").map(Number);
    const [hour, minute] = expiryTime.split(":").map(Number);

    // Construct expiry Date object in IST
    const expiryDateTime = new Date(
      Date.UTC(year, month - 1, day, hour - 5, minute - 30)
    );

    if (isNaN(expiryDateTime.getTime())) {
      return res
        .status(400)
        .json({ message: "Invalid expiry date or time format" });
    }

    const now = new Date();

    if (now > expiryDateTime) {
      url.isActive = false;
      url.isExpiry = true;
    } else {
      url.isActive = true;
      url.isExpiry = false;
    }

    url.expiryDate = expiryDate;
    url.expiryTime = expiryTime;
  } else {
    // No expiry set
    url.expiryDate = null;
    url.expiryTime = null;
    url.isActive = true;
    url.isExpiry = false;
  }

  // If manual override is given, apply it
  if (typeof isActive === "boolean") {
    url.isActive = isActive;
  }
  if (typeof isExpiry === "boolean") {
    url.isExpiry = isExpiry;
  }

  await url.save();

  res.status(200).json({
    message: "URL status updated successfully",
    isActive: url.isActive,
    isExpiry: url.isExpiry,
    expiryDate: url.expiryDate,
    expiryTime: url.expiryTime,
  });
});

const setExpiry = expressAsyncHandler(async (req, res) => {
  const { urlId, expiryDate, expiryTime } = req.body;

  const url = await URL.findById(urlId);
  if (!url) {
    return res.status(404).json({ message: "URL not found" });
  }

  if (expiryDate && expiryTime) {
    const expiryDateTime = new Date(`${expiryDate}T${expiryTime}`);

    if (isNaN(expiryDateTime)) {
      return res
        .status(400)
        .json({ message: "Invalid expiry date or time format" });
    }

    url.expiryDate = expiryDate;
    url.expiryTime = expiryTime;

    const [year, month, day] = expiryDate.split("-").map(Number);
    const [hour, minute] = expiryTime.split(":").map(Number);
    const expiryDateTimeIST = new Date(year, month - 1, day, hour, minute, 0);

    const nowIST = new Date();

    if (nowIST > expiryDateTimeIST) {
      url.isActive = false;
      url.isExpiry = true;
    } else {
      url.isActive = true;
      url.isExpiry = false;
    }
  } else {
    url.expiryDate = null;
    url.expiryTime = null;
    url.isActive = true;
    url.isExpiry = false;
  }

  await url.save();

  res.status(200).json({
    message: "URL expiry updated successfully",
    data: url,
  });
});

const changePassword = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const isMatch = await user.isPasswordCorrect(oldPassword);
  if (!isMatch) {
    return res.status(401).json({ message: "Old password is incorrect" });
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({ message: "Password changed successfully" });
});

const updateUserName = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const defaultProfileImage = `https://ui-avatars.com/api/?name=${name}&background=random&size=256`;

  user.name = name;
  user.pic = defaultProfileImage;
  await user.save();

  res.status(200).json({ message: "User Name updated successfully" });
});

const sendEmailOtp = expressAsyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  // If email already exists, delete old record
  const existingOtpRecord = await OTP.findOne({ email });
  if (existingOtpRecord) {
    await OTP.deleteOne({ email });
  }

  // Generate new OTP and store
  const otp = Math.floor(100000 + Math.random() * 900000);
  await OTP.create({ email, otp });

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // your gmail
        pass: process.env.EMAIL_PASS, // app password
      },
    });

    // Mail options
    const mailOptions = {
      from: `"Short.io" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Short.io Verification Code",
      html: `
    <!-- Unique ID: ${Date.now()} -->
    <div style="font-family: Arial, sans-serif; background-color: #f6f9fc; padding: 20px;">
      <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <div style="background-color: #4CAF50; padding: 15px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Short.io</h1>
        </div>

        <!-- Body -->
        <div style="padding: 20px;">
          <h2 style="color: #333; margin-top: 0;">Email Verification</h2>
          <p style="color: #555; font-size: 15px;">
            Hello,<br><br>
            Use the following One-Time Password (OTP) to verify your email address. 
            This code will expire in <strong>5 minutes</strong>.
          </p>

          <!-- OTP Box -->
          <div style="background: #f0f8f5; border: 2px dashed #4CAF50; border-radius: 6px; padding: 15px; text-align: center; margin: 20px 0;">
            <h1 style="font-size: 32px; letter-spacing: 4px; color: #4CAF50; margin: 0;">${otp}</h1>
          </div>

          <p style="color: #777; font-size: 13px;">
            If you didn’t request this, please ignore this email.
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f6f9fc; padding: 10px; text-align: center; font-size: 12px; color: #999;">
          &copy; ${new Date().getFullYear()} Short.io. All rights reserved.
        </div>

      </div>
    </div>
  `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

const verifyOtp = expressAsyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  const isValidOtp = await OTP.findOne({ email });

  if (!isValidOtp || isValidOtp.otp !== otp) {
    return res.status(401).json({ message: "Invalid OTP" });
  }

  // OTP matched → delete it from DB
  await OTP.deleteOne({ email });

  res.status(200).json({ message: "OTP verified successfully" });
});

const forgetPassword = expressAsyncHandler(async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.status(200).json({ message: "Password updated successfully" });
});

export {
  checkUrlExpiry,
  setIsActive,
  setExpiry,
  changePassword,
  updateUserName,
  sendEmailOtp,
  verifyOtp,
  forgetPassword,
};
