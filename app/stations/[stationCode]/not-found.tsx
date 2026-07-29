import Container from '@/components/layout/Container';
import ErrorState from '@/components/common/ErrorState';

export default function StationNotFound() {
  return (
    <div className="bg-slate-50 dark:bg-slate-800 py-5">
      <Container>
        <ErrorState
          title="Station not found"
          message="We couldn't find a station with that code. Double-check it and try again."
          homeHref="/stations"
          homeLabel="Back to Station Search"
        />
      </Container>
    </div>
  );
}
