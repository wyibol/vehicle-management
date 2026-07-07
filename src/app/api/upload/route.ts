import { NextRequest, NextResponse } from "next/server";
import { getOssClient, getOssPublicUrl } from "@/lib/oss";

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

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "ファイルサイズは5MB以下にしてください" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "画像ファイルのみアップロード可能です" },
        { status: 400 }
      );
    }

    const fileExt = file.name.split(".").pop() || "jpg";
    const uniqueName = `${crypto.randomUUID()}.${fileExt}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const client = getOssClient();

    await client.put(uniqueName, buffer, {
      mime: file.type,
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
