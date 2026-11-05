import { FoodItem } from '../../domain/entities/FoodItem';
import { FoodDTO } from '../dto/FoodDTO';

export class FoodMapper {
  static toDomain(dto: FoodDTO): FoodItem {
    return {
      id: dto.id,
      name: dto.name,
      nameEn: dto.name_en || undefined,
      category: dto.category,
      calories: dto.calories,
      protein: dto.protein,
      carbs: dto.carbs,
      fat: dto.fat,
      servingUnit: dto.serving_unit,
      servingWeightGrams: dto.serving_weight_grams,
    };
  }

  static toDTO(entity: FoodItem): FoodDTO {
    return {
      id: entity.id,
      name: entity.name,
      name_en: entity.nameEn || null,
      category: entity.category,
      calories: entity.calories,
      protein: entity.protein,
      carbs: entity.carbs,
      fat: entity.fat,
      serving_unit: entity.servingUnit,
      serving_weight_grams: entity.servingWeightGrams,
    };
  }
}
