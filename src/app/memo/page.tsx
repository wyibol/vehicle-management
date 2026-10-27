"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import ConfirmDialog from "@/components/ConfirmDialog";
import { SkeletonCard } from "@/components/Skeleton";
import {
  AlertTriangle,
  ChevronRight,
  Pin,
  PinOff,
  Send,
  StickyNote,
  Trash2,
} from "lucide-react";
import {
  MAX_CONTENT_LENGTH,
  MAX_TITLE_LENGTH,
  splitContent,
  type Note,
} from "@/lib/memo";

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

function AlertDialog({
  message,
  onClose,
}: {
  message: string | null;
  onClose: () => void;
}) {
  if (!message) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-surface-2 border border-hairline rounded-xl w-full max-w-sm">
        <div className="p-6">
          <div className="flex items-center gap-2.5 mb-2">
            <AlertTriangle
              className="w-5 h-5 text-danger shrink-0"
              strokeWidth={1.75}
            />
            <h3 className="text-[17px] font-semibold tracking-[-0.2px] text-ink">
              エラー
            </h3>
          </div>
          <p className="text-sm text-ink-muted leading-relaxed break-words">
            {message}
          </p>
        </div>
        <div className="px-6 pb-6 flex justify-center">
          <button onClick={onClose} className="btn-primary px-10">
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MemoPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const totalLength = title.length + body.length + (body.trim() ? 2 : 0);

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
    const trimmedTitle = title.trim();
    if (!trimmedTitle || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmedTitle, body }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setAlertMessage(data?.error || "投稿に失敗しました");
        return;
      }
      const created = await res.json();
      setNotes((prev) => sortNotes([created, ...prev]));
      setTitle("");
      setBody("");
    } catch {
      setAlertMessage("投稿に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  const togglePin = async (e: React.MouseEvent, note: Note) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch(`/api/notes/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned: !note.pinned }),
      });
      if (!res.ok) {
        setAlertMessage("ピン留めの更新に失敗しました");
        return;
      }
      const updated = await res.json();
      setNotes((prev) =>
        sortNotes(prev.map((n) => (n.id === note.id ? updated : n)))
      );
    } catch {
      setAlertMessage("ピン留めの更新に失敗しました");
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
        setAlertMessage("削除に失敗しました");
        return;
      }
      setNotes((prev) => prev.filter((n) => n.id !== deleteTarget.id));
    } catch {
      setAlertMessage("削除に失敗しました");
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
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={MAX_TITLE_LENGTH}
          placeholder="タイトル（大見出し）"
          className="field text-[17px] font-semibold tracking-[-0.2px]"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={MAX_CONTENT_LENGTH}
          rows={4}
          placeholder="メモ内容…（一覧には表示されず、タップして開くと表示されます）"
          className="field resize-none leading-relaxed mt-3"
        />
        <div className="flex items-center justify-between mt-3 gap-3">
          <span
            className={`text-xs ${
              totalLength >= MAX_CONTENT_LENGTH
                ? "text-danger"
                : "text-ink-tertiary"
            }`}
          >
            {totalLength} / {MAX_CONTENT_LENGTH}文字
          </span>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || submitting}
            className="btn-primary"
          >
            <Send className="w-4 h-4" strokeWidth={1.75} />
            {submitting ? "投稿中..." : "投稿する"}
          </button>
        </div>
      </div>

      {/* メモ一覧（大タイトルのみ表示、タップで詳細へ） */}
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
        <div className="space-y-3">
          {notes.map((note) => {
            const { title: noteTitle, body: noteBody } = splitContent(
              note.content
            );
            return (
              <Link
                key={note.id}
                href={`/memo/${note.id}`}
                className={`card p-4 block transition-colors hover:border-hairline-strong ${
                  note.pinned ? "border-primary/40" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[17px] font-semibold tracking-[-0.2px] text-ink leading-snug break-words flex-1">
                    {noteTitle}
                  </p>
                  <div className="flex gap-0.5 shrink-0">
                    <button
                      onClick={(e) => togglePin(e, note)}
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
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDeleteTarget(note);
                      }}
                      aria-label="削除"
                      className="p-1.5 rounded-md text-ink-tertiary hover:text-danger hover:bg-danger/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2.5">
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 flex-1">
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
                  {noteBody && (
                    <span className="text-[11px] text-ink-tertiary shrink-0 ml-auto">
                      本文あり
                    </span>
                  )}
                  <ChevronRight
                    className="w-4 h-4 text-ink-tertiary shrink-0"
                    strokeWidth={2}
                  />
                </div>

                <p className="text-xs text-ink-tertiary mt-1.5">
                  {formatDate(note.created_at)}
                </p>
              </Link>
            );
          })}
        </div>
      )}

      <AlertDialog
        message={alertMessage}
        onClose={() => setAlertMessage(null)}
      />

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
