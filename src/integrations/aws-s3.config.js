const { S3Client } = require("@aws-sdk/client-s3");

module.exports.awsS3Client = new S3Client({
  region: process.env.AWS_S3_BUCKET_REGION ,
  credentials: {
    accessKeyId: process.env.AWS_S3_USER_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_USER_SECRET_ACCESS_KEY,
  },
});
