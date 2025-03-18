import mongoose, { Schema } from "mongoose";

const Analytic = new Schema({
  deviceLocation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DeviceLocation",
  },
  deviceInfo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DeviceInfo",
  },
  deviceBattery: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DeviceBattery",
  },
  deviceScreen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DeviceScreen",
  },
  deviceTime: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DeviceTime",
  },
});

export default mongoose.model("Analytic", Analytic);
