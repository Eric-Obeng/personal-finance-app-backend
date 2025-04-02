import Pot from "../models/pot";
import mongoose from "mongoose";
import {
  CreatePotDto,
  UpdatePotDto,
  PotFilters,
  PotResponse,
} from "../types/pot.types";

class PotService {
  private transformPot(pot: any): PotResponse {
    const doc = pot.toObject ? pot.toObject() : pot;
    return {
      ...doc,
      _id: doc._id.toString(),
      userId: doc.userId.toString(),
      progress:
        doc.goalAmount > 0 ? (doc.currentAmount / doc.goalAmount) * 100 : 0,
    };
  }

  async createPot(userId: string, potData: CreatePotDto): Promise<PotResponse> {
    try {
      const pot = new Pot({
        userId,
        ...potData,
        currentAmount: 0,
      });

      await pot.save();
      return this.transformPot(pot);
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        throw new Error(
          `Invalid pot data: ${Object.values(error.errors)
            .map((e) => e.message)
            .join(", ")}`
        );
      }
      if ((error as any).code === 11000) {
        throw new Error(`Pot with name '${potData.name}' already exists`);
      }
      throw error;
    }
  }

  async getPotById(userId: string, potId: string): Promise<PotResponse | null> {
    const pot = await Pot.findOne({ _id: potId, userId });
    return pot ? this.transformPot(pot) : null;
  }

  async getPots(userId: string): Promise<PotResponse[]> {
    const pots = await Pot.find({ userId }).sort({ createdAt: -1 }).lean();
    return pots.map(this.transformPot);
  }

  async updatePot(
    userId: string,
    potId: string,
    updateData: UpdatePotDto
  ): Promise<PotResponse | null> {
    const pot = await Pot.findOneAndUpdate(
      { _id: potId, userId },
      { $set: updateData },
      { new: true }
    );
    return pot ? this.transformPot(pot) : null;
  }

  async deletePot(userId: string, potId: string): Promise<boolean> {
    const result = await Pot.deleteOne({ _id: potId, userId });
    return result.deletedCount > 0;
  }

  async updatePotBalance(
    userId: string,
    potId: string,
    amount: number
  ): Promise<PotResponse | null> {
    const pot = await Pot.findOne({ _id: potId, userId });
    if (!pot) return null;

    const newAmount = pot.currentAmount + amount;
    if (newAmount < 0) {
      throw new Error("Insufficient funds in pot");
    }

    pot.currentAmount = newAmount;
    await pot.save();
    return this.transformPot(pot);
  }
}

export default new PotService();
