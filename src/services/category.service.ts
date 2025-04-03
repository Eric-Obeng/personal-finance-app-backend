import Category from "../models/category";
import { ICategory } from "../models/category";

class CategoryService {
  async getAllCategories(activeOnly: boolean = true): Promise<ICategory[]> {
    const query = activeOnly ? { isActive: true } : {};
    return Category.find(query).sort({ name: 1 });
  }

  async getCategoryNames(): Promise<string[]> {
    const categories = await Category.find({ isActive: true })
      .select("name")
      .sort({ name: 1 });
    return categories.map((cat) => cat.name);
  }

  async createCategory(categoryData: Partial<ICategory>): Promise<ICategory> {
    if (
      categoryData.theme &&
      !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(categoryData.theme)
    ) {
      throw new Error("Invalid theme format. Must be a valid hex color code");
    }
    const category = new Category(categoryData);
    return category.save();
  }

  async updateCategory(
    id: string,
    data: Partial<ICategory>
  ): Promise<ICategory | null> {
    if (data.theme && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(data.theme)) {
      throw new Error("Invalid theme format. Must be a valid hex color code");
    }
    return Category.findByIdAndUpdate(id, data, { new: true });
  }
}

export default new CategoryService();
