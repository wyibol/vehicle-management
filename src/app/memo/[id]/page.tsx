"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ConfirmDialog";
import { SkeletonCard } from "@/components/Skeleton";
import {
  AlertTriangle,
  ArrowLeft,
  Pencil,
  Pin,
  PinOff,
  Save,
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

export default function MemoDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const totalLength = editTitle.length + editBody.length;

  const fetchNote = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/notes/${params.id}`, { cache: "no-store" });
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      if (!res.ok) throw new Error();
      const data = await res.json();
      setNote(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchNote();
  }, [fetchNote]);

  const startEdit = () => {
    if (!note) return;
    const { title, body } = splitContent(note.content);
    setEditTitle(title);
    setEditBody(body);
    setEditing(true);
  };

  const handleSave = async () => {
    if (!note || saving) return;
    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle) {
      setAlertMessage("タイトルを入力してください");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/notes/${note.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmedTitle, body: editBody }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setAlertMessage(data?.error || "メモの更新に失敗しました");
        return;
      }
      const updated = await res.json();
      setNote(updated);
      setEditing(false);
    } catch {
      setAlertMessage("メモの更新に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const togglePin = async () => {
    if (!note) return;
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
      setNote(updated);
    } catch {
      setAlertMessage("ピン留めの更新に失敗しました");
    }
  };

  const handleDelete = async () => {
    if (!note || isDeleting) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/notes/${note.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setAlertMessage("削除に失敗しました");
        return;
      }
      router.push("/memo");
    } catch {
      setAlertMessage("削除に失敗しました");
    } finally {
      setIsDeleting(false);
      setDeleteOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="text-center py-16">
        <p className="text-sm font-medium text-ink-muted">
          メモが見つかりません
        </p>
        <Link
          href="/memo"
          className="inline-flex items-center gap-1.5 mt-4 text-primary hover:text-primary-hover hover:underline transition-colors"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
          メモ一覧に戻る
        </Link>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="text-center py-16">
        <p className="text-sm font-medium text-danger">メモの取得に失敗しました</p>
        <button
          onClick={fetchNote}
          className="mt-4 text-primary hover:text-primary-hover hover:underline transition-colors"
        >
          再読み込み
        </button>
      </div>
    );
  }

  const { title, body } = splitContent(note.content);

  return (
    <div>
      <Link
        href="/memo"
        className="inline-flex items-center gap-1.5 text-[13px] text-ink-subtle hover:text-ink-muted transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
        メモ一覧に戻る
      </Link>

      {editing ? (
        <div className="card p-4">
          <h2 className="text-[17px] font-semibold tracking-[-0.2px] text-ink mb-4">
            メモを編集
          </h2>
          <input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            maxLength={MAX_TITLE_LENGTH}
            placeholder="タイトル（大見出し）"
            className="field text-[17px] font-semibold tracking-[-0.2px]"
          />
          <textarea
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            maxLength={MAX_CONTENT_LENGTH}
            rows={8}
            placeholder="メモ内容…"
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditing(false)}
                className="btn-secondary"
                disabled={saving}
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                className="btn-primary"
                disabled={!editTitle.trim() || saving}
              >
                <Save className="w-4 h-4" strokeWidth={1.75} />
                {saving ? "保存中..." : "保存する"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card p-5 md:p-6">
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-[26px] md:text-[32px] leading-tight font-semibold tracking-[-0.6px] text-ink break-words flex-1">
              {title}
            </h1>
            {note.pinned && (
              <span className="inline-flex items-center gap-1 text-xs text-primary bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5 shrink-0 mt-1">
                <Pin className="w-3 h-3" strokeWidth={2} />
                ピン留め中
              </span>
            )}
          </div>

          <p className="text-xs text-ink-tertiary mt-2">
            {formatDate(note.created_at)}
          </p>

          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
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

          <div className="border-t border-hairline mt-4 pt-4">
            {body ? (
              <p className="text-[15px] leading-relaxed text-ink-muted whitespace-pre-wrap break-words">
                {body}
              </p>
            ) : (
              <p className="text-sm text-ink-subtle">（本文なし）</p>
            )}
          </div>

          <div className="flex items-center gap-2 mt-6">
            <button onClick={togglePin} className="btn-secondary">
              {note.pinned ? (
                <PinOff className="w-4 h-4" strokeWidth={1.75} />
              ) : (
                <Pin className="w-4 h-4" strokeWidth={1.75} />
              )}
              {note.pinned ? "ピン留め解除" : "ピン留め"}
            </button>
            <button onClick={startEdit} className="btn-secondary">
              <Pencil className="w-4 h-4" strokeWidth={1.75} />
              編集
            </button>
            <button onClick={() => setDeleteOpen(true)} className="btn-danger ml-auto">
              <Trash2 className="w-4 h-4" strokeWidth={1.75} />
              削除
            </button>
          </div>
        </div>
      )}

      <AlertDialog
        message={alertMessage}
        onClose={() => setAlertMessage(null)}
      />

      <ConfirmDialog
        isOpen={deleteOpen}
        title="メモを削除"
        message="このメモを削除します。削除したデータは復元できません。"
        confirmText={isDeleting ? "削除中..." : "削除する"}
        cancelText="キャンセル"
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
        variant="danger"
      />
    </div>
  );
}
