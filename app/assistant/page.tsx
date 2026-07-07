import AssistantDialog from '@/components/assistant/AssistantDialog';

export default function AssistantPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
      <AssistantDialog open onClose={() => {}} />
    </main>
  );
}
