export default function SettingsPage() {
  return (
    <section className="mx-auto grid w-full max-w-2xl gap-4 rounded-2xl border border-[#d8cfbf] bg-[#fffcf5] p-4 sm:p-5">
      <h1 className="text-2xl font-bold tracking-tight text-[#123524]">設定</h1>

      <div className="grid gap-2 rounded-xl border border-[#e6dccb] bg-white p-4">
        <h2 className="text-sm font-semibold text-[#2e2a21]">PWAインストール（iPhone / iPad）</h2>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-[#4f493d]">
          <li>Safari でこのアプリを開く</li>
          <li>共有ボタン（四角から上矢印）をタップ</li>
          <li>「ホーム画面に追加」を選択</li>
        </ol>
      </div>

      <div className="grid gap-2 rounded-xl border border-[#e6dccb] bg-white p-4">
        <h2 className="text-sm font-semibold text-[#2e2a21]">データ管理</h2>
        <p className="text-sm text-[#4f493d]">
          現在のMVPではローカルSQLiteに保存しています。CSVエクスポートやクラウド同期は次フェーズで追加予定です。
        </p>
      </div>
    </section>
  );
}
