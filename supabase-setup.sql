-- =====================================================
-- Supabase セットアップ用 SQL
-- 使用方法: Supabase ダッシュボード → SQL Editor で実行
-- =====================================================

-- 1. 車両テーブルの作成
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plate_number TEXT NOT NULL,
  car_model TEXT NOT NULL,
  front_image TEXT NOT NULL,
  rear_image TEXT NOT NULL,
  left_image TEXT NOT NULL,
  right_image TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ナンバー検索用インデックス
CREATE INDEX IF NOT EXISTS idx_vehicles_plate_number ON vehicles(plate_number);

-- 2. updated_at 自動更新用トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 3. ストレージバケットの作成
INSERT INTO storage.buckets (id, name, public)
VALUES ('vehicle-images', 'vehicle-images', true)
ON CONFLICT (id) DO NOTHING;

-- 4. ストレージのRLSポリシー（任意のユーザーがアップロード可能に）
-- ※ 認証がないため、RLSを無効化するか以下のポリシーを設定
-- 方法A: RLSを無効化（簡単）
-- Supabase ダッシュボード → Storage → vehicle-images → RL SをOFF
--
-- 方法B: ポリシーを設定（推奨）
CREATE POLICY "Allow public uploads" ON storage.objects
  FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'vehicle-images');

CREATE POLICY "Allow public reads" ON storage.objects
  FOR SELECT
  TO anon
  USING (bucket_id = 'vehicle-images');

CREATE POLICY "Allow public deletes" ON storage.objects
  FOR DELETE
  TO anon
  USING (bucket_id = 'vehicle-images');

-- 5. RLSの有効化（テーブル）
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- 全ての操作を許可（認証なし）
CREATE POLICY "Allow all operations" ON vehicles
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- 6. 動作確認用サンプルデータ（必要に応じて）
-- INSERT INTO vehicles (plate_number, car_model, front_image, rear_image, left_image, right_image)
-- VALUES ('品川300 あ1234', 'トヨタ クラウン',
--   'https://placeholder.supabase.co/storage/v1/object/public/vehicle-images/front.jpg',
--   'https://placeholder.supabase.co/storage/v1/object/public/vehicle-images/rear.jpg',
--   'https://placeholder.supabase.co/storage/v1/object/public/vehicle-images/left.jpg',
--   'https://placeholder.supabase.co/storage/v1/object/public/vehicle-images/right.jpg'
-- );
