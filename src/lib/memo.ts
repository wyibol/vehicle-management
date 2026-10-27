// 共有メモの「大タイトル」規約:
// content カラムには `タイトル\n\n本文` の形式で保存し、
// タイトルが先頭行、本文が残り(先頭の空行は無視)となる。
// 旧データ(本文のみ)は 1 行目がタイトル、残りが本文として扱う。

export const MAX_TITLE_LENGTH = 100;
export const MAX_CONTENT_LENGTH = 2000;

export type Note = {
  id: string;
  content: string;
  tags: string[] | null;
  pinned: boolean;
  created_at: string;
  visibility?: string;
};

export function splitContent(content: string): {
  title: string;
  body: string;
} {
  const idx = content.search(/\r?\n/);
  if (idx === -1) {
    return { title: content.trim(), body: "" };
  }
  const title = content.slice(0, idx).trim();
  const body = content.slice(idx).replace(/^\s+/, "").trim();
  return { title: title || content.trim(), body };
}

export function composeContent(title: string, body: string): string {
  const t = title.trim();
  const b = body.trim();
  return b ? `${t}\n\n${b}` : t;
}

// 本文中の #タグ を抽出（重複は除く）
export function extractTags(text: string): string[] {
  const matches = text.match(/#[^\s#]{1,30}/g) || [];
  return Array.from(new Set(matches.map((t) => t.slice(1))));
}
