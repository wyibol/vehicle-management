import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET /api/vehicles/[id] - 車両詳細を取得
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabaseAdmin
      .from("vehicles")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "車両が見つかりません" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: "車両情報の取得に失敗しました: " + error.message },
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

// PUT /api/vehicles/[id] - 車両情報を更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { plate_number, car_model, front_image, rear_image, left_image, right_image } = body;

    if (!plate_number) {
      return NextResponse.json(
        { error: "ナンバーは必須です" },
        { status: 400 }
      );
    }

    const updateData: Record<string, string> = {
      plate_number,
      updated_at: new Date().toISOString(),
    };

    if (car_model) updateData.car_model = car_model;
    if (front_image) updateData.front_image = front_image;
    if (rear_image) updateData.rear_image = rear_image;
    if (left_image) updateData.left_image = left_image;
    if (right_image) updateData.right_image = right_image;

    const { data, error } = await supabaseAdmin
      .from("vehicles")
      .update(updateData)
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "車両情報の更新に失敗しました: " + error.message },
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

// DELETE /api/vehicles/[id] - 車両を削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // First, get the vehicle to find image URLs for deletion
    const { data: vehicle, error: fetchError } = await supabaseAdmin
      .from("vehicles")
      .select("*")
      .eq("id", params.id)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { error: "車両が見つかりません" },
        { status: 404 }
      );
    }

    // Delete the vehicle record
    const { error: deleteError } = await supabaseAdmin
      .from("vehicles")
      .delete()
      .eq("id", params.id);

    if (deleteError) {
      return NextResponse.json(
        { error: "車両の削除に失敗しました: " + deleteError.message },
        { status: 500 }
      );
    }

    // Try to delete associated images (best effort)
    const imageUrls = [
      vehicle.front_image,
      vehicle.rear_image,
      vehicle.left_image,
      vehicle.right_image,
    ].filter((p): p is string => p !== null);

    if (imageUrls.length > 0) {
      const bucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "vehicle-images";
      const paths = imageUrls.map((url: string) => {
        const parts = url.split(`/public/${bucket}/`);
        return parts.length >= 2 ? parts[1] : null;
      }).filter((p): p is string => p !== null);

      if (paths.length > 0) {
        await supabaseAdmin.storage.from(bucket).remove(paths);
      }
    }

    return NextResponse.json({ message: "削除しました" });
  } catch (error) {
    return NextResponse.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}
