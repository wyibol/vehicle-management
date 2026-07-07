import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

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
    const bucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "vehicle-images";

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUploadUrl(uniqueName);

    if (error) {
      return NextResponse.json(
        { error: `署名付きURLの生成に失敗しました: ${error.message}` },
        { status: 500 }
      );
    }

    const { data: urlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(uniqueName);

    return NextResponse.json({
      signedUrl: data.signedUrl,
      path: data.path,
      publicUrl: urlData.publicUrl,
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
