import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { type } from "os";

const User = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  profileImage: {
    type: String,
  },
  isGoogleAuth: {
    type: Boolean,
    default: false,
  },
  url: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "URL",
  },
});

User.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

User.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

User.methods.generateToken = function () {
  try {
    return jwt.sign(
      {
        _id: this._id,
        name: this.name,
        email: this.email,
      },
      process.env.JWT_SECRET_TOKEN,
      {
        expiresIn: process.env.JWT_TOKEN_EXPIRY,
      }
    );
  } catch (error) {
    console.log("JWT token generation failed", error);
  }
};

export default mongoose.model("User", User);
