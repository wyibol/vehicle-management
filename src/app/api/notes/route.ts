import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const MAX_CONTENT_LENGTH = 2000;

// 投稿内容から #タグ を抽出（重複は除く）
function extractTags(content: string): string[] {
  const matches = content.match(/#[^\s#]{1,30}/g) || [];
  return Array.from(new Set(matches.map((t) => t.slice(1))));
}

// GET /api/notes - 共有メモ一覧を取得（公開メモのみ）
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("notes")
      .select("*")
      .eq("visibility", "public")
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "メモの取得に失敗しました: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store, must-revalidate" },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}

// POST /api/notes - 共有メモを投稿（現在は認証なし・公開のみ）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const content = typeof body?.content === "string" ? body.content.trim() : "";

    if (!content) {
      return NextResponse.json(
        { error: "メモの内容を入力してください" },
        { status: 400 }
      );
    }

    if (content.length > MAX_CONTENT_LENGTH) {
      return NextResponse.json(
        { error: `メモは${MAX_CONTENT_LENGTH}文字以内で入力してください` },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("notes")
      .insert({
        content,
        visibility: "public", // 将来アカウント機能追加時: staff / private に対応
        tags: extractTags(content),
        pinned: false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "メモの投稿に失敗しました: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}
