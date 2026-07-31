// Shared Tailwind class strings for form inputs/labels/cards - previously
// duplicated verbatim across LoginForm.tsx, RegisterForm.tsx,
// AdminKeyForm.tsx and AccountClient.tsx (the last of which had already
// extracted its own local copy). Four+ near-identical auth/account forms
// is enough repetition that a single source of truth is worth it - a
// future visual tweak (e.g. adjusting the focus ring) previously had to be
// applied in four places by hand, with no compiler check that all four
// actually stayed in sync.
export const inputClasses =
  'h-10 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-3 text-base sm:text-sm text-slate-900 dark:text-slate-100 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-orange-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-orange-100 focus:outline-none';

export const labelClasses = 'mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300';

export const cardClasses =
  'w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm';
