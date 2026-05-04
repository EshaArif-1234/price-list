import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

const MAX_BYTES = 8 * 1024 * 1024;

function cloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

export async function POST(req: Request) {
  if (!cloudinaryConfigured()) {
    return NextResponse.json(
      {
        error:
          "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env.local.",
      },
      { status: 503 },
    );
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Choose an image file." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `Image must be ${MAX_BYTES / (1024 * 1024)}MB or smaller.` },
      { status: 400 },
    );
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const folder =
    process.env.CLOUDINARY_UPLOAD_FOLDER?.trim() || "price-list-products";

  try {
    const uploadResult = await new Promise<{ secure_url: string }>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder, resource_type: "image" },
          (err, result) => {
            if (err) reject(err);
            else if (!result?.secure_url)
              reject(new Error("Upload returned no URL."));
            else resolve(result as { secure_url: string });
          },
        );
        stream.end(buf);
      },
    );
    return NextResponse.json({ url: uploadResult.secure_url });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Image upload failed." }, { status: 502 });
  }
}
