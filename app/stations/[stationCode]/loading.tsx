export default function Loading() {
  return (
    <div className="bg-slate-50 dark:bg-slate-800 py-5">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="h-30 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />

        <div className="rounded-lg bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-[52px] animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
