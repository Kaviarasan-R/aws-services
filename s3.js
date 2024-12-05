import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getSignedUrl as cdnSigner } from "@aws-sdk/cloudfront-signer";
import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from "@aws-sdk/client-cloudfront";
import fs from "fs";

const privateKey = fs.readFileSync("./private_key.pem", "utf8");
const credentials = {
  region: "<region-id>",
  credentials: {
    accessKeyId: "",
    secretAccessKey: "",
  },
};

const s3Client = new S3Client(credentials);
const cloudfrontClient = new CloudFrontClient(credentials);

const invalidationParams = {
  DistributionId: "<cloudfront-distribution-di>",
  InvalidationBatch: {
    CallerReference: "<file-name>",
    Paths: {
      Quantity: 1,
      Items: ["/" + "<file-name>"],
    },
  },
};

const invalidateCdnCacheCommand = new CreateInvalidationCommand(
  invalidationParams
);
await cloudfrontClient.send(invalidateCdnCacheCommand);

const getObjectUrl = async (isCdn, key) => {
  if (isCdn) {
    const objectUrl = "https://****.cloudfront.net/" + key;
    return cdnSigner({
      url: objectUrl,
      dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
      privateKey: privateKey,
      keyPairId: "", // Cloudfront public key id
    });
  } else {
    const command = new GetObjectCommand({
      Bucket: "bucket.kavi.s3",
      Key: key,
    });
    const url = await getSignedUrl(s3Client, command);
    return url;
  }
};

const putObject = async (filename, contentType) => {
  const command = new PutObjectCommand({
    Bucket: "bucket.kavi.s3",
    Key: `images/${filename}`,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 1800 });
  return url;
};

const listObjects = async () => {
  const command = new ListObjectsV2Command({
    Bucket: "bucket.kavi.s3",
    Key: "/",
  });
  const result = await s3Client.send(command);
  console.log(result);
};

const deleteObject = async () => {
  const command = new DeleteObjectCommand({
    Bucket: "bucket.kavi.s3",
    Key: "images/video-1733051070974.jpeg",
  });
  const result = await s3Client.send(command);
  console.log(result);
};

const init = async () => {
  // console.log("cdn", await getObjectUrl(true, "SQS-Blog-Diagram-6.webp"));
  // console.log(
  //   "presigned-url",
  //   await getObjectUrl(false,"images/image-1733050674076.jpeg")
  // );
  // console.log(
  //   "presigned-url",
  //   await putObject(`image-${Date.now()}.jpeg`, "image/jpeg")
  // );
  // await deleteObject();
  // await listObjects();
};

init();
