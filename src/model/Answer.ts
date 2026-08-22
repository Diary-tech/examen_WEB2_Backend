export interface Answer {
  id: number;
  attemptId: number;
  questionId: number;
  choiceId: number | null; 
}