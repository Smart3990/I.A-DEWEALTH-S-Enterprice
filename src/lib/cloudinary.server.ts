import { v2 as cloudinary } from "cloudinary";

function getCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    if (process.env.CLOUDINARY_URL) {
      return cloudinary;
    }
    throw new Error(
      "Cloudinary is not configured. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your environment settings.",
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return cloudinary;
}

export async function uploadToCloudinary({
  fileData,
  filename,
  folder = "iadewealth",
}: {
  fileData: string;
  filename?: string;
  folder?: string;
}) {
  const client = getCloudinary();
  const res = await client.uploader.upload(fileData, {
    folder,
    resource_type: "auto",
    use_filename: true,
    unique_filename: true,
  });
  return {
    url: res.secure_url,
    publicId: res.public_id,
    bytes: res.bytes,
    format: res.format,
  };
}

export async function deleteFromCloudinary(publicId: string) {
  const client = getCloudinary();
  return client.uploader.destroy(publicId);
}
