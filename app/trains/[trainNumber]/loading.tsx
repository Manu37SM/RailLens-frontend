import Container from '@/components/layout/Container';

export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-50 py-5">
      <Container>
        {/* Breadcrumb */}
        <div className="mb-6 h-5 w-56 animate-pulse rounded bg-slate-200" />

        {/* Train Header */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 h-8 w-64 animate-pulse rounded bg-slate-200" />

          <div className="flex flex-wrap gap-3">
            <div className="h-6 w-28 animate-pulse rounded-full bg-slate-200" />
            <div className="h-6 w-24 animate-pulse rounded-full bg-slate-200" />
            <div className="h-6 w-32 animate-pulse rounded-full bg-slate-200" />
          </div>
        </div>

        {/* Route / Timeline */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-8 h-7 w-40 animate-pulse rounded bg-slate-200" />

          <div className="space-y-6">
            {[1, 2, 3, 4, 5, 6].map((station) => (
              <div key={station} className="flex items-start gap-5">
                {/* Timeline dot */}
                <div className="mt-2 h-4 w-4 rounded-full bg-slate-200" />

                {/* Station info */}
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-48 animate-pulse rounded bg-slate-200" />
                  <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
                </div>

                {/* Time */}
                <div className="h-5 w-20 animate-pulse rounded bg-slate-200" />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </main>
  );
}
