import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  composeContent,
  extractTags,
  MAX_CONTENT_LENGTH,
  MAX_TITLE_LENGTH,
} from "@/lib/memo";

// GET /api/notes/:id - メモを 1 件取得
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabaseAdmin
      .from("notes")
      .select("*")
      .eq("id", params.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: "メモの取得に失敗しました: " + error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "メモが見つかりません" },
        { status: 404 }
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

// PUT /api/notes/:id - メモの編集（大タイトル + 本文）
// body: { title, body } または旧形式 { content }
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      .update({ content, tags: extractTags(content) })
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "メモの更新に失敗しました: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}

// PATCH /api/notes/:id - ピン留めの切り替え
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const pinned = Boolean(body?.pinned);

    const { data, error } = await supabaseAdmin
      .from("notes")
      .update({ pinned })
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "メモの更新に失敗しました: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}

// DELETE /api/notes/:id - メモを削除
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabaseAdmin
      .from("notes")
      .delete()
      .eq("id", params.id);

    if (error) {
      return NextResponse.json(
        { error: "メモの削除に失敗しました: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}
