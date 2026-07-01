import Container from '@/components/layout/Container';

export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-50 py-5">
      <Container>
        <div className="animate-pulse space-y-6">
          {/* Search */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="h-14 rounded-2xl bg-slate-200" />
          </div>

          {/* Results */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="space-y-3">
                <div className="h-5 w-24 rounded bg-slate-200" />
                <div className="h-4 w-56 rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </main>
  );
}
