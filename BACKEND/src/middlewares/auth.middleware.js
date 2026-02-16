import { pool } from '../db/index.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import jwt from 'jsonwebtoken';

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token =
            req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '').trim();

        console.log(token);

        if (!token) {
            throw new ApiError(401, 'Unauthorized request');
        }

        const decodedToken = jwt.verify(token, 'onlineexam');

        // find user by id
        const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [decodedToken.id]);
        const user = users[0];

        if (!user) {
            throw new ApiError(401, 'Invalid access token');
        }
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || 'Invalid Access token');
    }
});
