import { Router } from 'express';
import { createExam, createSubject, createQuestion, getSubjectsByExamId, getExamById, getSubjectById } from '../controllers/exam.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/').post(createExam);
router.route('/:examId/subjects').post(createSubject);
router.route('/:examId').get(getExamById);
router.route('/:examId/subjects').get(getSubjectsByExamId);
router.route('/subject/:subjectId').get(getSubjectById);
router.route('/subjects/:subjectId/question').post(createQuestion);


export default router;
