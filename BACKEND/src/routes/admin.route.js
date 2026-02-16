import { Router } from "express";
import { adminLogin, adminSignUp } from "../controllers/admin.controller.js";

const router = Router();

router.route("/signup").post(adminSignUp)
router.route("/login").post(adminLogin)

export default router;