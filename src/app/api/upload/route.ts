import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

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

    const fileExt = file.name.split(".").pop() || "jpg";
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const bucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "vehicle-images";

    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: `アップロードに失敗しました: ${uploadError.message}` },
        { status: 500 }
      );
    }

    const { data: urlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return NextResponse.json({ url: urlData.publicUrl }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { urls } = await request.json();
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: "削除するURLが指定されていません" }, { status: 400 });
    }

    const bucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "vehicle-images";
    const paths: string[] = [];

    for (const url of urls) {
      if (!url) continue;
      const parts = url.split(`/public/${bucket}/`);
      if (parts.length >= 2) {
        paths.push(parts[1]);
      }
    }

    if (paths.length > 0) {
      const { error } = await supabaseAdmin.storage.from(bucket).remove(paths);
      if (error) {
        console.error("Storage削除エラー:", error.message);
      }
    }

    return NextResponse.json({ message: "削除しました" });
  } catch (error) {
    return NextResponse.json(
      { error: "削除に失敗しました" },
      { status: 500 }
    );
  }
}
