import { ReactNode } from 'react';
interface CardProps {
  children: ReactNode;
  className?: string;
}
export default function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-900 ${className}`}
    >
      {children}
    </div>
  );
}
