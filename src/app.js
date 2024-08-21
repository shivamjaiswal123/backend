const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

//routes import
const userRouter = require("./routes/user.js")

const app = express();

app.use(express.json({ limit: "16kb"}));
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
app.use(express.urlencoded({ extended: true, limit: "16kb"}));
app.use(express.static("public"));
app.use(cookieParser());

//routes

app.use("/api/v1/users", userRouter);

module.exports = app;