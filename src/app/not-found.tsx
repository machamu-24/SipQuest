import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto grid w-full max-w-xl gap-3 rounded-2xl border border-[#d8cfbf] bg-[#fffcf5] p-6 text-center">
      <h1 className="text-xl font-bold text-[#123524]">記録が見つかりません</h1>
      <p className="text-sm text-[#6e685b]">削除されたか、URLが誤っている可能性があります。</p>
      <Link href="/" className="text-sm font-semibold text-[#2d6a4f] hover:underline">
        一覧へ戻る
      </Link>
    </section>
  );
}
