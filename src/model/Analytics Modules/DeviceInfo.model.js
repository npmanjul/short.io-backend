import mongoose, { Schema } from "mongoose";

const DeviceInfo = new Schema({
  ipAddress: {
    type: String,
    required: true,
  },
  deviceType: {
    type: String,
    required: true,
  },
  connectionType: {
    type: String,
    required: true,
  },
  downloadSpeed: {
    type: String,
    required: true,
  },
  deviceCores: {
    type: String,
    required: true,
  },
  deviceRAM: {
    type: String,
    required: true,
  },
  browser: {
    type: String,
    required: true,
  },
  platform: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  onlineStatus: {
    type: String,
    required: true,
  },
  vendor: {
    type: String,
    required: true,
  },
});

export default mongoose.model("DeviceInfo", DeviceInfo);
