import Container from '@/components/layout/Container';

export default function Loading() {
  return (
    <div className="bg-slate-50 dark:bg-slate-800 py-5">
      <Container>
        <div className="animate-pulse space-y-6">
          {/* Search */}
          <div className="rounded-lg border bg-white dark:bg-slate-900 p-6 shadow-sm">
            <div className="h-14 rounded-2xl bg-slate-200 dark:bg-slate-700" />
          </div>

          {/* Results */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border bg-white dark:bg-slate-900 p-6 shadow-sm">
              <div className="space-y-3">
                <div className="h-5 w-24 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-4 w-56 rounded bg-slate-200 dark:bg-slate-700" />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
