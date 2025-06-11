import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import File from "@/app/models/File";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const [files, total] = await Promise.all([
      File.find().sort({ uploadedAt: -1 }).skip(skip).limit(limit),
      File.countDocuments(),
    ]);

    return NextResponse.json({
      files,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json(
      { error: "Failed to fetch files" },
      { status: 500 }
    );
  }
}
