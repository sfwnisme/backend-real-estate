// -------------------------------
// database configuration
// -------------------------------

const mongoose = require("mongoose");
const connectDB = async () => {
  try {
    const MONGO_PROTOCOL = process.env.MONGO_PROTOCOL;
    const MONGO_USERNAME = process.env.MONGO_USERNAME;
    const MONGO_PASSWORD = process.env.MONGO_PASSWORD;
    const MONGO_CLUSTER_HOST = process.env.MONGO_CLUSTER_HOST;
    const MONGO_RETRY_WRITES = process.env.MONGO_RETRY_WRITES;
    const MONGO_WRITE_CONCERN = process.env.MONGO_WRITE_CONCERN;
    const MONGO_DB_NAME = process.env.MONGO_DB_NAME;
    const MONGO_APP_NAME = process.env.MONGO_APP_NAME;
    const MONGO_URI = `${MONGO_PROTOCOL}://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_CLUSTER_HOST}/?retryWrites=${MONGO_RETRY_WRITES}&w=${MONGO_WRITE_CONCERN}&appName=${MONGO_APP_NAME}`;

    await mongoose.connect(MONGO_URI, { dbName: MONGO_DB_NAME });
    console.log("🟩 db connected");
  } catch (error) {
    console.error("🟥 MongoDB Connection Failed", {
      error: error.message,
      errorFileSource: "src/config/db.config.js"
    });
  }
};

module.exports = connectDB;
