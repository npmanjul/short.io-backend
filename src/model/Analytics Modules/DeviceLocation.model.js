import mongoose, { Schema } from "mongoose";

const DeviceLocation = new Schema({
  longitude: {
    type: String,
    required: true,
  },
  latitude: {
    type: String,
    required: true,
  },
  accuracy: {
    type: String,
    required: true,
  },
});

export default mongoose.model("DeviceLocation", DeviceLocation);
