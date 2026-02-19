import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { pool } from '../db/index.js';
import bcrypt from 'bcrypt'

// student login
const studentLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const [users] = await pool.query('SELECT * FROM users where email = ?', [email]);

    if(users.length === 0) {
       return res.status(404).json(new ApiResponse(404, "", "no user found"))
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if(!isPasswordValid) {
        return res.status(400).json(new ApiResponse(40, "", "Invalid email or password"))
    }

    res.status(200).json(
        new ApiResponse(200, user, 'Student logged in successfully')
    );
});

// admin sign up
const studentSignUp = asyncHandler(async (req, res) => {
    const { email, role, full_name } = req.body;

    const password_hash = await bcrypt.hash(req.body.password_hash, 10);

    try {
        const [result] = await pool.query(
            'INSERT INTO users(email, full_name, password_hash, role) values (?,?,?,?)',
            [email, full_name, password_hash, role]
        );

        return res.status(200).json(new ApiResponse(200, {user_id: result.insertId}, "student user created successfully"))

    } catch (error) {
        console.log(error)
    }
});

export { studentLogin, studentSignUp };
