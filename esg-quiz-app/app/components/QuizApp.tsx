'use client';

import { useState, useEffect } from 'react';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  searchTopic: string;
}

interface Resource {
  title: string;
  url: string;
  snippet: string;
}

export default function QuizApp() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [questionError, setQuestionError] = useState<string | null>(null);
  const [resourceError, setResourceError] = useState<string | null>(null);

  const MAX_QUESTIONS = 5;

  useEffect(() => {
    loadQuestion(0);
  }, []);

  const loadQuestion = async (questionNumber: number) => {
    if (questions[questionNumber]) {
      return;
    }

    setLoading(true);
    setQuestionError(null);
    try {
      const response = await fetch('/api/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionNumber: questionNumber + 1 }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setQuestions(prev => {
        const newQuestions = [...prev];
        newQuestions[questionNumber] = data;
        return newQuestions;
      });
    } catch (error) {
      console.error('Error loading question:', error);
      setQuestionError(error instanceof Error ? error.message : 'Failed to load question');
    } finally {
      setLoading(false);
    }
  };

  const loadResources = async (topic: string) => {
    setLoadingResources(true);
    setResourceError(null);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        setResourceError(data.error);
      }

      setResources(data.resources || []);
    } catch (error) {
      console.error('Error loading resources:', error);
      setResourceError(error instanceof Error ? error.message : 'Failed to load resources');
      setResources([]);
    } finally {
      setLoadingResources(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (answeredQuestions.has(currentQuestionIndex)) return;

    setSelectedAnswer(answerIndex);
    const currentQuestion = questions[currentQuestionIndex];

    if (answerIndex === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }

    setAnsweredQuestions(prev => new Set(prev).add(currentQuestionIndex));
    loadResources(currentQuestion.searchTopic);
  };

  const handleNext = () => {
    if (currentQuestionIndex < MAX_QUESTIONS - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setSelectedAnswer(null);
      setResources([]);
      loadQuestion(nextIndex);
    } else {
      setShowResult(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(null);
      setResources([]);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setQuestions([]);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setResources([]);
    setAnsweredQuestions(new Set());
    setQuestionError(null);
    setResourceError(null);
    loadQuestion(0);
  };

  if (loading && questions.length === 0 && !questionError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-foreground">Loading your ESG quiz...</p>
        </div>
      </div>
    );
  }

  if (questionError && questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-card rounded-2xl shadow-xl p-8 max-w-2xl w-full border-2 border-error">
          <div className="text-center">
            <div className="text-error text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-error mb-4">Unable to Load Quiz</h2>
            <p className="text-foreground mb-2">{questionError}</p>
            <p className="text-sm text-foreground opacity-75 mb-6">
              Please check your API configuration and ensure all environment variables are set correctly.
            </p>
            <button
              onClick={() => loadQuestion(0)}
              className="bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl shadow-xl p-8 max-w-2xl w-full border-2 border-border">
          <h2 className="text-3xl font-bold text-primary mb-6 text-center">Quiz Complete!</h2>
          <div className="text-center mb-8">
            <div className="text-6xl font-bold text-primary mb-2">
              {score}/{MAX_QUESTIONS}
            </div>
            <p className="text-xl text-foreground">
              {score === MAX_QUESTIONS
                ? 'Perfect! You are an ESG expert!'
                : score >= 3
                ? 'Great job! You have a good understanding of sustainability.'
                : 'Keep learning! Sustainability is important for our future.'}
            </p>
          </div>
          <button
            onClick={handleRestart}
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Take Quiz Again
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isAnswered = answeredQuestions.has(currentQuestionIndex);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="bg-card rounded-2xl shadow-xl p-8 border-2 border-border">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-primary">ESG Sustainability Quiz</h1>
              <span className="text-sm font-medium text-foreground bg-accent px-3 py-1 rounded-full">
                Question {currentQuestionIndex + 1} of {MAX_QUESTIONS}
              </span>
            </div>
            <div className="w-full bg-border rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / MAX_QUESTIONS) * 100}%` }}
              ></div>
            </div>
          </div>

          {currentQuestion && (
            <>
              <h2 className="text-xl font-semibold text-foreground mb-6">
                {currentQuestion.question}
              </h2>

              <div className="space-y-3 mb-6">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = index === currentQuestion.correctAnswer;
                  const showCorrect = isAnswered && isCorrect;
                  const showIncorrect = isAnswered && isSelected && !isCorrect;

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={isAnswered}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        showCorrect
                          ? 'bg-success bg-opacity-20 border-success'
                          : showIncorrect
                          ? 'bg-error bg-opacity-20 border-error'
                          : isSelected
                          ? 'border-primary bg-primary bg-opacity-10'
                          : 'border-border hover:border-primary hover:bg-accent hover:bg-opacity-30'
                      } ${isAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span className="font-medium text-foreground">{option}</span>
                    </button>
                  );
                })}
              </div>

              {isAnswered && (
                <div className="bg-accent bg-opacity-30 border-2 border-accent rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-primary mb-2">Explanation:</h3>
                  <p className="text-foreground">{currentQuestion.explanation}</p>
                </div>
              )}

              {isAnswered && resourceError && (
                <div className="bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20 border-2 border-yellow-500 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <span className="text-yellow-600 dark:text-yellow-400 text-xl">ℹ️</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                        Learning Resources Unavailable
                      </h3>
                      <p className="text-sm text-yellow-700 dark:text-yellow-400">
                        {resourceError}
                      </p>
                      <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-2">
                        The quiz will continue normally, but web search features are currently unavailable.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {isAnswered && !resourceError && resources.length > 0 && (
                <div className="bg-primary-light bg-opacity-10 border-2 border-primary-light rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-primary mb-3">Learn More:</h3>
                  <div className="space-y-3">
                    {resources.map((resource, index) => (
                      <a
                        key={index}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 bg-card rounded-lg border border-border hover:border-primary transition-colors"
                      >
                        <h4 className="font-medium text-primary hover:underline mb-1">
                          {resource.title}
                        </h4>
                        <p className="text-sm text-foreground opacity-75 line-clamp-2">
                          {resource.snippet}
                        </p>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {loadingResources && !resourceError && (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
                  <p className="mt-2 text-sm text-foreground">Finding learning resources...</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  className="px-6 py-3 bg-accent hover:bg-primary-light text-primary-dark font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  disabled={!isAnswered}
                  className="flex-1 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {currentQuestionIndex === MAX_QUESTIONS - 1 ? 'Finish Quiz' : 'Next Question'}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="text-center mt-6 text-foreground opacity-75">
          <p className="text-sm">Score: {score} / {answeredQuestions.size}</p>
        </div>
      </div>
    </div>
  );
}
