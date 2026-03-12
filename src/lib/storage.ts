import {
  S3Client,
  CreateBucketCommand,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';

export const s3 = new S3Client({
  endpoint: config.storage.endpoint,
  region: config.storage.region,
  credentials: {
    accessKeyId: config.storage.accessKey,
    secretAccessKey: config.storage.secretKey,
  },
  forcePathStyle: true,
});

export async function ensureBucket(): Promise<void> {
  try {
    await s3.send(new CreateBucketCommand({ Bucket: config.storage.bucket }));
    logger.info({ bucket: config.storage.bucket }, 'S3 bucket created');
  } catch (error: unknown) {
    const code = (error as { name?: string }).name;
    if (
      code === 'BucketAlreadyOwnedByYou' ||
      code === 'BucketAlreadyExists'
    ) {
      logger.debug({ bucket: config.storage.bucket }, 'S3 bucket already exists');
      return;
    }
    throw error;
  }
}

export async function putObject(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string,
): Promise<void> {
  await s3.send(
    new PutObjectCommand({
      Bucket: config.storage.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

export async function getObject(
  key: string,
): Promise<{ body: Uint8Array; contentType: string }> {
  const response = await s3.send(
    new GetObjectCommand({
      Bucket: config.storage.bucket,
      Key: key,
    }),
  );
  const body = await response.Body!.transformToByteArray();
  return { body, contentType: response.ContentType ?? 'application/octet-stream' };
}

export async function deleteObject(key: string): Promise<void> {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: config.storage.bucket,
      Key: key,
    }),
  );
}
