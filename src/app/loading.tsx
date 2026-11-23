export default function Loading() {
  return (
    <div
      className="w-full min-h-[50vh] flex flex-col items-center justify-center p-8 transition-opacity duration-150"
      role="status"
      aria-label="Loading page"
    >
      {/* Top Route Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 z-[9999] h-1 overflow-hidden pointer-events-none bg-slate-200/20 dark:bg-slate-800/20">
        <div className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 w-full animate-pulse" />
      </div>

      {/* Lightweight Centered Spinner */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-slate-200 dark:border-slate-800 border-t-indigo-600 dark:border-t-cyan-400 animate-spin" />
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
          Loading…
        </span>
      </div>
    </div>
  );
}
