import mongoose, { Schema } from "mongoose";

const URL = new Schema(
  {
    shortId: {
      type: String,
      required: true,
      unique: true,
    },
    redirectURL: {
      type: String,
      required: true,
    },
    visitedHistory: [{ timestamp: Number }],
    analytics: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Analytics",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Url", URL);
