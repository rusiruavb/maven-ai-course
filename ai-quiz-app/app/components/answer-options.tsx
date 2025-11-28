import { cn } from '@/lib/utils';

interface AnswerOptionsProps {
  options: string[];
  selectedOption: number | null;
  onSelect: (index: number) => void;
  isDisabled: boolean;
  showFeedback: boolean;
  correctAnswer?: number;
}

export default function AnswerOptions({
  options,
  selectedOption,
  onSelect,
  isDisabled,
  showFeedback,
  correctAnswer,
}: AnswerOptionsProps) {
  const labels = ['A', 'B', 'C', 'D'];

  const getOptionStyle = (index: number) => {
    if (!showFeedback) {
      if (selectedOption === index) {
        return 'border-blue-500 bg-blue-50 dark:bg-blue-950 dark:border-blue-500';
      }
      return 'border-zinc-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700';
    }

    if (index === correctAnswer) {
      return 'border-green-500 bg-green-50 dark:bg-green-950 dark:border-green-500';
    }

    if (selectedOption === index && index !== correctAnswer) {
      return 'border-red-500 bg-red-50 dark:bg-red-950 dark:border-red-500';
    }

    return 'border-zinc-200 dark:border-zinc-800 opacity-50';
  };

  return (
    <div className="flex flex-col gap-3">
      {options.map((option, index) => (
        <button
          key={index}
          onClick={() => !isDisabled && !showFeedback && onSelect(index)}
          disabled={isDisabled || showFeedback}
          className={cn(
            'group relative flex items-start gap-4 rounded-lg border-2 p-4 text-left transition-all',
            getOptionStyle(index),
            !isDisabled && !showFeedback && 'cursor-pointer',
            (isDisabled || showFeedback) && 'cursor-not-allowed'
          )}
        >
          <span
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 font-semibold',
              showFeedback && index === correctAnswer
                ? 'border-green-600 bg-green-600 text-white dark:border-green-500 dark:bg-green-500'
                : showFeedback && selectedOption === index && index !== correctAnswer
                ? 'border-red-600 bg-red-600 text-white dark:border-red-500 dark:bg-red-500'
                : selectedOption === index
                ? 'border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-500'
                : 'border-zinc-300 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300'
            )}
          >
            {labels[index]}
          </span>
          <span className="flex-1 text-base leading-relaxed text-zinc-900 dark:text-zinc-100">
            {option}
          </span>
        </button>
      ))}
    </div>
  );
}
