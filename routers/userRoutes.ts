import {Router} from "express";
import {endQuiz, getQuestion, submitQuestion, getCircles, submitGeneral} from "../controllers/userController";

const router = Router();

router.get("/", getCircles);

router.post("/", submitGeneral);

router.get("/question", getQuestion);

router.post("/question", submitQuestion);

export default router;