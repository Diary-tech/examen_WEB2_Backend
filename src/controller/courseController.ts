import { Request, Response, NextFunction } from "express";
import {
    listCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse,
} from "../service/courseService";
import { BadRequestError } from "../security/errors";

export const getCourses = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const courses = await listCourses();

        res.status(200).json(courses);
    } catch (error) {
        next(error);
    }
};

export const getCourseById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const courseId = Number(req.params.id);

        if (!Number.isInteger(courseId)) {
            throw new BadRequestError("Invalid course id");
        }

        const course = await getCourse(courseId);

        res.status(200).json(course);
    } catch (error) {
        next(error);
    }
};

export const createNewCourse = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.body || typeof req.body !== "object") {
            throw new BadRequestError("Request body is required");
        }

        const { code, name, description } = req.body;

        if (
            typeof code !== "string" ||
            code.trim() === ""
        ) {
            throw new BadRequestError("code is required");
        }

        if (
            typeof name !== "string" ||
            name.trim() === ""
        ) {
            throw new BadRequestError("name is required");
        }

        if (
            description !== undefined &&
            typeof description !== "string"
        ) {
            throw new BadRequestError(
                "description must be a string"
            );
        }

        const course = await createCourse({
            code: code.trim(),
            name: name.trim(),
            description,
        });

        res.status(201).json(course);
    } catch (error) {
        next(error);
    }
};

export const updateCourseById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const courseId = Number(req.params.id);

        if (!Number.isInteger(courseId)) {
            throw new BadRequestError("Invalid course id");
        }

        if (!req.body || typeof req.body !== "object") {
            throw new BadRequestError("Request body is required");
        }

        const { code, name, description } = req.body;

        if (
            code !== undefined &&
            (typeof code !== "string" ||
                code.trim() === "")
        ) {
            throw new BadRequestError(
                "code must be a non-empty string"
            );
        }

        if (
            name !== undefined &&
            (typeof name !== "string" ||
                name.trim() === "")
        ) {
            throw new BadRequestError(
                "name must be a non-empty string"
            );
        }

        if (
            description !== undefined &&
            typeof description !== "string"
        ) {
            throw new BadRequestError(
                "description must be a string"
            );
        }

        const course = await updateCourse(courseId, {
            code: code?.trim(),
            name: name?.trim(),
            description,
        });

        res.status(200).json(course);
    } catch (error) {
        next(error);
    }
};

export const deleteCourseById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const courseId = Number(req.params.id);

        if (!Number.isInteger(courseId)) {
            throw new BadRequestError("Invalid course id");
        }

        await deleteCourse(courseId);

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};