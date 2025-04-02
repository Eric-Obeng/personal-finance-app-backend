export interface CreatePotDto {
  name: string;
  goalAmount: number;
  targetDate: Date;
  description?: string;
  category?: string;
  metadata?: Record<string, any>;
}

export interface UpdatePotDto {
  name?: string;
  goalAmount?: number;
  targetDate?: Date;
  description?: string;
  category?: string;
  metadata?: Record<string, any>;
}

export interface PotResponse {
  _id: string;
  userId: string;
  name: string;
  goalAmount: number;
  currentAmount: number;
  targetDate: Date;
  description?: string;
  category?: string;
  progress: number;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface PotFilters {
  search?: string;
  category?: string;
  minGoalAmount?: number;
  maxGoalAmount?: number;
  targetDateBefore?: Date;
  targetDateAfter?: Date;
}
