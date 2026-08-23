export interface Choice {
  id: number;
  questionId: number;
  label: string;
  isCorrect: boolean;
  position: number;
}

export interface CreateChoiceInput {
  label: string;
  isCorrect: boolean;
  position?: number;
}
