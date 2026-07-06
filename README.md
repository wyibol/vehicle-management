# 車両管理システム

車両情報を管理するWebアプリケーション。ナンバープレート検索、写真管理、PWA対応。

## 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **データベース**: Supabase (PostgreSQL + Storage)
- **デプロイ**: Vercel
- **PWA**: 対応（オフライン対応、ホーム画面追加）

## 機能

- ナンバープレートによるあいまい検索
- 車両詳細表示（4方向写真）
- 写真の全画面表示（ピンチズーム・スワイプ対応）
- 新規車両登録（4枚の写真必須）
- 車両情報編集（写真差し替え可能）
- 車両削除（確認ダイアログ付き）
- 写真のドラッグ＆ドロップ対応
- iPhoneカメラ撮影対応
- レスポンシブデザイン（PC/スマホ）
- PWA対応（オフライン対応）

## セットアップ

### 1. 環境変数の設定

`.env.local.example` をコピーして `.env.local` を作成し、Supabaseの認証情報を設定:

```bash
cp .env.local.example .env.local
```

必要な環境変数:

| 変数名 | 説明 |
|--------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | SupabaseプロジェクトのURL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabaseの匿名キー |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabaseのサービスロールキー |
| `NEXT_PUBLIC_STORAGE_BUCKET` | 画像保存用バケット名（デフォルト: vehicle-images） |

### 2. データベースのセットアップ

1. Supabase ダッシュボードを開く
2. SQL Editor で `supabase-setup.sql` を実行
3. Storage バケット `vehicle-images` が作成される
4. テーブル `vehicles` が作成される

### 3. 依存関係のインストール

```bash
pnpm install
```

### 4. 開発サーバーの起動

```bash
pnpm dev
```

### 5. ビルド

```bash
pnpm build
```

## プロジェクト構造

```
vehicle-management/
├── public/
│   ├── manifest.json        # PWAマニフェスト
│   ├── sw.js                # サービスワーカー
│   └── images/              # PWAアイコン
├── src/
│   ├── app/
│   │   ├── layout.tsx       # ルートレイアウト
│   │   ├── page.tsx         # ホームページ（検索）
│   │   ├── globals.css      # グローバルスタイル
│   │   ├── not-found.tsx    # 404ページ
│   │   ├── vehicles/
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx       # 車両詳細
│   │   │   │   └── edit/          # 編集ページ
│   │   │   │       └── page.tsx
│   │   │   └── new/               # 新規登録ページ
│   │   │       └── page.tsx
│   │   └── api/
│   │       ├── vehicles/
│   │       │   ├── route.ts       # GET(検索), POST(作成)
│   │       │   └── [id]/
│   │       │       └── route.ts   # GET, PUT, DELETE
│   ├── lib/
│   │   ├── supabase.ts           # クライアント用Supabase
│   │   ├── supabase-admin.ts     # 管理用Supabase（サービスロール）
│   │   └── upload.ts             # 画像アップロード/削除ヘルパー
│   └── components/
│       ├── ConfirmDialog.tsx     # 確認ダイアログ
│       ├── ImageViewer.tsx       # 画像ビューア（ピンチズーム）
│       ├── PhotoUpload.tsx       # 写真アップロード
│       └── SearchForm.tsx        # 検索フォーム
├── supabase-setup.sql            # DBセットアップSQL
├── .env.local.example
├── next.config.mjs
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## API エンドポイント

| メソッド | パス | 説明 |
|----------|------|------|
| GET | `/api/vehicles?q=検索ワード` | 車両検索（あいまい検索） |
| POST | `/api/vehicles` | 新規車両作成 |
| GET | `/api/vehicles/[id]` | 車両詳細取得 |
| PUT | `/api/vehicles/[id]` | 車両情報更新 |
| DELETE | `/api/vehicles/[id]` | 車両削除（画像も削除） |

## デプロイ（Vercel）

1. GitHub にリポジトリを作成してプッシュ
2. Vercel でインポート
3. 環境変数を設定
4. デプロイ

## 注意事項

- 画像は最大20MBまでアップロード可能
- Supabase Storage バケットは public 設定が必要
- 認証機能は実装していないため、RLSポリシーは全許可設定
- 実運用時は適切な認証・認可を追加推奨
