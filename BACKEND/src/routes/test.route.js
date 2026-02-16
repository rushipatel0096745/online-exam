import { Router } from "express";
import { getAllTests } from "../controllers/test.controller.js";

const router = Router();

router.route("/").get(getAllTests)

export default router;