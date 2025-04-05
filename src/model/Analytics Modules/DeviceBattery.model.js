import mongoose, { Schema } from "mongoose";

const DeviceBatterySchema = new Schema({
  batteryLevel: {
    type: String,
    default: "unavailable",
  },
  chargingStatus: {
    type: String,
    default: "unavailable",
  },
  dischargingTime: {
    type: String,
    default: "unavailable",
  },
});

export default mongoose.model("DeviceBattery", DeviceBatterySchema);
