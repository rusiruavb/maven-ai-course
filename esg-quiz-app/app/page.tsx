'use client';

import { useState } from 'react';
import LandingPage from './components/LandingPage';
import QuizApp from './components/QuizApp';

export default function Home() {
  const [showQuiz, setShowQuiz] = useState(false);

  if (!showQuiz) {
    return <LandingPage onStartQuiz={() => setShowQuiz(true)} />;
  }

  return <QuizApp />;
}
