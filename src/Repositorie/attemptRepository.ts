import { pool } from "../config/Database";
import { Answer } from "../model/Answer";
import { Attempt } from "../model/Attempt";

export const attemptRepository = {
    async findByExamAndStudent(
        examId: number,
        studentId: number
    ): Promise<Attempt | null> {
        const result = await pool.query<Attempt>(
            "SELECT * FROM attempts WHERE exam_id = $1 AND student_id = $2",
            [examId, studentId]
        );
        return result.rows[0] ?? null;
    },

    async findById(id: number): Promise<Attempt | null> {
        const result = await pool.query<Attempt>(
            "SELECT * FROM attempts WHERE id = $1",
            [id]
        );
        return result.rows[0] ?? null;
    },

    async countForExam(examId: number): Promise<number> {
        const result = await pool.query<{ count: number }>(
            "SELECT COUNT(*)::int AS count FROM attempts WHERE exam_id = $1",
            [examId]
        );
        return Number(result.rows[0].count);
    },

    async listForExamWithStudent(examId: number) {
        const result = await pool.query<{
            attempt_id: number;
            student_id: number;
            student_name: string;
            student_email: string;
            score: number;
            submitted_at: Date;
        }>(
            `SELECT a.id AS attempt_id, u.id AS student_id, u.name AS student_name,
              u.email AS student_email, a.score, a.submitted_at
       FROM attempts a
       JOIN users u ON u.id = a.student_id
       WHERE a.exam_id = $1
       ORDER BY a.score DESC`,
            [examId]
        );
        return result.rows;
    },

    async listForStudent(studentId: number) {
        const result = await pool.query<{
            attempt_id: number;
            exam_id: number;
            exam_title: string;
            course_code: string;
            score: number;
            submitted_at: Date;
        }>(
            `SELECT a.id AS attempt_id, e.id AS exam_id, e.title AS exam_title,
              c.code AS course_code, a.score, a.submitted_at
       FROM attempts a
       JOIN exams e ON e.id = a.exam_id
       JOIN courses c ON c.id = e.course_id
       WHERE a.student_id = $1
       ORDER BY a.submitted_at DESC`,
            [studentId]
        );
        return result.rows;
    },

    async findAnswersByAttemptId(attemptId: number): Promise<Answer[]> {
        const result = await pool.query<Answer>(
            "SELECT * FROM answers WHERE attempt_id = $1",
            [attemptId]
        );
        return result.rows;
    },

    async createAttemptWithAnswers(data: {
        examId: number;
        studentId: number;
        score: number;
        answers: { questionId: number; choiceId: number | null }[];
    }): Promise<Attempt> {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            const attemptResult = await client.query<Attempt>(
                `INSERT INTO attempts (exam_id, student_id, score)
         VALUES ($1, $2, $3)
         RETURNING *`,
                [data.examId, data.studentId, data.score]
            );
            const attempt = attemptResult.rows[0];

            for (const answer of data.answers) {
                await client.query(
                    `INSERT INTO answers (attempt_id, question_id, choice_id)
           VALUES ($1, $2, $3)`,
                    [attempt.id, answer.questionId, answer.choiceId]
                );
            }

            await client.query("COMMIT");
            return attempt;
        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }
    },
};
