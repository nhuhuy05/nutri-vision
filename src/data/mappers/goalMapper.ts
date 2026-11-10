import { DailyGoals } from '../../domain/entities/DailyGoals';
import { GoalDTO } from '../dto/GoalDTO';

export class GoalMapper {
  static toDomain(dto: GoalDTO): DailyGoals {
    return {
      calories: dto.calories,
      protein: dto.protein,
      carbs: dto.carbs,
      fat: dto.fat,
      waterMl: dto.water_ml,
    };
  }

  static toDTO(domain: DailyGoals, userId: string = 'local-user'): GoalDTO {
    return {
      user_id: userId,
      calories: domain.calories,
      protein: domain.protein,
      carbs: domain.carbs,
      fat: domain.fat,
      water_ml: domain.waterMl,
      updated_at: new Date().toISOString(),
    };
  }
}
