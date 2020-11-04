import { Router } from "express";
import {
  addAdmin,
  loginAdmin,
  addQuiz,
  getAddQuestion,
  getQuestionIndex,
  getQuizzes,
  postAddQuestion,
  addCircle
} from "../controllers/adminController";
import { authenticateToken } from "../util/auth";

const router = Router();

router.post("/auth", loginAdmin);

router.post("/add-admin", authenticateToken, addAdmin);

router.get("/get-quizzes", authenticateToken, getQuizzes);

router.post("/add-quiz", authenticateToken, addQuiz);

router.get("/add-question", authenticateToken, getAddQuestion);

router.get("/get-index", authenticateToken, getQuestionIndex);

router.post("/add-question", authenticateToken, postAddQuestion);

router.post("/add-circle", authenticateToken, addCircle);

export default router;
