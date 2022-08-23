import {Router} from "express";
import {endQuiz, getQuestion, submitQuestion, getCircles, submitGeneral} from "../controllers/userController";

const router = Router();

router.get("/api/", getCircles);

router.post("/api/", submitGeneral);

router.get("/api/question/", getQuestion);

router.post("/api/question/", submitQuestion);

router.get("/api/end-quiz/", endQuiz);

export default router;