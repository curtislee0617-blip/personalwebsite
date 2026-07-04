import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("R2 is not configured. Add R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY to .env.local.");
  }
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

/** Uploads a file to the R2 bucket and returns its public URL. Server-only — never import into a Client Component. */
export async function uploadToR2(key: string, body: Buffer, contentType: string) {
  const bucket = process.env.R2_BUCKET_NAME;
  const publicUrlBase = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (!bucket || !publicUrlBase) {
    throw new Error("R2 is not configured. Add R2_BUCKET_NAME and NEXT_PUBLIC_R2_PUBLIC_URL to .env.local.");
  }
  const client = getR2Client();
  await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType }));
  return `${publicUrlBase.replace(/\/$/, "")}/${key}`;
}
