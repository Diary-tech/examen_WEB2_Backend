import { attemptRepository } from "../Repositorie/attemptRepository";
import { examRepository } from "../Repositorie/examRepository";
import { questionRepository } from "../Repositorie/questionRepository";
import {
    AttemptResult,
    ExamResultsSummary,
    QuestionCorrection,
    SubmitAttemptInput,
} from "../model/Attempt";
import {
    BadRequestError,
    ConflictError,
    ForbiddenError,
    NotFoundError,
} from "../security/Errors";

export const listAvailableExams = async (studentId: number) => {
    const exams = await examRepository.findAll();
    const now = new Date();

    const availableExams = [];

    for (const exam of exams) {
        if (now < exam.startsAt || now > exam.endsAt) {
            continue;
        }

        const existing = await attemptRepository.findByExamAndStudent(
            exam.id,
            studentId
        );

        if (existing) {
            continue;
        }

        availableExams.push(exam);
    }

    return availableExams;
};

export const getAvailableExam = async (
    examId: number,
    studentId: number
) => {
    const exam = await examRepository.findById(examId);

    if (!exam) {
        throw new NotFoundError("Exam not found");
    }

    const now = new Date();

    if (now < exam.startsAt || now > exam.endsAt) {
        throw new ConflictError(
            "This exam is not currently available"
        );
    }

    const existing = await attemptRepository.findByExamAndStudent(
        examId,
        studentId
    );

    if (existing) {
        throw new ConflictError(
            "You have already submitted this exam"
        );
    }

    const questions = await questionRepository.findByExamId(examId);

    if (questions.length === 0) {
        throw new ConflictError("This exam has no questions");
    }

    const questionsForStudent = questions.map((question) => ({
        id: question.id,
        examId: question.examId,
        statement: question.statement,
        points: question.points,
        position: question.position,
        createdAt: question.createdAt,
        choices: question.choices.map((choice) => ({
            id: choice.id,
            questionId: choice.questionId,
            label: choice.label,
            position: choice.position,
        })),
    }));

    return {
        ...exam,
        questions: questionsForStudent,
    };
};

export const submitAttempt = async (
    examId: number,
    studentId: number,
    input: SubmitAttemptInput
) => {
    const exam = await examRepository.findById(examId);

    if (!exam) {
        throw new NotFoundError("Exam not found");
    }

    const now = new Date();

    if (now < exam.startsAt || now > exam.endsAt) {
        throw new ConflictError("This exam is not currently open");
    }

    const existing = await attemptRepository.findByExamAndStudent(
        examId,
        studentId
    );

    if (existing) {
        throw new ConflictError(
            "You have already submitted this exam"
        );
    }

    const questions = await questionRepository.findByExamId(examId);

    if (questions.length === 0) {
        throw new ConflictError("This exam has no questions");
    }

    if (input.answers.length === 0) {
        throw new BadRequestError("At least one answer is required");
    }

    let score = 0;

    const answersToStore: {
        questionId: number;
        choiceId: number | null;
    }[] = [];

    for (const question of questions) {
        const submitted = input.answers.find(
            (answer) => answer.questionId === question.id
        );

        if (!submitted) {
            answersToStore.push({
                questionId: question.id,
                choiceId: null,
            });

            continue;
        }

        const choice = question.choices.find(
            (item) => item.id === submitted.choiceId
        );

        if (!choice) {
            throw new BadRequestError(
                `Choice ${submitted.choiceId} does not belong to question ${question.id}`
            );
        }

        if (choice.isCorrect) {
            score += question.points;
        }

        answersToStore.push({
            questionId: question.id,
            choiceId: choice.id,
        });
    }

    return attemptRepository.createAttemptWithAnswers({
        examId,
        studentId,
        score,
        answers: answersToStore,
    });
};

export const getAttemptResultByExamForStudent = async (
    examId: number,
    studentId: number
): Promise<AttemptResult> => {
    const attempt =
        await attemptRepository.findByExamAndStudent(
            examId,
            studentId
        );

    if (!attempt) {
        throw new NotFoundError(
            "You have not submitted this exam"
        );
    }

    return getAttemptResult(attempt.id, {
        id: studentId,
        role: "student",
    });
};

export const getAttemptResult = async (
    attemptId: number,
    requester: {
        id: number;
        role: "admin" | "student";
    }
): Promise<AttemptResult> => {
    const attempt = await attemptRepository.findById(attemptId);

    if (!attempt) {
        throw new NotFoundError("Attempt not found");
    }

    if (
        requester.role === "student" &&
        attempt.studentId !== requester.id
    ) {
        throw new ForbiddenError(
            "You cannot view another student's attempt"
        );
    }

    const exam = await examRepository.findById(attempt.examId);

    if (!exam) {
        throw new NotFoundError("Exam not found");
    }

    const questions =
        await questionRepository.findByExamId(attempt.examId);

    const answers =
        await attemptRepository.findAnswersByAttemptId(
            attemptId
        );

    let maxScore = 0;

    const corrections: QuestionCorrection[] =
        questions.map((question) => {
            maxScore += question.points;

            const answer = answers.find(
                (item) => item.questionId === question.id
            );

            const correctChoice = question.choices.find(
                (choice) => choice.isCorrect
            );

            const isCorrect =
                !!answer &&
                !!correctChoice &&
                answer.choiceId === correctChoice.id;

            return {
                questionId: question.id,
                statement: question.statement,
                points: question.points,
                earnedPoints: isCorrect
                    ? question.points
                    : 0,
                selectedChoiceId:
                    answer?.choiceId ?? null,
                correctChoiceId:
                    correctChoice?.id ?? 0,
                isCorrect,
            };
        });

    return {
        attemptId: attempt.id,
        examId: exam.id,
        examTitle: exam.title,
        score: attempt.score,
        maxScore,
        submittedAt: attempt.submittedAt,
        corrections,
    };
};

export const getExamResultsSummary = async (
    examId: number
): Promise<ExamResultsSummary> => {
    const exam = await examRepository.findById(examId);

    if (!exam) {
        throw new NotFoundError("Exam not found");
    }

    const rows =
        await attemptRepository.listForExamWithStudent(examId);

    const average =
        rows.length === 0
            ? 0
            : rows.reduce(
            (sum, row) => sum + row.score,
            0
        ) / rows.length;

    return {
        rows,
        average,
        attemptsCount: rows.length,
    };
};

export const listAttemptsForStudent = async (
    studentId: number
) => {
    return attemptRepository.listForStudent(studentId);
};