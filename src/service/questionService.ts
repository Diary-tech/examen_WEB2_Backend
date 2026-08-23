import { questionRepository } from "../Repositorie/questionRepository";
import { examRepository } from "../Repositorie/examRepository";
import {
    CreateQuestionInput,
    UpdateQuestionInput,
} from "../model/Question";
import {
    BadRequestError,
    ConflictError,
    NotFoundError,
} from "../security/Errors";

const validateChoices = (
    choices: CreateQuestionInput["choices"]
) => {
    if (choices.length < 2 || choices.length > 6) {
        throw new BadRequestError(
            "A question must have between 2 and 6 choices"
        );
    }

    const correctChoices = choices.filter(
        (choice) => choice.isCorrect
    );

    if (correctChoices.length !== 1) {
        throw new BadRequestError(
            "A question must have exactly one correct choice"
        );
    }
};

export const listQuestions = async (examId: number) => {
    const exam = await examRepository.findById(examId);

    if (!exam) {
        throw new NotFoundError("Exam not found");
    }

    return questionRepository.findByExamId(examId);
};

export const getQuestion = async (id: number) => {
    const question =
        await questionRepository.findWithChoicesById(id);

    if (!question) {
        throw new NotFoundError("Question not found");
    }

    return question;
};

export const createQuestion = async (
    examId: number,
    input: CreateQuestionInput
) => {
    const exam = await examRepository.findById(examId);

    if (!exam) {
        throw new NotFoundError("Exam not found");
    }

    const attemptsCount =
        await examRepository.countAttemptsForExam(examId);

    if (attemptsCount > 0) {
        throw new ConflictError(
            "Cannot add a question to an exam that has attempts"
        );
    }

    validateChoices(input.choices);

    if (input.points <= 0) {
        throw new BadRequestError(
            "Question points must be greater than 0"
        );
    }

    return questionRepository.createWithChoices(
        examId,
        input
    );
};

export const updateQuestion = async (
    id: number,
    input: UpdateQuestionInput
) => {
    const question =
        await questionRepository.findWithChoicesById(id);

    if (!question) {
        throw new NotFoundError("Question not found");
    }

    const attemptsCount =
        await examRepository.countAttemptsForExam(
            question.examId
        );

    if (attemptsCount > 0) {
        throw new ConflictError(
            "Cannot modify a question from an exam that has attempts"
        );
    }

    if (input.choices) {
        validateChoices(input.choices);
    }

    if (input.points !== undefined && input.points <= 0) {
        throw new BadRequestError(
            "Question points must be greater than 0"
        );
    }

    return questionRepository.updateWithChoices(
        id,
        input
    );
};

export const deleteQuestion = async (id: number) => {
    const question =
        await questionRepository.findById(id);

    if (!question) {
        throw new NotFoundError("Question not found");
    }

    const attemptsCount =
        await examRepository.countAttemptsForExam(
            question.examId
        );

    if (attemptsCount > 0) {
        throw new ConflictError(
            "Cannot delete a question from an exam that has attempts"
        );
    }

    await questionRepository.delete(id);
};