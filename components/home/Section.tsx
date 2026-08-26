import { ReactNode } from 'react';
interface SectionProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}
export default function Section({
  title,
  description,
  action,
  children,
}: SectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>

          {description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>

        {action}
      </div>

      {children}
    </section>
  );
}
