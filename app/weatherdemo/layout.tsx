export default function WeatherDemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen">
      <header className="border-b px-6 py-4">
        <h1 className="text-xl font-semibold">Weather Demo</h1>
        <p className="text-sm text-gray-500">
          Chat with the Mastra Weather Agent
        </p>
      </header>
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
