import express from "express";
import {
  getAllCategories,
  createCategory,
} from "../controllers/categoryController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.use(protect);

router.get("/", getAllCategories);
router.post("/", createCategory);

export default router;
