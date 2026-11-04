import { FoodRepositoryImpl } from '../../data/repositories/FoodRepositoryImpl';
import { MealLogRepositoryImpl } from '../../data/repositories/MealLogRepositoryImpl';
import { SyncRepositoryImpl } from '../../data/repositories/SyncRepositoryImpl';
import { AIRepositoryImpl } from '../../data/repositories/AIRepositoryImpl';

import { GetAllFoodsUseCase } from '../../domain/usecases/food/GetAllFoodsUseCase';
import { SearchFoodsUseCase } from '../../domain/usecases/food/SearchFoodsUseCase';
import { GetFoodByIdUseCase } from '../../domain/usecases/food/GetFoodByIdUseCase';
import { GetMealLogsByDateUseCase } from '../../domain/usecases/meal/GetMealLogsByDateUseCase';
import { SaveMealLogUseCase } from '../../domain/usecases/meal/SaveMealLogUseCase';
import { DeleteMealLogUseCase } from '../../domain/usecases/meal/DeleteMealLogUseCase';
import { GetPendingSyncLogsUseCase } from '../../domain/usecases/meal/GetPendingSyncLogsUseCase';
import { RecognizeDishUseCase } from '../../domain/usecases/ai/RecognizeDishUseCase';
import { SyncMealLogsUseCase } from '../../domain/usecases/sync/SyncMealLogsUseCase';

// Singleton Repositories
export const foodRepository = new FoodRepositoryImpl();
export const mealLogRepository = new MealLogRepositoryImpl();
export const syncRepository = new SyncRepositoryImpl();
export const aiRepository = new AIRepositoryImpl();

// Singleton Use Cases
export const getAllFoodsUseCase = new GetAllFoodsUseCase(foodRepository);
export const searchFoodsUseCase = new SearchFoodsUseCase(foodRepository);
export const getFoodByIdUseCase = new GetFoodByIdUseCase(foodRepository);

export const getMealLogsByDateUseCase = new GetMealLogsByDateUseCase(mealLogRepository);
export const saveMealLogUseCase = new SaveMealLogUseCase(mealLogRepository);
export const deleteMealLogUseCase = new DeleteMealLogUseCase(mealLogRepository);
export const getPendingSyncLogsUseCase = new GetPendingSyncLogsUseCase(mealLogRepository);

export const recognizeDishUseCase = new RecognizeDishUseCase(aiRepository);
export const syncMealLogsUseCase = new SyncMealLogsUseCase(mealLogRepository, syncRepository);

