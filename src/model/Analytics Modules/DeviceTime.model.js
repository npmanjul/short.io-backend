import mongoose, { Schema } from "mongoose";

const DeviceTime = new Schema({
  timeZone: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
});

export default mongoose.model("DeviceTime", DeviceTime);
