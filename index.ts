import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import multer from "multer";
import path from "path";
import dotenv from "dotenv";
// Routes
import userRoutes from "./routers/userRoutes";
import adminRoutes from "./routers/adminRoutes";

dotenv.config();

// const MONGODB_URI = "mongodb://localhost/race";
const MONGODB_URI =
  "mongodb+srv://nahlagalal:gt-b3410@code-quizzey.dbylu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
    );
  },
});

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(multer({ storage }).single("answer"));
app.use("/public", express.static(path.join(__dirname, "public")));
app.use(userRoutes);
app.use(adminRoutes);

app.use(express.static(path.resolve(__dirname, "./client/build")));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./client/build", "index.html"));
});

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log("Connected"))
  .catch((err) => console.log(err));

app.listen(process.env.PORT || 5000, () => console.log("Connected"));
