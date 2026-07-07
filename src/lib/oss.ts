import OSS from "ali-oss";

function getOssClientOnce(): OSS {
  const region = process.env.OSS_REGION;
  const accessKeyId = process.env.OSS_ACCESS_KEY_ID;
  const accessKeySecret = process.env.OSS_ACCESS_KEY_SECRET;
  const bucket = process.env.OSS_BUCKET;

  if (!region || !accessKeyId || !accessKeySecret || !bucket) {
    throw new Error(
      "Missing Alibaba Cloud OSS environment variables. " +
      "Set OSS_REGION, OSS_ACCESS_KEY_ID, OSS_ACCESS_KEY_SECRET, and OSS_BUCKET."
    );
  }
  return new OSS({ region, accessKeyId, accessKeySecret, bucket });
}

let _ossClient: OSS | null = null;
function getOssClient(): OSS {
  if (!_ossClient) _ossClient = getOssClientOnce();
  return _ossClient;
}

export { getOssClient };

export function getOssPublicUrl(): string {
  const bucket = process.env.OSS_BUCKET;
  const region = process.env.OSS_REGION;
  return `https://${bucket}.${region}.aliyuncs.com`;
}

export function getOssObjectKey(publicUrl: string): string | null {
  try {
    const parsed = new URL(publicUrl);
    if (!parsed.hostname.endsWith(".aliyuncs.com")) return null;
    return parsed.pathname.startsWith("/")
      ? parsed.pathname.slice(1)
      : parsed.pathname;
  } catch {
    return null;
  }
}
