import { pool } from "../config/database";
import { Answer } from "../model/answer";
import {
    Attempt,
    ExamResultRow,
    ExamResultsSummary,
} from "../model/attempt";

const ATTEMPT_COLUMNS = `
  id,
  exam_id AS "examId",
  student_id AS "studentId",
  submitted_at AS "submittedAt",
  score
`;

const ANSWER_COLUMNS = `
  id,
  attempt_id AS "attemptId",
  question_id AS "questionId",
  choice_id AS "choiceId"
`;

export const attemptRepository = {
    async findByExamAndStudent(
        examId: number,
        studentId: number
    ): Promise<Attempt | null> {
        const result = await pool.query<Attempt>(
            `
      SELECT ${ATTEMPT_COLUMNS}
      FROM attempts
      WHERE exam_id = $1
        AND student_id = $2
      `,
            [examId, studentId]
        );

        return result.rows[0] ?? null;
    },

    async findById(
        id: number
    ): Promise<Attempt | null> {
        const result = await pool.query<Attempt>(
            `
      SELECT ${ATTEMPT_COLUMNS}
      FROM attempts
      WHERE id = $1
      `,
            [id]
        );

        return result.rows[0] ?? null;
    },

    async countForExam(
        examId: number
    ): Promise<number> {
        const result =
            await pool.query<{ count: number }>(
                `
        SELECT COUNT(*)::int AS count
        FROM attempts
        WHERE exam_id = $1
        `,
                [examId]
            );

        return Number(result.rows[0].count);
    },

    async listForExamWithStudent(
        examId: number
    ): Promise<ExamResultRow[]> {
        const result =
            await pool.query<ExamResultRow>(
                `
        SELECT
          u.id AS "studentId",
          u.full_name AS "studentName",
          a.score,
          a.submitted_at AS "submittedAt"
        FROM attempts a
        JOIN users u
          ON u.id = a.student_id
        WHERE a.exam_id = $1
        ORDER BY a.score DESC
        `,
                [examId]
            );

        return result.rows;
    },

    async listForStudent(
    studentId: number
) {
    const result = await pool.query<{
        attemptId: number;
        examId: number;
        examTitle: string;
        courseCode: string;
        score: number;
        submittedAt: Date;
        totalPoints: number;
    }>(
        `
        SELECT
            a.id AS "attemptId",
            e.id AS "examId",
            e.title AS "examTitle",
            c.code AS "courseCode",
            a.score,
            a.submitted_at AS "submittedAt",
            COALESCE(q.total_points, 0) AS "totalPoints"

        FROM attempts a

        JOIN exams e
            ON e.id = a.exam_id

        JOIN courses c
            ON c.id = e.course_id

        LEFT JOIN (
            SELECT
                exam_id,
                COALESCE(SUM(points), 0)::int AS total_points
            FROM questions
            GROUP BY exam_id
        ) q
            ON q.exam_id = e.id

        WHERE a.student_id = $1

        ORDER BY a.submitted_at DESC
        `,
        [studentId]
    );

    return result.rows;
},

    async findAnswersByAttemptId(
        attemptId: number
    ): Promise<Answer[]> {
        const result = await pool.query<Answer>(
            `
      SELECT ${ANSWER_COLUMNS}
      FROM answers
      WHERE attempt_id = $1
      `,
            [attemptId]
        );

        return result.rows;
    },

    async createAttemptWithAnswers(data: {
        examId: number;
        studentId: number;
        score: number;
        answers: {
            questionId: number;
            choiceId: number | null;
        }[];
    }): Promise<Attempt> {
        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            const attemptResult =
                await client.query<Attempt>(
                    `
          INSERT INTO attempts
            (exam_id, student_id, submitted_at, score)
          VALUES
            ($1, $2, NOW(), $3)
          RETURNING ${ATTEMPT_COLUMNS}
          `,
                    [
                        data.examId,
                        data.studentId,
                        data.score,
                    ]
                );

            const attempt =
                attemptResult.rows[0];

            for (const answer of data.answers) {
                await client.query(
                    `
          INSERT INTO answers
            (attempt_id, question_id, choice_id)
          VALUES
            ($1, $2, $3)
          `,
                    [
                        attempt.id,
                        answer.questionId,
                        answer.choiceId,
                    ]
                );
            }

            await client.query("COMMIT");

            return attempt;
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    },
};