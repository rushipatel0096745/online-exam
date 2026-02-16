import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { pool } from '../db/index.js';
import jwt from 'jsonwebtoken';

// create exam
const createExam = asyncHandler(async (req, res) => {
    const { title, total_duration_minutes, is_active } = req.body;

    // const current_user = req.user;

    if (!title || !total_duration_minutes || is_active === null) {
        throw new ApiError(400, 'All fields are required');
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO exams(title, total_duration_minutes, is_active, created_by) VALUES (?,?,?,?)',
            // [title, Number(total_duration_minutes), is_active, Number(current_user.id)]
            [title, Number(total_duration_minutes), is_active, 7]
        );

        res.status(200).json(new ApiResponse(200, result, 'exam created successfully'));
    } catch (error) {
        console.log(req.body);
        console.log(error);
    }
});

// create subject for exam
const createSubject = asyncHandler(async (req, res) => {
    const { examId } = req.params;

    const { name, subject_duration_minutes } = req.body;

    const [data] = await pool.query('select name, order_index from subjects where exam_id = ?', [
        examId,
    ]);
    console.log(data);

    let order_index = 0;

    if (data.length !== 0) {
        data.map((item) => {
            if (item.name === name) {
                throw new ApiError(302, 'Subject already created for this exam');
            }
        });

        order_index = data[data.length - 1].order_index;
    }

    const [result] = await pool.query(
        'INSERT INTO subjects(exam_id, name, subject_duration_minutes, order_index) VALUES (?,?,?,?)',
        [
            Number(examId),
            name,
            Number(subject_duration_minutes),
            order_index !== undefined ? order_index + 1 : 1,
        ]
    );

    res.status(200).json(
        new ApiResponse(200, result, `subject for exam ${examId} successfully created`)
    );
});

const createQuestion = asyncHandler(async (req, res) => {

    const connection = await pool.getConnection();

    try {

        const { subjectId } = req.params;
        const { question_text, marks, negative_marks, options } = req.body;

        if (!options || options.length < 2) {
            return res.status(400).json(new ApiError(400, "At least 2 options are required"));
        }

        const correctCount = options.filter(opt => opt.is_correct).length;

        if (correctCount !== 1) {
            return res.status(400).json(new ApiError(400, "Exactly one correct options is required"));
        }

        await connection.beginTransaction();

        const [questionResult] = await connection.query(
            `INSERT INTO questions (subject_id, question_text, marks, negative_marks)
             VALUES (?, ?, ?, ?)`,
            [subjectId, question_text, marks, negative_marks]
        );

        const questionId = questionResult.insertId;

        for (let option of options) {
            await connection.query(
                `INSERT INTO question_options (question_id, option_text, is_correct)
                 VALUES (?, ?, ?)`,
                [questionId, option.option_text, option.is_correct]
            );
        }

        await connection.commit();

        res.status(201).json(new ApiResponse(201, {questionId}, "Question created successfully"));

    } catch (error) {
        await connection.rollback();
        throw error;

    } finally {
        connection.release();
    }

});

// get exam by id
const getExamById = asyncHandler(async (req, res) => {
    const { examId } = req.params;

    if (!examId) {
        res.status(402).json(new ApiError(402, 'exam id is invalid'));
    }

    const [exams] = await pool.query('select * from exams where id = ?', [Number(examId)]);

    const exam = exams[0];
    if (!exam) {
        res.status(404).json(new ApiError(404, 'Exam id not found'));
    }

    res.status(200).json(new ApiResponse(200, exam, 'Exam found successfully'));
});

// get subject by exam id
const getSubjectsByExamId = asyncHandler(async (req, res) => {
    const { examId } = req.params;

    if (!examId) {
        res.status(402).json(new ApiError(402, 'exam id is invalid'));
    }

    const [subjects] = await pool.query('select * from subjects where exam_id = ?', [
        Number(examId),
    ]);

    if (subjects.length === 0) {
        res.status(404).json(new ApiError(404, 'Subject for this exam id not found'));
    }

    res.status(200).json(
        new ApiResponse(200, subjects, 'Subject for this exam id found successfully')
    );
});

// get subject by id
const getSubjectById = asyncHandler(async (req, res) => {
    const { subjectId } = req.params;

    if (!subjectId) {
        res.status(402).json(new ApiError(402, 'subject id is invalid'));
    }

    const [subjects] = await pool.query('select * from subjects where id = ?', [Number(subjectId)]);

    const subject = subjects[0];
    if (!subject) {
        res.status(404).json(new ApiError(404, 'subject not found'));
    }

    res.status(200).json(new ApiResponse(200, subject, 'subject found successfully'));
});

const startExam = asyncHandler(async (req, res) => {

    const { examId } = req.params;

    // 1️⃣ Get exam
    const [examRows] = await pool.query(
        `SELECT id, title, total_duration_minutes 
         FROM exams 
         WHERE id = ? AND is_active = 1`,
        [examId]
    );

    if (examRows.length === 0) {
        return res.status(404).json({ message: "Exam not found" });
    }

    const exam = examRows[0];

    // 2️⃣ Get subjects
    const [subjects] = await pool.query(
        `SELECT id, name, duration_minutes
         FROM subjects
         WHERE exam_id = ?
         ORDER BY id`,
        [examId]
    );

    // 3️⃣ Get all questions + options in single join
    const [questionData] = await pool.query(
        `SELECT 
            q.id as question_id,
            q.subject_id,
            q.question_text,
            q.marks,
            o.id as option_id,
            o.option_text
         FROM questions q
         JOIN question_options o ON q.id = o.question_id
         WHERE q.subject_id IN (
             SELECT id FROM subjects WHERE exam_id = ?
         )
         ORDER BY q.id`,
        [examId]
    );

    // 🔥 Now we structure data properly

    const questionMap = {};

    questionData.forEach(row => {

        if (!questionMap[row.question_id]) {
            questionMap[row.question_id] = {
                id: row.question_id,
                subject_id: row.subject_id,
                question_text: row.question_text,
                marks: row.marks,
                options: []
            };
        }

        questionMap[row.question_id].options.push({
            id: row.option_id,
            option_text: row.option_text
        });

    });

    const questions = Object.values(questionMap);

    // 🔥 Group questions under subjects
    const subjectMap = {};

    subjects.forEach(sub => {
        subjectMap[sub.id] = {
            ...sub,
            questions: []
        };
    });

    questions.forEach(q => {
        if (subjectMap[q.subject_id]) {
            subjectMap[q.subject_id].questions.push(q);
        }
    });

    const finalSubjects = Object.values(subjectMap);

    res.json({
        exam,
        subjects: finalSubjects
    });

});

export {
    createExam,
    createSubject,
    createQuestion,
    getExamById,
    getSubjectsByExamId,
    getSubjectById,
    startExam
};
