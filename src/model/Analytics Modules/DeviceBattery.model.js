import mongoose, { Schema } from "mongoose";

const DeviceBattery = new Schema({
  batteryLevel: {
    type: String,
  },
  chargingStatus: {
    type: String,
  },
  dischargingTime: {
    type: String,
  },
});

export default mongoose.model("DeviceBattery", DeviceBattery);
