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