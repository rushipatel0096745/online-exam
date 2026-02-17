import { Router } from 'express';
import {
    createExam,
    createSubject,
    createQuestion,
    getSubjectsByExamId,
    getExamById,
    getSubjectById,
    getExamByUserId,
    getQuestionByExamId
} from '../controllers/exam.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// More specific routes first
router.route('/users/:userId').get(getExamByUserId);
router.route('/subject/:subjectId').get(getSubjectById);

// General routes after
router.route('/').post(createExam);
router.route('/:examId').get(getExamById);
router.route('/:examId/subjects').get(getSubjectsByExamId);
router.route('/:examId/subjects').post(createSubject);
router.route('/:examId/questions').get(getQuestionByExamId);
router.route('/subjects/:subjectId/question').post(createQuestion);

export default router;
