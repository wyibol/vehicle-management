import { NextRequest, NextResponse } from "next/server";
import { getOssClient, getOssPublicUrl } from "@/lib/oss";
import sharp from "sharp";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "ファイルが送信されていません" },
        { status: 400 }
      );
    }

    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json(
        { error: "ファイルサイズは20MB以下にしてください" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "画像ファイルのみアップロード可能です" },
        { status: 400 }
      );
    }

    // Convert to WebP using sharp (server-side, 100% reliable)
    const inputBuffer = Buffer.from(await file.arrayBuffer());
    const webpBuffer = await sharp(inputBuffer)
      .webp({ quality: 95, effort: 4 })
      .toBuffer();
    const uniqueName = `${crypto.randomUUID()}.webp`;

    const client = getOssClient();
    await client.put(uniqueName, webpBuffer, {
      mime: "image/webp",
      headers: { "Cache-Control": "public, max-age=31536000" },
    });

    const baseUrl = getOssPublicUrl();
    const publicUrl = `${baseUrl}/${uniqueName}`;

    return NextResponse.json({ url: publicUrl }, { status: 200 });
  } catch (error) {
    console.error("OSS Upload Error:", error);
    return NextResponse.json(
      { error: "アップロードに失敗しました" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { urls } = await request.json();
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: "削除するURLが指定されていません" },
        { status: 400 }
      );
    }

    const client = getOssClient();
    for (const url of urls) {
      if (!url) continue;
      const { getOssObjectKey } = await import("@/lib/oss");
      const objectKey = getOssObjectKey(url);
      if (objectKey) {
        await client.delete(objectKey).catch((e: Error) => {
          console.error("OSS削除エラー:", e.message);
        });
      }
    }

    return NextResponse.json({ message: "削除しました" });
  } catch (error) {
    console.error("OSS Delete Error:", error);
    return NextResponse.json(
      { error: "削除に失敗しました" },
      { status: 500 }
    );
  }
}
