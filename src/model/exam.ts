export interface Exam {
  id: number;
  courseId: number;
  title: string;
  description: string | null;
  startsAt: Date;
  endsAt: Date;
  createdAt: Date;
}

export interface ExamWithCourse extends Exam {
  course: {
    id: number;
    code: string;
    name: string;
  };
}

export interface CreateExamInput {
  courseId: number;
  title: string;
  description?: string;
  startsAt: Date;
  endsAt: Date;
}

export interface UpdateExamInput {
  title?: string;
  description?: string;
  startsAt?: Date;
  endsAt?: Date;
}

export interface ExamWithMeta extends Exam {
  courseName: string;
  attemptsCount: number;
  isLocked: boolean;
}