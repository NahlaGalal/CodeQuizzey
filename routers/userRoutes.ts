import {Router} from "express";
import {endQuiz, getQuestions, submitQuestion, getCircles, submitGeneral} from "../controllers/userController";

const router = Router();

router.get("/", getCircles);

export default router;