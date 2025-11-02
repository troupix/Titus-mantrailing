const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const fs = require("fs");
require("dotenv").config();

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const uploadFile = async (file) => {
  const fileStream = fs.createReadStream(file.path);

  const uploadParams = {
    Bucket: process.env.R2_BUCKET_NAME,
    Key: file.filename,
    Body: fileStream,
    ContentType: file.mimetype,
  };

  try {
    const data = await s3Client.send(new PutObjectCommand(uploadParams));
    return { ...data, Location: `${process.env.R2_ENDPOINT}/${file.filename}` };
  } catch (err) {
    console.error("Error", err);
  }
};

const deleteFile = async (fileName) => {
  const deleteParams = {
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileName,
  };

  try {
    return await s3Client.send(new DeleteObjectCommand(deleteParams));
  } catch (err) {
    console.error("Error", err);
  }
};

const generateSignedUrl = async (fileName) => {
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileName,
  });
  try {
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL expires in 1 hour
    return signedUrl;
  } catch (err) {
    console.error("Error generating signed URL", err);
    return null;
  }
};

module.exports = { uploadFile, deleteFile, generateSignedUrl };
