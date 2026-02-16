import { Router } from 'express';
import { studentLogin, studentSignUp } from '../controllers/student.controller.js';

const router = Router();

router.route('/signup').post(studentSignUp);
router.route('/login').post(studentLogin);

export default router;
