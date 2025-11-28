export default function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-zinc-200 dark:border-zinc-800"></div>
        <div className="absolute top-0 h-16 w-16 animate-spin rounded-full border-4 border-transparent border-t-blue-500"></div>
      </div>
      <p className="text-lg font-medium text-zinc-600 dark:text-zinc-400 animate-pulse">
        Generating your question...
      </p>
    </div>
  );
}
