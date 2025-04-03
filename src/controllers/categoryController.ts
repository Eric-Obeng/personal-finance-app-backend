import { Request, Response } from "express";
import categoryService from "../services/category.service";

export const getAllCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const activeOnly = req.query.activeOnly !== "false";
    const categories = await categoryService.getAllCategories(activeOnly);
    res.status(200).json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};

export const createCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json({ category });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ message: "Failed to create category" });
  }
};
