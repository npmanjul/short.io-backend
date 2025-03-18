import mongoose, { Schema } from "mongoose";

const DeviceScreen = new Schema({
  screenWidth: {
    type: String,
    required: true,
  },
  screenHeight: {
    type: String,
    required: true,
  },
  availableScreenWidth: {
    type: String,
    required: true,
  },
  availableScreenHeight: {
    type: String,
    required: true,
  },
  colorDepth: {
    type: String,
    required: true,
  },
  devicePixelRatio: {
    type: String,
    required: true,
  },
});

export default mongoose.model("DeviceScreen", DeviceScreen);
