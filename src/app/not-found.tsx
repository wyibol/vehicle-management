import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-center py-16">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">404</h2>
      <p className="text-gray-600 mb-6">お探しのページが見つかりませんでした</p>
      <Link
        href="/"
        className="inline-block px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
      >
        トップに戻る
      </Link>
    </div>
  );
}
