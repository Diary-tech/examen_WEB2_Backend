export interface Question {
  id: number;
  examId: number;
  statement: string;
  points: number;
  position: number;
  createdAt: Date;
}