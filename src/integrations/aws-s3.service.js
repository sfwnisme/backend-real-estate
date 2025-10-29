//---------------------------------
// initialize the reusable aws services
// to avoid duplication. The shared services
// found on /integrations/image.services.js
//---------------------------------

const {
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} = require("@aws-sdk/client-s3");
const { awsS3Client } = require("./aws-s3.config");
const { awsS3ImageUrl } = require("../utils/utils");
const { formatApiResponse } = require("../utils/response");
const { STATUS_TEXT } = require("../config/enum.config");

const awsS3Services = module.exports;

awsS3Services.putObject = async (file, fileName) => {
  try {
    console.log("aws-s3: filename", fileName);
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `${fileName}`,
      Body: file,
      ContentType: "image/jpeg",
    };

    const command = new PutObjectCommand(params);
    const data = await awsS3Client.send(command);

    if (data.$metadata.httpStatusCode !== 200) {
      console.log("aws-sfwn-error", data);
      return;
    }

    const url = awsS3ImageUrl(params?.Key);
    console.log("s3awssfwnimageurl", url);
    return { url, key: params.Key };
  } catch (error) {
    console.error("Error:aws-s3.services.js->.putObject", error);
  }
};

awsS3Services.checkAwsS3ObjectExists = async (key) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
  };
  try {
    const headCommand = new HeadObjectCommand(params);
    const headResponse = await awsS3Client.send(headCommand);

    const statusCode = headResponse.$metadata.httpStatusCode;
    if (statusCode !== 200) {
      console.log("the object not exists", statusCode);
      return formatApiResponse(
        statusCode,
        STATUS_TEXT.FAIL,
        "the object not exists"
      );
    }
    console.log("the object exists", statusCode);
    return formatApiResponse(
      statusCode,
      STATUS_TEXT.SUCCESS,
      "the object exists"
    );
  } catch (error) {
    const statusCode = error.$metadata.httpStatusCode;
    console.log(statusCode);
    return formatApiResponse(
      statusCode,
      STATUS_TEXT.ERROR,
      "the object exists"
    );
  }
};

awsS3Services.deleteObject = async (key) => {
  if (!key) {
    throw new Error(
      "awsS3Services.deleteObject",
      "the key not found, you must pass the fileName/key to delete"
    );
  }

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
  };
  try {
    /** NOTE
     aws-sdk/client-s3 DeleteObjectCommand returns statusCode 204 on success or fail
     which mean we have to check if the object is exist by its Key
     checkObjectExist(key) function handle it before processing the deletion.
    */
    const isObjectExist = await this.checkAwsS3ObjectExists(key);
    if (isObjectExist.statusText !== STATUS_TEXT.SUCCESS) {
      return formatApiResponse(
        isObjectExist.status,
        STATUS_TEXT.FAIL,
        "the object not found in aws s3 bucket, you can not delete it",
        {
          key,
        }
      );
    }

    const deleteCommand = new DeleteObjectCommand(params);
    const deleteResponse = await awsS3Client.send(deleteCommand);
    const deleteResponseStatusCode = deleteResponse.$metadata.httpStatusCode;

    console.log(
      "deleteObject => ",
      formatApiResponse(deleteResponseStatusCode, STATUS_TEXT.SUCCESS, {
        key,
      })
    );
    return formatApiResponse(
      deleteResponseStatusCode,
      STATUS_TEXT.SUCCESS,
      "object deleted successfully",
      {
        key,
      }
    );
  } catch (error) {
    const statusCode = error.$metadata.httpStatusCode;
    console.log(statusCode);
    return formatApiResponse(
      statusCode,
      STATUS_TEXT.ERROR,
      "the not object exists",
      { key }
    );
  }
};
