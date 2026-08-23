import { examRepository } from "../Repositorie/examRepository";
import { courseRepository } from "../Repositorie/courseRepository";
import {
    CreateExamInput,
    UpdateExamInput,
} from "../model/Exam";
import {
    BadRequestError,
    ConflictError,
    NotFoundError,
} from "../security/Errors";

export const listExams = async () => {
    return examRepository.findAll();
};

export const getExam = async (id: number) => {
    const exam = await examRepository.findById(id);

    if (!exam) {
        throw new NotFoundError("Exam not found");
    }

    return exam;
};

export const createExam = async (input: CreateExamInput) => {
    const course = await courseRepository.findById(input.courseId);

    if (!course) {
        throw new NotFoundError("Course not found");
    }

    if (input.startsAt >= input.endsAt) {
        throw new BadRequestError(
            "The exam start date must be before the end date"
        );
    }

    return examRepository.create(input);
};

export const updateExam = async (
    id: number,
    input: UpdateExamInput
) => {
    const exam = await examRepository.findById(id);

    if (!exam) {
        throw new NotFoundError("Exam not found");
    }

    const startsAt = input.startsAt ?? exam.startsAt;
    const endsAt = input.endsAt ?? exam.endsAt;

    if (startsAt >= endsAt) {
        throw new BadRequestError(
            "The exam start date must be before the end date"
        );
    }

    const attemptsCount =
        await examRepository.countAttemptsForExam(id);

    if (attemptsCount > 0) {
        throw new ConflictError(
            "Cannot modify an exam that has attempts"
        );
    }

    return examRepository.update(id, input);
};

export const deleteExam = async (id: number) => {
    const exam = await examRepository.findById(id);

    if (!exam) {
        throw new NotFoundError("Exam not found");
    }

    const attemptsCount =
        await examRepository.countAttemptsForExam(id);

    if (attemptsCount > 0) {
        throw new ConflictError(
            "Cannot delete an exam that has attempts"
        );
    }

    await examRepository.delete(id);
};