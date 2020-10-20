import express from "express";
import mongoose from "mongoose";
import cors from "cors";
// Routes
import userRoutes from "./routers/userRoutes";

const MONGODB_URI = "mongodb://localhost/race";

const app = express();

app.use(cors());
app.use(userRoutes);

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected"))
  .catch((err) => console.log(err));

app.listen(4000, () => console.log("Connected"));
