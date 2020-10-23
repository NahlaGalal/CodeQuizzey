import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
// Routes
import userRoutes from "./routers/userRoutes";

const MONGODB_URI = "mongodb://localhost/race";

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(userRoutes);

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(() => console.log("Connected"))
  .catch((err) => console.log(err));

app.listen(4000, () => console.log("Connected"));
