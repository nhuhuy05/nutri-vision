import { MealLog } from '../entities/MealLog';

export interface DayDistribution {
  date: string;
  dayLabel: string;
  calories: number;
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
}
