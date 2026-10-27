import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  composeContent,
  extractTags,
  MAX_CONTENT_LENGTH,
  MAX_TITLE_LENGTH,
} from "@/lib/memo";

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
// body: { title, body }（大タイトル + 本文）または旧形式 { content }
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    let title: string;
    let bodyText: string;
    if (typeof payload?.title === "string") {
      title = payload.title;
      bodyText = typeof payload.body === "string" ? payload.body : "";
    } else if (typeof payload?.content === "string") {
      const parts = payload.content.split(/\r?\n/);
      title = parts[0] ?? "";
      bodyText = parts.slice(1).join("\n");
    } else {
      return NextResponse.json(
        { error: "タイトルを入力してください" },
        { status: 400 }
      );
    }

    title = title.trim();
    bodyText = bodyText.trim();

    if (!title) {
      return NextResponse.json(
        { error: "タイトルを入力してください" },
        { status: 400 }
      );
    }

    if (title.length > MAX_TITLE_LENGTH) {
      return NextResponse.json(
        { error: `タイトルは${MAX_TITLE_LENGTH}文字以内で入力してください` },
        { status: 400 }
      );
    }

    const content = composeContent(title, bodyText);
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
