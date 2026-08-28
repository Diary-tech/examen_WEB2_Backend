import { pool } from "../config/database";
import { Choice } from "../model/choice";
import {
    CreateQuestionInput,
    Question,
    QuestionWithChoices,
    UpdateQuestionInput,
} from "../model/question";

const QUESTION_COLUMNS = `
    id,
    exam_id AS "examId",
    statement,
    points,
    position,
    created_at AS "createdAt"
`;

const CHOICE_COLUMNS = `
    id,
    question_id AS "questionId",
    label,
    is_correct AS "isCorrect",
    position
`;

const CHOICE_COLUMNS_JOINED = `
    c.id,
    c.question_id AS "questionId",
    c.label,
    c.is_correct AS "isCorrect",
    c.position
`;

export const questionRepository = {
    async findByExamId(examId: number): Promise<QuestionWithChoices[]> {
        const questions = await pool.query<Question>(
            `
            SELECT ${QUESTION_COLUMNS}
            FROM questions
            WHERE exam_id = $1
            ORDER BY position, id
            `,
            [examId]
        );

        if (questions.rows.length === 0) {
            return [];
        }

        const choices = await pool.query<Choice>(
            `
            SELECT ${CHOICE_COLUMNS_JOINED}
            FROM choices c
            JOIN questions q ON q.id = c.question_id
            WHERE q.exam_id = $1
            ORDER BY c.position, c.id
            `,
            [examId]
        );

        return questions.rows.map((question: Question) => ({
            ...question,
            choices: choices.rows.filter(
                (choice: Choice) => choice.questionId === question.id
            ),
        }));
    },

    async findById(id: number): Promise<Question | null> {
        const result = await pool.query<Question>(
            `
            SELECT ${QUESTION_COLUMNS}
            FROM questions
            WHERE id = $1
            `,
            [id]
        );

        return result.rows[0] ?? null;
    },

    async findWithChoicesById(
        id: number
    ): Promise<QuestionWithChoices | null> {
        const question = await this.findById(id);

        if (!question) {
            return null;
        }

        const choices = await pool.query<Choice>(
            `
            SELECT ${CHOICE_COLUMNS}
            FROM choices
            WHERE question_id = $1
            ORDER BY position, id
            `,
            [id]
        );

        return {
            ...question,
            choices: choices.rows,
        };
    },

    async createWithChoices(
        examId: number,
        data: CreateQuestionInput
    ): Promise<QuestionWithChoices> {
        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            const questionResult = await client.query<Question>(
                `
                INSERT INTO questions
                    (exam_id, statement, points, position)
                VALUES
                    ($1, $2, $3, $4)
                RETURNING ${QUESTION_COLUMNS}
                `,
                [
                    examId,
                    data.statement,
                    data.points,
                    data.position ?? 0,
                ]
            );

            const question = questionResult.rows[0];
            const insertedChoices: Choice[] = [];

            for (const [index, choice] of data.choices.entries()) {
                const choiceResult = await client.query<Choice>(
                    `
                    INSERT INTO choices
                        (question_id, label, is_correct, position)
                    VALUES
                        ($1, $2, $3, $4)
                    RETURNING ${CHOICE_COLUMNS}
                    `,
                    [
                        question.id,
                        choice.label,
                        choice.isCorrect,
                        choice.position ?? index,
                    ]
                );

                insertedChoices.push(choiceResult.rows[0]);
            }

            await client.query("COMMIT");

            return {
                ...question,
                choices: insertedChoices,
            };
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    },

    async updateWithChoices(
        id: number,
        data: UpdateQuestionInput
    ): Promise<QuestionWithChoices | null> {
        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            const questionResult = await client.query<Question>(
                `
                UPDATE questions
                SET
                    statement = COALESCE($2, statement),
                    points = COALESCE($3, points),
                    position = COALESCE($4, position)
                WHERE id = $1
                RETURNING ${QUESTION_COLUMNS}
                `,
                [
                    id,
                    data.statement ?? null,
                    data.points ?? null,
                    data.position ?? null,
                ]
            );

            const question = questionResult.rows[0];

            if (!question) {
                await client.query("ROLLBACK");
                return null;
            }

            let choices: Choice[];

            if (data.choices) {
                await client.query(
                    "DELETE FROM choices WHERE question_id = $1",
                    [id]
                );

                choices = [];

                for (const [index, choice] of data.choices.entries()) {
                    const choiceResult = await client.query<Choice>(
                        `
                        INSERT INTO choices
                            (question_id, label, is_correct, position)
                        VALUES
                            ($1, $2, $3, $4)
                        RETURNING ${CHOICE_COLUMNS}
                        `,
                        [
                            id,
                            choice.label,
                            choice.isCorrect,
                            choice.position ?? index,
                        ]
                    );

                    choices.push(choiceResult.rows[0]);
                }
            } else {
                const existing = await client.query<Choice>(
                    `
                    SELECT ${CHOICE_COLUMNS}
                    FROM choices
                    WHERE question_id = $1
                    ORDER BY position, id
                    `,
                    [id]
                );

                choices = existing.rows;
            }

            await client.query("COMMIT");

            return {
                ...question,
                choices,
            };
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    },

    async delete(id: number): Promise<void> {
        await pool.query(
            "DELETE FROM questions WHERE id = $1",
            [id]
        );
    },

    async sumPointsForExam(examId: number): Promise<number> {
        const result = await pool.query<{ total: number }>(
            `
        SELECT COALESCE(SUM(points), 0)::int AS total
        FROM questions
        WHERE exam_id = $1
        `,
            [examId]
        );
        return Number(result.rows[0].total);
    },
};