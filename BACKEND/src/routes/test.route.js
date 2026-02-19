import { Router } from "express";
import { getAllTests } from "../controllers/test.controller.js";

const router = Router();

router.route("/").get(getAllTests)

export default router;


// Error: Unknown column 'NaN' in 'where clause'
//     at PromisePool.query (/Users/corewixteam08/Desktop/Rushikesh/online_exam/BACKEND/node_modules/mysql2/lib/promise/pool.js:36:22)
//     at file:///Users/corewixteam08/Desktop/Rushikesh/online_exam/BACKEND/src/controllers/exam.controller.js:184:32
//     at file:///Users/corewixteam08/Desktop/Rushikesh/online_exam/BACKEND/src/utils/asyncHandler.js:3:21
//     at Layer.handleRequest (/Users/corewixteam08/Desktop/Rushikesh/online_exam/BACKEND/node_modules/router/lib/layer.js:152:17)
//     at next (/Users/corewixteam08/Desktop/Rushikesh/online_exam/BACKEND/node_modules/router/lib/route.js:157:13)
//     at Route.dispatch (/Users/corewixteam08/Desktop/Rushikesh/online_exam/BACKEND/node_modules/router/lib/route.js:117:3)
//     at handle (/Users/corewixteam08/Desktop/Rushikesh/online_exam/BACKEND/node_modules/router/index.js:435:11)
//     at Layer.handleRequest (/Users/corewixteam08/Desktop/Rushikesh/online_exam/BACKEND/node_modules/router/lib/layer.js:152:17)
//     at /Users/corewixteam08/Desktop/Rushikesh/online_exam/BACKEND/node_modules/router/index.js:295:15
//     at param (/Users/corewixteam08/Desktop/Rushikesh/online_exam/BACKEND/node_modules/router/index.js:600:14)