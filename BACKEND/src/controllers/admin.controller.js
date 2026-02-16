import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { pool } from '../db/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// admin login
const adminLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const [users] = await pool.query('select * from users where email = ?', [email]);

    if (users.length === 0) {
        throw new ApiError(404, 'user not found');
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
        throw new ApiError(401, 'Invalid email or password');
    }

    if(user.role !== 'admin') {
        throw new ApiError(403, 'Access denied. Not an admin user');
    }

    const accessToken = jwt.sign({ id: user.id, email: user.email }, 'onlineexam', {
        expiresIn: '1d',
    });

    const options = {
        httpOnly: true,
        // secure: true,
        secure: false,
    };

    return res
        .status(200)
        .cookie('accessToken', accessToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: user,
                    accessToken,
                },
                'Admin User logged in successfully'
            )
        );
});

// admin sign up
const adminSignUp = asyncHandler(async (req, res) => {
    const { email, role, full_name, password } = req.body;

    const password_hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
        'INSERT INTO users(email, full_name, password_hash, role) values (?,?,?,?)',
        [email, full_name, password_hash, role]
    );

    return res
        .status(201)
        .json(new ApiResponse(201, { user_id: result.insertId }, 'user created successfully'));
});

export { adminLogin, adminSignUp };
