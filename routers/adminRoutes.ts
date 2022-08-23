import { Router } from "express";
import {
  addAdmin,
  loginAdmin,
  addQuiz,
  getAddQuestion,
  getQuestionIndex,
  getQuizzes,
  postAddQuestion,
  addCircle,
  deleteQuiz,
  deleteQuestion,
  getStandings,
  downloadResponses,
  getQuiz,
  getEditQuestion,
  postEditQuestion,
  getEditQuiz,
  logoutAdmin
} from "../controllers/adminController";
import { authenticateToken } from "../util/auth";

const router = Router();

router.post("/api/auth", loginAdmin);

router.post("/api/add-admin", authenticateToken, addAdmin);

router.get("/api/get-quizzes", authenticateToken, getQuizzes);

router.post("/api/add-quiz", authenticateToken, addQuiz);

router.get("/api/add-question", authenticateToken, getAddQuestion);

router.get("/api/get-index", authenticateToken, getQuestionIndex);

router.post("/api/add-question", authenticateToken, postAddQuestion);

router.post("/api/add-circle", authenticateToken, addCircle);

router.delete("/api/delete-quiz", authenticateToken, deleteQuiz);

router.delete("/api/delete-question", authenticateToken, deleteQuestion);

router.get("/api/responses", authenticateToken, getStandings);

router.get("/api/download", authenticateToken, downloadResponses);

router.get("/api/quiz", authenticateToken, getQuiz);

router.get("/api/edit-question", authenticateToken, getEditQuestion);

router.post("/api/edit-question", authenticateToken, postEditQuestion);

router.get("/api/edit-quiz", authenticateToken, getEditQuiz);

router.get("/api/logout", authenticateToken, logoutAdmin);

export default router;
