export interface Question {
  id: number;
  examId: number;
  statement: string;
  points: number;
  position: number;
  createdAt: Date;
}

export interface CreateQuestionInput {
  statement: string;
  points: number;
  position?: number;
  choices: CreateChoiceInput[]; 
}

export interface UpdateQuestionInput {
  statement?: string;
  points?: number;
  position?: number;
  choices?: CreateChoiceInput[]; 
}
