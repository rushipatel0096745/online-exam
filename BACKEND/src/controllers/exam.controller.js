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

    const [currenUserExams] = await pool.query('select * from exams where title = ?', [title]);

    if (currenUserExams[0]) {
        // return res.status(400).json(new ApiResponse(400, "", "Exam with this title already creaeted"))
        throw new ApiError(400, 'Exam with this title already creaeted')
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO exams(title, total_duration_minutes, is_active, created_by) VALUES (?,?,?,?)',
            // [title, Number(total_duration_minutes), is_active, Number(current_user.id)]
            [title, Number(total_duration_minutes), 0, 7]
        );

        return res.status(200).json(new ApiResponse(200, result, 'exam created successfully'));
    } catch (error) {
        console.log(req.body);
        console.log(error);
    }
});

// get all exam by user id
const getExamByUserId = asyncHandler(async(req, res) => {

    const {userId} = req.params;

    const [exams] = await pool.query("select * from exams where created_by = ? ", [userId]);

    return res.status(200).json(new ApiResponse(200, exams, "success"))
})

// create subject for exam
const createSubject = asyncHandler(async (req, res) => {
    const { examId } = req.params;
    const { name, subject_duration_minutes } = req.body;

    if (!name || !name.trim()) {
        throw new ApiError(400, "Subject name is required");
    }

    const [existing] = await pool.query(
        'SELECT name, order_index FROM subjects WHERE exam_id = ?',
        [examId]
    );

    // 🔹 Prevent duplicate subject name
    for (let item of existing) {
        if (item.name.toLowerCase() === name.trim().toLowerCase()) {
            throw new ApiError(400, "Subject already exists for this exam");
        }
    }

    let order_index = 1;

    if (existing.length > 0) {
        order_index = existing[existing.length - 1].order_index + 1;
    }

    const [result] = await pool.query(
        `INSERT INTO subjects 
         (exam_id, name, subject_duration_minutes, order_index) 
         VALUES (?, ?, ?, ?)`,
        [
            Number(examId),
            name.trim(),
            Number(subject_duration_minutes || 0),
            order_index
        ]
    );

    // 🔥 Return the created subject object
    const newSubject = {
        id: result.insertId,
        exam_id: Number(examId),
        name: name.trim(),
        subject_duration_minutes: Number(subject_duration_minutes || 0),
        order_index
    };

    res.status(201).json(
        new ApiResponse(201, newSubject, "Subject created successfully")
    );
});

// creating questions for subject
const createQuestion = asyncHandler(async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const { subjectId } = req.params;
        const { question_text, marks, negative_marks, options } = req.body;

        if (!options || options.length < 2) {
            return res.status(400).json(new ApiError(400, 'At least 2 options are required'));
        }

        const correctCount = options.filter((opt) => opt.is_correct).length;

        if (correctCount !== 1) {
            return res
                .status(400)
                .json(new ApiError(400, 'Exactly one correct options is required'));
        }

        await connection.beginTransaction();

        const [questionResult] = await connection.query(
            `INSERT INTO questions (subject_id, question_text, marks, negative_marks)
             VALUES (?, ?, ?, ?)`,
            [subjectId, question_text, marks, negative_marks]
        );

        const questionId = questionResult.insertId;

        const insertedOptions = [];

        for (let option of options) {
            const [optionResult] = await connection.query(
                `INSERT INTO question_options 
                 (question_id, option_text, is_correct)
                 VALUES (?, ?, ?)`,
                [questionId, option.option_text, option.is_correct]
            );

            insertedOptions.push({
                id: optionResult.insertId,
                option_text: option.option_text,
                is_correct: option.is_correct
            });
        }

        await connection.commit();

        const createdQuestion = {
            id: questionId,
            subject_id: Number(subjectId),
            question_text,
            marks,
            negative_marks,
            options: insertedOptions
        };

        return res.status(201).json(new ApiResponse(201, createdQuestion, 'Question created successfully'));
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
        return res.status(402).json(new ApiError(402, 'exam id is invalid'));
    }

    const [exams] = await pool.query('select * from exams where id = ?', [Number(examId)]);

    const exam = exams[0];
    if (!exam) {
        return res.status(404).json(new ApiError(404, 'Exam id not found'));
    }

    return res.status(200).json(new ApiResponse(200, exam, 'Exam found successfully'));
});

// get subject by exam id
const getSubjectsByExamId = asyncHandler(async (req, res) => {
    const { examId } = req.params;

    if (!examId) {
        return res.status(402).json(new ApiError(402, 'exam id is invalid'));
    }

    const [subjects] = await pool.query('select * from subjects where exam_id = ?', [
        Number(examId),
    ]);

    if (subjects.length === 0) {
        return res.status(404).json(new ApiError(404, 'Subject for not this exam id found'));
    }

    return res
        .status(200)
        .json(new ApiResponse(200, subjects, 'Subject for this exam id found successfully'));
});

// get subject by id
const getSubjectById = asyncHandler(async (req, res) => {
    const { subjectId } = req.params;

    if (!subjectId) {
        return res.status(402).json(new ApiError(402, 'subject id is invalid'));
    }

    const [subjects] = await pool.query('select * from subjects where id = ?', [Number(subjectId)]);

    const subject = subjects[0];
    if (!subject) {
        return res.status(404).json(new ApiError(404, 'subject not found'));
    }

    res.status(200).json(new ApiResponse(200, subject, 'subject found successfully'));
});

// get questions with subject mapped for examid
const getQuestionByExamId = asyncHandler(async (req, res) => {
    const { examId } = req.params;

    const [examRows] = await pool.query(
        `SELECT id, title, total_duration_minutes 
         FROM exams 
         WHERE id = ? AND is_active = 0`,
        [examId]
    );

    if (examRows.length === 0) {
        return res.status(404).json({ message: 'Exam not found' });
    }

    const exam = examRows[0];

    const [subjects] = await pool.query(
        `SELECT id, name, subject_duration_minutes
         FROM subjects
         WHERE exam_id = ?
         ORDER BY id`,
        [examId]
    );

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


    const questionMap = {};

    questionData.forEach((row) => {
        if (!questionMap[row.question_id]) {
            questionMap[row.question_id] = {
                id: row.question_id,
                subject_id: row.subject_id,
                question_text: row.question_text,
                marks: row.marks,
                options: [],
            };
        }

        questionMap[row.question_id].options.push({
            id: row.option_id,
            option_text: row.option_text,
        });
    });

    const questions = Object.values(questionMap);

    const subjectMap = {};

    subjects.forEach((sub) => {
        subjectMap[sub.id] = {
            ...sub,
            questions: [],
        };
    });

    questions.forEach((q) => {
        if (subjectMap[q.subject_id]) {
            subjectMap[q.subject_id].questions.push(q);
        }
    });

    const finalSubjects = Object.values(subjectMap);

    return res.json({
        exam,
        subjects: finalSubjects,
    });
});

export {
    createExam,
    createSubject,
    createQuestion,
    getExamById,
    getExamByUserId,
    getSubjectsByExamId,
    getSubjectById,
    getQuestionByExamId
};
