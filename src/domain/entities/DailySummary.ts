import { DailyGoals } from './DailyGoals';
import { MealLog } from './MealLog';

export interface DailySummary {
  date: string;
  caloriesConsumed: number;
  proteinConsumed: number;
  carbsConsumed: number;
  fatConsumed: number;
  goal: DailyGoals;
  logs: MealLog[];
}

