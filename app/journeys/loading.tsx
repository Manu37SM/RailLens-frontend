import Container from '@/components/layout/Container';

export default function Loading() {
  return (
    <Container>
      <div className="animate-pulse space-y-5">
        {/* Search form */}
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <div className="h-5 w-32 rounded bg-slate-200" />
          <div className="mt-4 h-11 rounded bg-slate-200" />
          <div className="mt-4 h-11 rounded bg-slate-200" />
          <div className="mt-5 h-10 w-24 rounded bg-slate-200" />
        </div>

        {/* Results */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border bg-white p-5 shadow-sm">
            <div className="h-5 w-32 rounded bg-slate-200" />
            <div className="mt-2 h-4 w-56 rounded bg-slate-200" />

            <div className="mt-5 flex justify-between">
              <div className="h-6 w-20 rounded bg-slate-200" />
              <div className="h-6 w-20 rounded bg-slate-200" />
            </div>

            <div className="mt-6 h-4 w-24 rounded bg-slate-200" />
          </div>
        ))}
      </div>
    </Container>
  );
}
