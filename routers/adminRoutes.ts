import { Router } from "express";
import { addAdmin, loginAdmin } from "../controllers/adminController";
// import { authenticateToken } from "../util/auth";

const router = Router();

router.post("/auth", loginAdmin);

router.post("/add-admin", addAdmin);

export default router;