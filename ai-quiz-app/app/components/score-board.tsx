interface ScoreBoardProps {
  score: number;
  currentQuestion: number;
  totalQuestions: number;
}

export default function ScoreBoard({ score, currentQuestion, totalQuestions }: ScoreBoardProps) {
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 py-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Score:</span>
        <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          {score}/{totalQuestions}
        </span>
        {totalQuestions > 0 && (
          <span className="text-sm text-zinc-500 dark:text-zinc-500">
            ({percentage}%)
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Question:</span>
        <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
          {currentQuestion}/{totalQuestions}
        </span>
      </div>
    </div>
  );
}
