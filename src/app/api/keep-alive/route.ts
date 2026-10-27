import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// このルートは vercel.json の crons から定期実行される keep-alive 用。
// Supabase の無料プランは約7日間アクセスがないとプロジェクトが一時停止するため、
// 定期的に DB へクエリを投げて「使用中」であることを維持する。

// ビルド時に静的化されないよう、リクエスト毎に必ず実行する
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("vehicles")
      .select("id")
      .limit(1);

    if (error) {
      return NextResponse.json(
        { ok: false, error: "keep-alive クエリに失敗しました: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, rows: data?.length ?? 0 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "keep-alive の実行に失敗しました" },
      { status: 500 }
    );
  }
}
