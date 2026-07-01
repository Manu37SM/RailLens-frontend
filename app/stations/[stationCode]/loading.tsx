export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-50 py-5">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="h-36 animate-pulse rounded-2xl bg-slate-200" />

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-16 animate-pulse rounded-lg bg-slate-100"
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
