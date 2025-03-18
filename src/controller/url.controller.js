import { nanoid } from "nanoid";
import URL from "../model/url.model.js";

const urlshortner = async (req, res) => {
  try {
    const body = req.body;
    if (!body.url) {
      return res.status(400).json({ message: "URL is required" });
    }

    const shortId = nanoid(10);
    await URL.create({
      redirectURL: body.url,
      shortId: shortId,
    });

    res.status(201).json({
      message: "Short URL generated successfully",
      shortId: shortId,
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

const redirectURL = async (req, res) => {
  try {
    const shortId = req.params.id;
    const entry = await URL.findOneAndUpdate(
      {
        shortId: shortId,
      },
      {
        $push: {
          visitedHistory: { timestamp: Date.now() },
        },
      }
    );

    // res.redirect(entry.redirectURL);
    res.status(201).json({
      redirectURL: entry.redirectURL,
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export { urlshortner, redirectURL };
