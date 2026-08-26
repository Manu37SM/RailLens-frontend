import Container from '@/components/layout/Container';
import ErrorState from '@/components/common/ErrorState';
export default function TrainNotFound() {
  return (
    <div className="bg-background py-5">
      <Container>
        <ErrorState
          title="Train not found"
          message="We couldn't find a train with that number. Double-check the number and try again."
          homeHref="/trains"
          homeLabel="Back to Train Search"
        />
      </Container>
    </div>
  );
}
