import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

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
