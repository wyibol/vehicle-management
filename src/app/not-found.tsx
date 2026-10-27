import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-center py-16">
      <h2 className="text-[40px] font-semibold tracking-[-1px] text-ink mb-4">404</h2>
      <p className="text-[15px] text-ink-muted mb-8">お探しのページが見つかりませんでした</p>
      <Link href="/" className="btn-primary">
        トップに戻る
      </Link>
    </div>
  );
}
