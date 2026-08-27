import { Choice, CreateChoiceInput, ChoiceForStudent } from './choice';

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

export interface QuestionWithChoices extends Question {
  choices: Choice[];
}

export interface QuestionForStudent {
  id: number;
  statement: string;
  points: number;
  position: number;
  choices: ChoiceForStudent[];
}