import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "./src/db/db.js";

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO DB is failed to connect !!!", err);
  });
