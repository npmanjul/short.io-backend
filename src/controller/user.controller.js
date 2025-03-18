import asyncHandler from "express-async-handler";
import User from "../model/user.model.js";

//@description     Register new user
//@route           POST /user/signup
//@access          Public

const signup = asyncHandler(async (req, res) => {
  const { name, email, password, profileImage } = req.body;

  if (!name || !email || !password) {
    const error = new Error("Please Enter all the Fields");
    error.statusCode = 400;
    throw error;
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    const error = new Error("User already exist");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.create({
    name,
    email,
    password,
    profileImage,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: await user.generateToken(),
    });
  } else {
    const error = new Error("User not found");
    error.statusCode = 400;
    throw error;
  }
});

//@description     Auth the user
//@route           POST /user/login
//@access          Public

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const error = new Error("Please Enter all the Fields");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 400;
    throw error;
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    const error = new Error("Incorrect Password");
    error.statusCode = 400;
    throw error;
  }

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: await user.generateToken(),
    });
  } else {
    const error = new Error("Invalid Email and Password");
    error.statusCode = 400;
    throw error;
  }
});

//@description     Google Auth the user
//@route           POST /user/googleauth
//@access          Public

const googleAuth = asyncHandler(async (req, res) => {
  const { email, name, pic, uid } = req.body;

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      email,
      name,
      pic,
      password: uid,
      isGoogleAuth: true,
    });
  }

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: await user.generateToken(),
    });
  } else {
    res.status(400);
    throw new Error("User authentication failed");
  }
});

export { login, signup, googleAuth };
