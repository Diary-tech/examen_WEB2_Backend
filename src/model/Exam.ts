export interface Exam {
  id: number;
  courseId: number;
  title: string;
  description: string | null;
  startsAt: Date;
  endsAt: Date;
  createdAt: Date;
}