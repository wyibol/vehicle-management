"use client";

import { useCallback, useEffect, useState } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";
import { SkeletonCard } from "@/components/Skeleton";
import { Pin, PinOff, Send, StickyNote, Trash2 } from "lucide-react";

type Note = {
  id: string;
  content: string;
  tags: string[] | null;
  pinned: boolean;
  created_at: string;
};

const MAX_CONTENT_LENGTH = 2000;

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${y}/${m}/${d} ${h}:${min}`;
}

function sortNotes(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export default function MemoPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/notes", { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setNotes(data);
    } catch {
      setError("メモの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.error || "投稿に失敗しました");
        return;
      }
      const created = await res.json();
      setNotes((prev) => sortNotes([created, ...prev]));
      setContent("");
    } catch {
      alert("投稿に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  const togglePin = async (note: Note) => {
    try {
      const res = await fetch(`/api/notes/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned: !note.pinned }),
      });
      if (!res.ok) {
        alert("ピン留めの更新に失敗しました");
        return;
      }
      const updated = await res.json();
      setNotes((prev) =>
        sortNotes(prev.map((n) => (n.id === note.id ? updated : n)))
      );
    } catch {
      alert("ピン留めの更新に失敗しました");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || isDeleting) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/notes/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        alert("削除に失敗しました");
        return;
      }
      setNotes((prev) => prev.filter((n) => n.id !== deleteTarget.id));
    } catch {
      alert("削除に失敗しました");
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h1 className="text-[28px] md:text-[32px] leading-tight font-semibold tracking-[-0.6px] text-ink">
          共有メモ
        </h1>
        <p className="text-[13px] text-ink-subtle mt-1.5">
          みんなで共有する業務記録
        </p>
      </div>

      {/* 投稿フォーム */}
      <div className="card p-4 mb-6">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={MAX_CONTENT_LENGTH}
          rows={3}
          placeholder="業務メモを入力…（例：#洗車 本日の洗車対応 完了）"
          className="field resize-none leading-relaxed"
        />
        <div className="flex items-center justify-between mt-3 gap-3">
          <span
            className={`text-xs ${
              content.length >= MAX_CONTENT_LENGTH
                ? "text-danger"
                : "text-ink-tertiary"
            }`}
          >
            {content.length} / {MAX_CONTENT_LENGTH}文字
          </span>
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || submitting}
            className="btn-primary"
          >
            <Send className="w-4 h-4" strokeWidth={1.75} />
            {submitting ? "投稿中..." : "投稿する"}
          </button>
        </div>
      </div>

      {/* メモ一覧 */}
      {loading ? (
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-sm font-medium text-danger">{error}</p>
          <button
            onClick={fetchNotes}
            className="mt-4 text-primary hover:text-primary-hover hover:underline transition-colors"
          >
            再読み込み
          </button>
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-16">
          <StickyNote
            className="w-10 h-10 mx-auto text-ink-tertiary"
            strokeWidth={1.25}
          />
          <p className="text-sm font-medium text-ink-muted mt-3">
            まだメモがありません
          </p>
          <p className="text-xs text-ink-subtle mt-1">
            最初のメモを投稿してみましょう
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className={`card p-4 flex flex-col ${
                note.pinned ? "border-primary/40" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-[15px] leading-relaxed text-ink whitespace-pre-wrap break-words flex-1">
                  {note.content}
                </p>
                <div className="flex gap-0.5 shrink-0">
                  <button
                    onClick={() => togglePin(note)}
                    aria-label={note.pinned ? "ピン留めを解除" : "ピン留め"}
                    className={`p-1.5 rounded-md transition-colors ${
                      note.pinned
                        ? "text-primary hover:bg-primary/10"
                        : "text-ink-tertiary hover:text-ink-muted hover:bg-surface-2"
                    }`}
                  >
                    {note.pinned ? (
                      <Pin className="w-4 h-4" strokeWidth={1.75} />
                    ) : (
                      <PinOff className="w-4 h-4" strokeWidth={1.75} />
                    )}
                  </button>
                  <button
                    onClick={() => setDeleteTarget(note)}
                    aria-label="削除"
                    className="p-1.5 rounded-md text-ink-tertiary hover:text-danger hover:bg-danger/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                  </button>
                </div>
              </div>

              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {note.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs text-primary bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-xs text-ink-tertiary mt-3">
                {formatDate(note.created_at)}
              </p>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="メモを削除"
        message="このメモを削除します。削除したデータは復元できません。"
        confirmText={isDeleting ? "削除中..." : "削除する"}
        cancelText="キャンセル"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        variant="danger"
      />
    </div>
  );
}
