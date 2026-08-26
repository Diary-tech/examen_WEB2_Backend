import express from "express";
import cors from "cors";

import { requireAuth, requireRole } from "./security/authMiddleware";

import { loginUser } from "./controller/AuthController";

import {
    list,
    create,
    update,
    desactivate,
} from "./controller/StudentController";

import {
    getCourses,
    getCourseById,
    createNewCourse,
    updateCourseById,
    deleteCourseById,
} from "./controller/CourseController";

import {
    getExams,
    getExamById,
    createNewExam,
    updateExamById,
    deleteExamById,
} from "./controller/ExamController";

import {
    getQuestions,
    getQuestionById,
    createQuestionForExam,
    updateQuestionById,
    deleteQuestionById,
} from "./controller/QuestionController";

import {
    submitExam,
    getMyExamResult,
    getExamResults,
    getMyResults,
    getMyExams,
    getMyExam,
} from "./controller/AttemptController";

import { errorHandler } from "./security/errorHandler";

const app = express();

app.use(cors());
app.use(express.json());

app.post("/api/auth/login", loginUser);

app.get(
    "/api/students",
    requireAuth,
    requireRole("admin"),
    list
);

app.post(
    "/api/students",
    requireAuth,
    requireRole("admin"),
    create
);

app.put(
    "/api/students/:id",
    requireAuth,
    requireRole("admin"),
    update
);

app.delete(
    "/api/students/:id",
    requireAuth,
    requireRole("admin"),
    desactivate
);

app.get(
    "/api/courses",
    requireAuth,
    requireRole("admin"),
    getCourses
);

app.get(
    "/api/courses/:id",
    requireAuth,
    requireRole("admin"),
    getCourseById
);

app.post(
    "/api/courses",
    requireAuth,
    requireRole("admin"),
    createNewCourse
);

app.put(
    "/api/courses/:id",
    requireAuth,
    requireRole("admin"),
    updateCourseById
);

app.delete(
    "/api/courses/:id",
    requireAuth,
    requireRole("admin"),
    deleteCourseById
);

app.get(
    "/api/exams",
    requireAuth,
    requireRole("admin"),
    getExams
);

app.get(
    "/api/exams/:id",
    requireAuth,
    requireRole("admin"),
    getExamById
);

app.post(
    "/api/exams",
    requireAuth,
    requireRole("admin"),
    createNewExam
);

app.put(
    "/api/exams/:id",
    requireAuth,
    requireRole("admin"),
    updateExamById
);

app.delete(
    "/api/exams/:id",
    requireAuth,
    requireRole("admin"),
    deleteExamById
);

app.get(
    "/api/exams/:id/questions",
    requireAuth,
    requireRole("admin"),
    getQuestions
);

app.post(
    "/api/exams/:id/questions",
    requireAuth,
    requireRole("admin"),
    createQuestionForExam
);

app.get(
    "/api/questions/:id",
    requireAuth,
    requireRole("admin"),
    getQuestionById
);

app.put(
    "/api/questions/:id",
    requireAuth,
    requireRole("admin"),
    updateQuestionById
);

app.delete(
    "/api/questions/:id",
    requireAuth,
    requireRole("admin"),
    deleteQuestionById
);

app.get(
    "/api/exams/:id/results",
    requireAuth,
    requireRole("admin"),
    getExamResults
);

app.get(
    "/api/my/exams",
    requireAuth,
    requireRole("student"),
    getMyExams
);

app.get(
    "/api/my/exams/:id",
    requireAuth,
    requireRole("student"),
    getMyExam
);

app.post(
    "/api/my/exams/:id/submit",
    requireAuth,
    requireRole("student"),
    submitExam
);

app.get(
    "/api/my/exams/:id/result",
    requireAuth,
    requireRole("student"),
    getMyExamResult
);

app.get(
    "/api/my/results",
    requireAuth,
    requireRole("student"),
    getMyResults
);

app.use(errorHandler);

export default app;