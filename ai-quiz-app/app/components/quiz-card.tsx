'use client';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { extractCodeBlocks } from '@/lib/utils';

interface QuizCardProps {
  questionText: string;
  isStreaming: boolean;
  hasCode: boolean;
}

export default function QuizCard({ questionText, isStreaming, hasCode }: QuizCardProps) {
  const renderContent = () => {
    if (!hasCode) {
      return (
        <p className="text-lg leading-relaxed text-zinc-900 dark:text-zinc-100">
          {questionText}
          {isStreaming && (
            <span className="ml-1 inline-block h-5 w-0.5 animate-pulse bg-blue-500" />
          )}
        </p>
      );
    }

    const blocks = extractCodeBlocks(questionText);

    return (
      <div className="space-y-4">
        {blocks.map((block, index) => {
          if (block.type === 'text') {
            return (
              <p
                key={index}
                className="text-lg leading-relaxed text-zinc-900 dark:text-zinc-100"
              >
                {block.content}
              </p>
            );
          }

          return (
            <div key={index} className="overflow-hidden rounded-md">
              <SyntaxHighlighter
                language={block.language || 'javascript'}
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                }}
              >
                {block.content}
              </SyntaxHighlighter>
            </div>
          );
        })}
        {isStreaming && (
          <span className="inline-block h-5 w-0.5 animate-pulse bg-blue-500" />
        )}
      </div>
    );
  };

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
      {renderContent()}
    </div>
  );
}
