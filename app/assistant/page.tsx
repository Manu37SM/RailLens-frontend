'use client';
import { useRouter } from 'next/navigation';
import AssistantDialog from '@/components/assistant/AssistantDialog';
export default function AssistantPage() {
  const router = useRouter();
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
      <AssistantDialog open onClose={() => router.push('/')} />
    </div>
  );
}
