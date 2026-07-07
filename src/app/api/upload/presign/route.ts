import { NextRequest, NextResponse } from "next/server";
import { getOssClient, getOssPublicUrl } from "@/lib/oss";

export async function POST(request: NextRequest) {
  try {
    const { fileName, fileType, fileSize } = await request.json();

    if (!fileName || !fileType || !fileSize) {
      return NextResponse.json(
        { error: "ファイル情報が不足しています" },
        { status: 400 }
      );
    }

    if (!fileType.startsWith("image/")) {
      return NextResponse.json(
        { error: "画像ファイルのみアップロード可能です" },
        { status: 400 }
      );
    }

    if (fileSize > 20 * 1024 * 1024) {
      return NextResponse.json(
        { error: "ファイルサイズは20MB以下にしてください" },
        { status: 400 }
      );
    }

    const fileExt = fileName.split(".").pop() || "jpg";
    const uniqueName = `${crypto.randomUUID()}.${fileExt}`;

    const signedUrl = getOssClient().signatureUrl(uniqueName, {
      expires: 3600,
      method: "PUT",
      "Content-Type": fileType,
    });

    const publicUrl = getOssPublicUrl(uniqueName);

    return NextResponse.json({ signedUrl, publicUrl }, { status: 200 });
  } catch (error) {
    console.error("OSS Presign Error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
