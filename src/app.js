// -------------------------------
// Application setup
// -------------------------------

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db.config");

// load standards
const app = express();
dotenv.config();
connectDB();

// Middlewares
app.use(express.json()); // parses JSON requests
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// import response handlers
const { formatApiResponse } = require("./utils/response");
const statusText = require("./config/statusText.config");
const { setUpAppRoutes } = require("./routes/setUpAppRoutes");

// all the application routes
setUpAppRoutes(app);

// -------------------------------
// Error Handling
// this return only the not found errors
// -------------------------------
app.all("*", (req, res, next) => {
  res
    .status(404)
    .json(
      formatApiResponse(
        404,
        statusText.ERROR,
        "page not found",
        "the page you are trying to access is not found"
      )
    );
});

// This middleware gets the current error from the application
// and display from here
// alias the error response
app.use((error, req, res, next) => {
  console.log("🔻 global error ", error.message);
  return res
    .status(error.statusCode || 500)
    .json(
      formatApiResponse(
        error.statusCode || 500,
        error.statusText,
        error.message,
        "🔻 GLOBAL ERROR"
      )
    );
});

module.exports = app;
