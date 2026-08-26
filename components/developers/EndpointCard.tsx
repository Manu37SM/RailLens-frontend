import CodeBlock from './CodeBlock';
interface EndpointCardProps {
  method: string;
  path: string;
  description: string;
  curl: string;
  javascript: string;
  python: string;
}
const methodColors: Record<string, string> = {
  GET: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400',
  POST: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
};
export default function EndpointCard({
  method,
  path,
  description,
  curl,
  javascript,
  python,
}: EndpointCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-md px-2 py-0.5 text-xs font-bold tracking-wide ${methodColors[method] ?? methodColors.GET}`}
        >
          {method}
        </span>
        <code className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {path}
        </code>
      </div>

      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        {description}
      </p>

      <div className="mt-4 space-y-3">
        <CodeBlock language="curl" code={curl} />
        <CodeBlock language="javascript" code={javascript} />
        <CodeBlock language="python" code={python} />
      </div>
    </div>
  );
}
