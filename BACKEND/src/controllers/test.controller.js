import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { pool } from '../db/index.js';

// DB TEST
const getAllTests = asyncHandler(async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM tmp_user');

    res.status(200).json(
        new ApiResponse(200, rows, 'Tests fetched successfully')
    );
});

export { getAllTests };
