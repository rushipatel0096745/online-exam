import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { pool } from '../db/index.js';
import jwt from 'jsonwebtoken';

// create exam
const createExam = asyncHandler(async (req, res) => {
    const { title, total_duration_minutes, created_by, exam_type } = req.body;

    // const current_user = req.user;

    // if (!title || !total_duration_minutes) {
    //     throw new ApiError(400, 'All fields are required');
    // }

    const [currenUserExams] = await pool.query('select * from exams where title = ?', [title]);

    if (currenUserExams[0]) {
        return res
            .status(400)
            .json(new ApiResponse(400, '', 'Exam with this title already creaeted'));
        // throw new ApiError(400, 'Exam with this title already creaeted')
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO exams(title, total_duration_minutes, is_active, exam_type, created_by) VALUES (?,?,?,?,?)',
            // [title, Number(total_duration_minutes), is_active, Number(current_user.id)]
            [title, Number(total_duration_minutes), 0, exam_type, created_by]
        );

        const lastInsertId = result.insertId;

        const [exams] = await pool.query('select * from exams where id = ?', [lastInsertId]);
        const exam = exams[0];

        return res.status(200).json(new ApiResponse(200, exam, 'exam created successfully'));
    } catch (error) {
        console.log(req.body);
        console.log(error);
    }
});

// get all exams
const getAllExams = asyncHandler(async (req, res) => {
    const [exams] = await pool.query('select * from exams');

    res.status(200).json(new ApiResponse(200, exams, 'All exams fetched successfully'));
});

// get all exam by user id
const getExamByUserId = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const [exams] = await pool.query('select * from exams where created_by = ? ', [userId]);

    return res.status(200).json(new ApiResponse(200, exams, 'success'));
});

// create subject for exam
const createSubject = asyncHandler(async (req, res) => {
    const { examId } = req.params;
    const { name, subject_duration_minutes } = req.body;

    if (!name || !name.trim()) {
        throw new ApiError(400, 'Subject name is required');
    }

    const [existing] = await pool.query(
        'SELECT name, order_index FROM subjects WHERE exam_id = ?',
        [examId]
    );

    // 🔹 Prevent duplicate subject name
    for (let item of existing) {
        if (item.name.toLowerCase() === name.trim().toLowerCase()) {
            throw new ApiError(400, 'Subject already exists for this exam');
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
        [Number(examId), name.trim(), Number(subject_duration_minutes || 0), order_index]
    );

    // 🔥 Return the created subject object
    const newSubject = {
        id: result.insertId,
        exam_id: Number(examId),
        name: name.trim(),
        subject_duration_minutes: Number(subject_duration_minutes || 0),
        order_index,
    };

    res.status(201).json(new ApiResponse(201, newSubject, 'Subject created successfully'));
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
                is_correct: option.is_correct,
            });
        }

        await connection.commit();

        const createdQuestion = {
            id: questionId,
            subject_id: Number(subjectId),
            question_text,
            marks,
            negative_marks,
            options: insertedOptions,
        };

        return res
            .status(201)
            .json(new ApiResponse(201, createdQuestion, 'Question created successfully'));
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
        `SELECT id, title, total_duration_minutes, exam_type 
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

const storeStudentResult = asyncHandler(async (req, res) => {
    const { userId, answers, examId } = req.body;

    console.log('Received answers:', answers);
    if (Array.isArray(answers)) {
        if (answers.length === 0) {
            return res
                .status(200)
                .json(new ApiResponse(200, 'Exam submitted successfully. No answers selected.'));
        }

        const values = answers.map((ans) => [userId, ans.questionId, ans.selectedOptionId, examId]);

        try {
            const [result] = await pool.query(
                'insert into user_answers(user_id, question_id, option_id, exam_id) values ?',
                [values]
            );
            console.log(`Number of records inserted: ${result.affectedRows}`);
            return res.status(200).json(new ApiResponse(200, result, 'answers submitted'));
        } catch (error) {
            console.log('error in inserting answers: ', error);
            throw error;
        }
    }
});

const getResultData = asyncHandler(async (req, res) => {
    const { examId, userId } = req.body;
    // const examId = 4;

    const [examRows] = await pool.query(
        `SELECT id, title, total_duration_minutes 
         FROM exams 
         WHERE id = ? AND is_active = 0`,
        [examId]
    );

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
            o.option_text,
            o.is_correct
         FROM questions q
         JOIN question_options o ON q.id = o.question_id
         WHERE o.is_correct = 1 AND q.subject_id IN (
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
            is_correct: row.is_correct,
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
    console.log(finalSubjects);

    const [userAnswers] = await pool.query(
        `SELECT question_id, option_id 
     FROM user_answers 
     WHERE user_id = ? AND exam_id = ?`,
        [userId, examId]
    );

    const [question_result] = await pool.query(
        `select q.id as question_id, q.question_text as question_text, qo.id as option_id, q.marks as marks
                                                from exams e 
                                                join subjects s on e.id = s.exam_id 
                                                join questions q on q.subject_id = s.id 
                                                join question_options qo on qo.question_id = q.id
                                                where qo.is_correct = 1 and e.id = ?
                                                `,
        [examId]
    );
    let score = 0;

    question_result.map((que) => {
        const ans = userAnswers.find((ans) => ans.question_id === que.question_id);
        const marks = que.marks;
        if (ans) {
            if (ans.option_id === que.option_id) {
                score += marks;
            }
        }
    });

    return res.status(200).json({ exam, score, resultData: finalSubjects });
});

const createUserExams = asyncHandler(async (req, res) => {
    const { examId, userId } = req.body;

    const [result] = await pool.query('insert into user_exams(user_id, exam_id) values (?,?)', [
        userId,
        examId,
    ]);

    return res.status(200).json(new ApiResponse(200, result, 'user exam created'));
});

const getUserExams = asyncHandler(async (req, res) => {
    const { userId } = req.body;

    const [exams] = await pool.query(
        `select e.id as exam_id, e.title as title, e.total_duration_minutes as total_time from 
        user_exams ue 
        join exams e on e.id = ue.exam_id
        where user_id = ?`,
        [userId]
    );

    return res.status(200).json(new ApiResponse(200, exams, 'user exams'));
});

const getUserAnswers = asyncHandler(async (req, res) => {
    const { userId } = req.body;
    const [result] = await pool.query(
        `select u.user_id as user_id, u.question_id as question_id, u.option_id as option_id, o.option_text as option_text
                from user_answers as u join question_options o on o.id = u.option_id where user_id = ?`,
        [userId]
    );
    res.status(200).json(new ApiResponse(200, result, 'user answers'));
});

const temp = function () {
    // const getResultData = asyncHandler(async (req, res) => {
    //     // expects `examId` in request body (POST /result)
    //     const { examId, isCorrect = 1 } = req.body;
    //     if (!examId) {
    //         throw new ApiError(400, 'examId is required in request body');
    //     }
    //     const sql = `SELECT s.id as subject_id, s.name as subject_name,
    //                         q.id as question_id, q.question_text, qo.is_correct, q.marks
    //                     FROM exams e
    //                     INNER JOIN subjects s ON s.exam_id = e.id
    //                     INNER JOIN questions q ON q.subject_id = s.id
    //                     INNER JOIN question_options qo ON qo.question_id = q.id
    //                     WHERE e.id = ? AND qo.is_correct = ?`;
    //     const [results] = await pool.query(sql, [Number(4), Number(1)]);
    //     const structuredMap = new Map();
    //     for (const row of results) {
    //         const { subject_id, subject_name, question_id, question_text, is_correct, marks } = row;
    //         if (!structuredMap.has(subject_id)) {
    //             structuredMap.set(subject_id, {
    //                 subject_name,
    //                 questions: [],
    //             });
    //         }
    //         structuredMap.get(subject_id).questions.push({
    //             question_id,
    //             question_text,
    //             is_correct,
    //             marks,
    //         });
    //     }
    //     const structuredQuestions = Array.from(structuredMap.values());
    //     return res.status(200).json(new ApiResponse(200, structuredQuestions, 'structured questions data'));
    // });
};

export {
    createExam,
    createSubject,
    createQuestion,
    getExamById,
    getExamByUserId,
    getSubjectsByExamId,
    getSubjectById,
    getQuestionByExamId,
    getAllExams,
    storeStudentResult,
    getResultData,
    createUserExams,
    getUserExams,
    getUserAnswers,
};
