import { MealLog } from '../entities/MealLog';

export interface DayDistribution {
  date: string;
  dayLabel: string;
  calories: number;
}

export type ReportPeriod = 'week' | 'month';

export interface NutritionReport {
  period: ReportPeriod;
  startDate: string;
  endDate: string;
  days: (DayDistribution & { protein: number; carbs: number; fat: number; hasRecords: boolean })[];
  totalCalories: number;
  averageCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  daysWithRecords: number;
}

export class ReportAggregator {
  static getWeeklyDistribution(logs: MealLog[], referenceDate: string): DayDistribution[] {
    const ref = new Date(referenceDate);
    const dayLabels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const result: DayDistribution[] = [];

    // Last 7 days ending at referenceDate
    for (let i = 6; i >= 0; i--) {
      const d = new Date(ref);
      d.setDate(ref.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const dayLogs = logs.filter((l) => l.date === iso);
      const totalCal = dayLogs.reduce((sum, item) => sum + item.calories, 0);

      result.push({
        date: iso,
        dayLabel: dayLabels[d.getDay()],
        calories: Math.round(totalCal),
      });
    }

    return result;
  }

  static getNutritionReport(
    logs: MealLog[],
    referenceDate: string,
    period: ReportPeriod
  ): NutritionReport {
    const reference = new Date(`${referenceDate}T12:00:00`);
    let start: Date;
    let end: Date;

    if (period === 'week') {
      const mondayOffset = (reference.getDay() + 6) % 7;
      start = new Date(reference);
      start.setDate(reference.getDate() - mondayOffset);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
    } else {
      start = new Date(reference.getFullYear(), reference.getMonth(), 1, 12);
      end = new Date(reference.getFullYear(), reference.getMonth() + 1, 0, 12);
    }

    const toIso = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    const dayLabels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const days: NutritionReport['days'] = [];

    for (const cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
      const date = toIso(cursor);
      const dayLogs = logs.filter((log) => log.date === date);
      days.push({
        date,
        dayLabel: period === 'week' ? dayLabels[cursor.getDay()] : String(cursor.getDate()),
        calories: dayLogs.reduce((sum, log) => sum + log.calories, 0),
        protein: dayLogs.reduce((sum, log) => sum + log.protein, 0),
        carbs: dayLogs.reduce((sum, log) => sum + log.carbs, 0),
        fat: dayLogs.reduce((sum, log) => sum + log.fat, 0),
        hasRecords: dayLogs.length > 0,
      });
    }

    const recordedDays = days.filter((day) => day.hasRecords);
    const totalCalories = days.reduce((sum, day) => sum + day.calories, 0);
    return {
      period,
      startDate: toIso(start),
      endDate: toIso(end),
      days,
      totalCalories,
      averageCalories: recordedDays.length > 0 ? totalCalories / recordedDays.length : 0,
      totalProtein: days.reduce((sum, day) => sum + day.protein, 0),
      totalCarbs: days.reduce((sum, day) => sum + day.carbs, 0),
      totalFat: days.reduce((sum, day) => sum + day.fat, 0),
      daysWithRecords: recordedDays.length,
    };
  }
}
