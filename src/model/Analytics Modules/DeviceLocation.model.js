import mongoose, { Schema } from "mongoose";

const DeviceLocationSchema = new Schema({
  location: {
    type: String, // Can store "latitude,longitude" as a single string
    default: "unavailable",
  },
  ipAddress: {
    type: String,
    default: "unavailable",
  },
  city: {
    type: String,
    default: "unavailable",
  },
  region: {
    type: String,
    default: "unavailable",
  },
  country: {
    type: String,
    default: "unavailable",
  },
  zip: {
    type: String,
    default: "unavailable",
  },
  currency: {
    type: String,
    default: "unavailable",
  },
});

export default mongoose.model("DeviceLocation", DeviceLocationSchema);
