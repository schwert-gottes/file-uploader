import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import connectDB from "@/app/lib/mongodb";
import File from "@/app/models/File";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const key = `uploads/${Date.now()}-${file.name}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: Buffer.from(buffer),
        ContentType: file.type,
      })
    );

    const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    // Store file information in MongoDB
    await connectDB();
    await File.create({
      name: file.name,
      url,
      size: file.size,
      type: file.type,
    });

    return NextResponse.json({
      success: true,
      key,
      url,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
