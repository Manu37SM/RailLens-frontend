import Container from '@/components/layout/Container';

export default function Loading() {
  return (
    <Container>
      <div className="animate-pulse space-y-6 py-8">
        <div className="h-10 w-72 rounded-lg bg-gray-200" />

        <div className="h-12 rounded-xl bg-gray-200" />

        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="h-24 rounded-xl border bg-gray-100" />
          ))}
        </div>
      </div>
    </Container>
  );
}
