'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Question, UserAnswer } from '../api/types';
import QuizCard from '../components/quiz-card';
import AnswerOptions from '../components/answer-options';
import ScoreBoard from '../components/score-board';
import QuizProgress from '../components/quiz-progress';
import LoadingState from '../components/loading-state';

const TOTAL_QUESTIONS = 10;

type QuizStatus = 'idle' | 'active' | 'completed';

export default function QuizPage() {
  const router = useRouter();
  const [quizStatus, setQuizStatus] = useState<QuizStatus>('idle');
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [streamedText, setStreamedText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = allQuestions[currentQuestionIndex] || null;
  const currentAnswer = answers.find(a => a.questionId === currentQuestion?.id);

  const previousTopics = allQuestions.map(q => q.topic);

  const fetchQuestion = async () => {
    setIsStreaming(true);
    setStreamedText('');
    setError(null);

    try {
      const response = await fetch('/api/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionNumber: allQuestions.length + 1,
          previousTopics: previousTopics.filter(Boolean),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch question');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        if (buffer.includes('__COMPLETE__')) {
          const parts = buffer.split('__COMPLETE__');
          setStreamedText(parts[0]);

          try {
            const question: Question = JSON.parse(parts[1]);
            setAllQuestions(prev => [...prev, question]);
            setIsStreaming(false);
          } catch (e) {
            console.error('Error parsing question:', e);
          }
          break;
        } else if (buffer.includes('__ERROR__')) {
          throw new Error('Failed to generate question');
        } else {
          setStreamedText(buffer);
        }
      }
    } catch (err) {
      console.error('Error fetching question:', err);
      setError('Failed to generate question. Please try again.');
      setIsStreaming(false);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || !currentQuestion || currentAnswer) return;

    const isCorrect = selectedOption === currentQuestion.correctAnswer;

    if (isCorrect) {
      setScore(score + 1);
    }

    setAnswers([
      ...answers,
      {
        questionId: currentQuestion.id,
        selectedAnswer: selectedOption,
        correct: isCorrect,
      },
    ]);

    setShowFeedback(true);
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      const nextAnswer = answers.find(a => a.questionId === allQuestions[currentQuestionIndex + 1]?.id);
      setSelectedOption(nextAnswer ? nextAnswer.selectedAnswer : null);
      setShowFeedback(!!nextAnswer);
    } else if (allQuestions.length < TOTAL_QUESTIONS) {
      await fetchQuestion();
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setShowFeedback(false);
    } else {
      setQuizStatus('completed');
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      const prevAnswer = answers.find(a => a.questionId === allQuestions[currentQuestionIndex - 1]?.id);
      setSelectedOption(prevAnswer ? prevAnswer.selectedAnswer : null);
      setShowFeedback(!!prevAnswer);
    }
  };

  const handleRestart = () => {
    setQuizStatus('idle');
    setAllQuestions([]);
    setCurrentQuestionIndex(0);
    setStreamedText('');
    setIsStreaming(false);
    setScore(0);
    setAnswers([]);
    setSelectedOption(null);
    setShowFeedback(false);
    setError(null);
  };

  useEffect(() => {
    if (quizStatus === 'active' && allQuestions.length === 0 && !isStreaming) {
      fetchQuestion();
    }
  }, [quizStatus, allQuestions.length, isStreaming]);

  if (quizStatus === 'idle') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="flex flex-col items-center gap-6 text-center">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
            Ready to test your skills?
          </h1>
          <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
            Answer {TOTAL_QUESTIONS} software engineering questions and see how you score!
          </p>
          <button
            onClick={() => setQuizStatus('active')}
            className="rounded-full bg-blue-600 px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  if (quizStatus === 'completed') {
    const percentage = Math.round((score / TOTAL_QUESTIONS) * 100);
    const getMessage = () => {
      if (percentage >= 90) return 'Outstanding! 🎉';
      if (percentage >= 70) return 'Great job! 👏';
      if (percentage >= 50) return 'Good effort! 👍';
      return 'Keep practicing! 💪';
    };

    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="flex max-w-md flex-col items-center gap-6 text-center">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
            Quiz Complete!
          </h1>
          <div className="rounded-lg border border-zinc-200 bg-white p-8 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            <p className="mb-4 text-6xl font-bold text-blue-600 dark:text-blue-400">
              {score}/{TOTAL_QUESTIONS}
            </p>
            <p className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {percentage}%
            </p>
            <p className="text-xl text-zinc-600 dark:text-zinc-400">{getMessage()}</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleRestart}
              className="rounded-full bg-blue-600 px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/')}
              className="rounded-full border border-zinc-300 bg-white px-8 py-3 text-lg font-semibold text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
            >
              Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8 dark:bg-black">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <ScoreBoard
            score={score}
            currentQuestion={currentQuestionIndex + 1}
            totalQuestions={TOTAL_QUESTIONS}
          />
        </div>

        <div className="mb-8">
          <QuizProgress current={currentQuestionIndex} total={TOTAL_QUESTIONS} />
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
            <p className="text-red-800 dark:text-red-200">{error}</p>
            <button
              onClick={fetchQuestion}
              className="mt-2 text-sm font-semibold text-red-900 underline dark:text-red-100"
            >
              Try Again
            </button>
          </div>
        )}

        {isStreaming || (!currentQuestion && !error) ? (
          <LoadingState />
        ) : currentQuestion ? (
          <div className="space-y-6">
            <QuizCard
              questionText={currentQuestion.question}
              isStreaming={false}
              hasCode={currentQuestion.hasCode}
            />

            <AnswerOptions
              options={currentQuestion.options}
              selectedOption={selectedOption}
              onSelect={setSelectedOption}
              isDisabled={isStreaming}
              showFeedback={showFeedback}
              correctAnswer={currentQuestion.correctAnswer}
            />

            {showFeedback && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
                <p className="mb-2 font-semibold text-blue-900 dark:text-blue-100">
                  {selectedOption === currentQuestion.correctAnswer
                    ? '✓ Correct!'
                    : '✗ Incorrect'}
                </p>
                <p className="text-sm leading-relaxed text-blue-800 dark:text-blue-200">
                  {currentQuestion.explanation}
                </p>
              </div>
            )}

            {!showFeedback && !currentAnswer && (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedOption === null || isStreaming}
                className="w-full rounded-full bg-blue-600 px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Submit Answer
              </button>
            )}

            <div className="flex gap-4">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="flex-1 rounded-full border border-zinc-300 bg-white px-8 py-3 text-lg font-semibold text-zinc-900 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
              >
                ← Previous
              </button>
              <button
                onClick={handleNextQuestion}
                disabled={!currentAnswer && !showFeedback}
                className="flex-1 rounded-full bg-blue-600 px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {currentQuestionIndex < allQuestions.length - 1
                  ? 'Next →'
                  : allQuestions.length < TOTAL_QUESTIONS
                  ? 'Next Question →'
                  : 'Finish Quiz'}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
