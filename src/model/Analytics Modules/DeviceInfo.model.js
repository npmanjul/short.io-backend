import mongoose, { Schema } from "mongoose";

const DeviceInfoSchema = new Schema({
  ipAddress: {
    type: String,
    default: "unavailable",
  },
  deviceType: {
    type: String,
    default: "unavailable",
  },
  connectionType: {
    type: String,
    default: "unavailable",
  },
  downloadSpeed: {
    type: String,
    default: "unavailable",
  },
  deviceCores: {
    type: String,
    default: "unavailable",
  },
  deviceRAM: {
    type: String,
    default: "unavailable",
  },
  browser: {
    type: String,
    default: "unavailable",
  },
  platform: {
    type: String,
    default: "unavailable",
  },
  language: {
    type: String,
    default: "unavailable",
  },
  onlineStatus: {
    type: String,
    default: "unavailable",
  },
  vendor: {
    type: String,
    default: "unavailable",
  },
  isp: {
    type: String,
    default: "unavailable",
  },
  org: {
    type: String,
    default: "unavailable",
  },
  as: {
    type: String,
    default: "unavailable",
  },
  asname: {
    type: String,
    default: "unavailable",
  },
  reverse: {
    type: String,
    default: "unavailable",
  },
  proxy: {
    type: String,
    default: "unavailable",
  },
  hosting: {
    type: String,
    default: "unavailable",
  },
});

export default mongoose.model("DeviceInfo", DeviceInfoSchema);
