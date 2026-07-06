import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// POST /api/vehicles - 新規車両を作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plate_number, car_model, front_image, rear_image, left_image, right_image } = body;

    if (!plate_number || !car_model || !front_image || !rear_image || !left_image || !right_image) {
      return NextResponse.json(
        { error: "全ての必須フィールドを入力してください" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("vehicles")
      .insert({
        plate_number,
        car_model,
        front_image,
        rear_image,
        left_image,
        right_image,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "車両の作成に失敗しました: " + error.message },
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

// GET /api/vehicles - 車両一覧を取得（または検索）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    let result;

    if (query) {
      // あいまい検索
      result = await supabaseAdmin
        .from("vehicles")
        .select("*")
        .ilike("plate_number", `%${query}%`)
        .order("updated_at", { ascending: false });
    } else {
      result = await supabaseAdmin
        .from("vehicles")
        .select("*")
        .order("updated_at", { ascending: false });
    }

    const { data, error } = result;

    if (error) {
      return NextResponse.json(
        { error: "検索に失敗しました: " + error.message },
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
