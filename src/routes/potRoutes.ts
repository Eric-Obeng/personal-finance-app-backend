import express, { Router } from "express";
import {
  createPot,
  getPots,
  getPot,
  updatePot,
  deletePot,
  updatePotBalance,
} from "../controllers/potController";
import { protect } from "../middleware/authMiddleware";
import {
  validatePot,
  validatePotUpdate,
} from "../middleware/validationMiddleware";

const potsRouter:Router = express.Router();

potsRouter.use(protect);

potsRouter.post("/", validatePot, createPot);
potsRouter.get("/", getPots);
potsRouter.get("/:id", getPot);
potsRouter.put("/:id", validatePotUpdate, updatePot);
potsRouter.delete("/:id", deletePot);
potsRouter.patch("/:id/balance", updatePotBalance);

export default potsRouter;
