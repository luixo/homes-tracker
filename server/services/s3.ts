import * as AWS from "aws-sdk";
import { CredentialsOptions } from "aws-sdk/lib/credentials";
import winston from "winston";

const CREDENTIALS: CredentialsOptions = {
  accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
  secretAccessKey: process.env.SECRET_ACCESS_KEY || "",
};
const BUCKET = process.env.S3_BUCKET || "";
const s3Provider = new AWS.S3({
  endpoint: "https://storage.yandexcloud.net",
  credentials: CREDENTIALS,
});

const verifyCredentials = () => {
  if (!CREDENTIALS.accessKeyId || !CREDENTIALS.secretAccessKey || !BUCKET) {
    throw new Error(
      "Please provider S3_ACCESS_KEY_ID, SECRET_ACCESS_KEY and S3_BUCKET environment variables"
    );
  }
};

const getS3Logger = (logger: winston.Logger): winston.Logger => {
  return logger.child({ service: "s3" });
};

const withLogger = async <T>(
  logger: winston.Logger,
  name: string,
  fn: () => Promise<T>,
  shouldSkipError?: (errpr: unknown) => T | null
): Promise<T> => {
  logger = getS3Logger(logger);
  verifyCredentials();
  try {
    logger.info(`${name} started`);
    const result = await fn();
    logger.info(`${name} succeed`);
    return result;
  } catch (error) {
    const result = (await shouldSkipError?.(error)) ?? null;
    if (result !== null) {
      return result;
    }
    logger.error(`${name} failed`, error);
    throw error;
  }
};

export const getS3Keys = async <T>(
  logger: winston.Logger,
  keys: string[]
): Promise<T[]> => {
  return withLogger(logger, `Get keys ${keys.join(", ")}`, async () => {
    return await Promise.all(
      keys.map(async (key) => {
        const objectPromise = await s3Provider
          .getObject({
            Bucket: BUCKET,
            Key: key,
          })
          .promise();
        if (!objectPromise.Body) {
          throw new Error("Body is empty!");
        }
        const parsed = JSON.parse(objectPromise.Body.toString("utf-8"));
        return parsed;
      })
    );
  });
};

export const getS3Key = async <T>(
  logger: winston.Logger,
  key: string
): Promise<T | undefined> => {
  return withLogger(
    logger,
    `Get key ${key}`,
    async () => {
      const objectPromise = await s3Provider
        .getObject({
          Bucket: BUCKET,
          Key: key,
        })
        .promise();
      if (!objectPromise.Body) {
        throw new Error("Body is empty!");
      }
      const parsed = JSON.parse(objectPromise.Body.toString("utf-8"));
      return parsed;
    },
    (error) => {
      return String(error).includes("NoSuchKey") ? undefined : null;
    }
  );
};

export const putS3Key = async <T>(
  logger: winston.Logger,
  key: string,
  data: T
): Promise<void> => {
  return withLogger(logger, `Put key ${key}`, async () => {
    await s3Provider
      .putObject({
        Bucket: BUCKET,
        Key: key,
        Body: JSON.stringify(data),
      })
      .promise();
  });
};

const listS3Keys = async (
  logger: winston.Logger,
  continuationToken?: string,
  prefix?: string
): Promise<{ keys: string[]; continuationToken?: string }> => {
  return withLogger(
    logger,
    `List keys${prefix ? ` with prefix ${prefix}` : ""}`,
    async () => {
      const list = await s3Provider
        .listObjectsV2({
          Bucket: BUCKET,
          Prefix: prefix,
          MaxKeys: 1000,
          ContinuationToken: continuationToken,
        })
        .promise();
      if (!list.Contents) {
        throw new Error("No contents on list");
      }
      const keys = list.Contents.map((content) => content.Key).filter(
        (key): key is string => Boolean(key)
      );
      return {
        keys,
        continuationToken: list.IsTruncated
          ? list.ContinuationToken
          : undefined,
      };
    }
  );
};

export const listAllKeys = async (
  logger: winston.Logger,
  prefix?: string
): Promise<string[]> => {
  let keys: string[] = [];
  let continuationToken: string | undefined;
  logger.info(`List all keys: started`);
  do {
    const results = await listS3Keys(logger, continuationToken, prefix);
    keys = keys.concat(results.keys);
    continuationToken = results.continuationToken;
  } while (continuationToken);
  logger.info(`List all keys: ${keys.length} keys fetched`);
  return keys;
};

export const removeKeys = async (logger: winston.Logger, keys: string[]) => {
  return withLogger(logger, `Delete ${keys.length} keys`, async () => {
    await s3Provider
      .deleteObjects({
        Bucket: BUCKET,
        Delete: {
          Objects: keys.map((key) => ({ Key: key })),
        },
      })
      .promise();
  });
};
