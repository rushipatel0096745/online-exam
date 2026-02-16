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

export { createExam, createSubject };
