import { courseRepository } from "../Repositorie/courseRepository";
import {
    CreateCourseInput,
    UpdateCourseInput,
} from "../model/course";
import {
    ConflictError,
    NotFoundError,
} from "../security/errors";

export const listCourses = async () => {
    return courseRepository.findAll();
};

export const getCourse = async (id: number) => {
    const course = await courseRepository.findById(id);

    if (!course) {
        throw new NotFoundError("Course not found");
    }

    return course;
};

export const createCourse = async (
    input: CreateCourseInput
) => {
    const existing = await courseRepository.findByCode(input.code);

    if (existing) {
        throw new ConflictError(
            "A course with this code already exists"
        );
    }

    return courseRepository.create(input);
};

export const updateCourse = async (
    id: number,
    input: UpdateCourseInput
) => {
    const course = await courseRepository.findById(id);

    if (!course) {
        throw new NotFoundError("Course not found");
    }

    if (input.code) {
        const existing = await courseRepository.findByCode(
            input.code
        );

        if (existing && existing.id !== id) {
            throw new ConflictError(
                "A course with this code already exists"
            );
        }
    }

    return courseRepository.update(id, input);
};

export const deleteCourse = async (id: number) => {
    const course = await courseRepository.findById(id);

    if (!course) {
        throw new NotFoundError("Course not found");
    }

    const examCount =
        await courseRepository.countExamsForCourse(id);

    if (examCount > 0) {
        throw new ConflictError(
            "Cannot delete a course that has exams"
        );
    }

    await courseRepository.delete(id);
};