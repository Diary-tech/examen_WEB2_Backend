export interface Attempt {
  id: number;
  examId: number;
  studentId: number;
  submittedAt: Date;
  score: number;
}

export interface SubmitAttemptInput {
  answers: { questionId: number; choiceId: number }[];
}

export interface AttemptResult {
  attemptId: number;
  examId: number;
  examTitle: string;
  score: number;
  maxScore: number;
  submittedAt: Date;
  corrections: QuestionCorrection[];
}