export interface Question {
  id: string;
  question: string;
  hasCode: boolean;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: string;
}

export interface UserAnswer {
  questionId: string;
  selectedAnswer: number;
  correct: boolean;
}

export interface GenerateQuestionRequest {
  questionNumber: number;
  previousTopics?: string[];
}

export interface GenerateQuestionResponse {
  question: Question;
}
