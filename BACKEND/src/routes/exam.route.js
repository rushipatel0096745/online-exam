import { Router } from 'express';
import { createExam, createSubject } from '../controllers/exam.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/').post(createExam);
router.route('/:examId/subjects').post(createSubject);


export default router;
