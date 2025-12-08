export default function AffirmationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen">
      <header className="border-b px-6 py-4">
        <h1 className="text-xl font-semibold">Affirmations</h1>
        <p className="text-sm text-gray-500">
          Generate personalized affirmations with AI
        </p>
      </header>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
