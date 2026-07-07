import { NextRequest, NextResponse } from "next/server";
import { getOssClient, getOssObjectKey } from "@/lib/oss";

export async function DELETE(request: NextRequest) {
  try {
    const { urls } = await request.json();
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: "削除するURLが指定されていません" },
        { status: 400 }
      );
    }

    for (const url of urls) {
      if (!url) continue;
      const objectKey = getOssObjectKey(url);
      if (objectKey) {
        await getOssClient().delete(objectKey).catch((e: Error) => {
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
