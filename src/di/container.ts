// Local DataSources
import { FoodLocalDataSource } from '../data/datasources/local/FoodLocalDataSource';
import { MealLogLocalDataSource } from '../data/datasources/local/MealLogLocalDataSource';
import { GoalLocalDataSource } from '../data/datasources/local/GoalLocalDataSource';
import { SyncMetaLocalDataSource } from '../data/datasources/local/SyncMetaLocalDataSource';

// Remote DataSources
import { MealLogRemoteDataSource } from '../data/datasources/remote/MealLogRemoteDataSource';
import { AuthRemoteDataSource } from '../data/datasources/remote/AuthRemoteDataSource';
import { ProfileRemoteDataSource } from '../data/datasources/remote/ProfileRemoteDataSource';

// AI DataSources
import { TFLiteClassifier } from '../data/datasources/ai/TFLiteClassifier';

// Infrastructure
import { NetworkInfo } from '../data/infrastructure/NetworkInfo';

// Repositories
import { FoodRepositoryImpl } from '../data/repositories/FoodRepositoryImpl';
import { MealLogRepositoryImpl } from '../data/repositories/MealLogRepositoryImpl';
import { GoalRepositoryImpl } from '../data/repositories/GoalRepositoryImpl';
import { AuthRepositoryImpl } from '../data/repositories/AuthRepositoryImpl';
import { ProfileRepositoryImpl } from '../data/repositories/ProfileRepositoryImpl';
import { SyncRepositoryImpl } from '../data/repositories/SyncRepositoryImpl';
import { FoodRecognitionRepositoryImpl } from '../data/repositories/FoodRecognitionRepositoryImpl';

// Use Cases
import { GetAllFoodsUseCase } from '../domain/usecases/food/GetAllFoodsUseCase';
import { SearchFoodsUseCase } from '../domain/usecases/food/SearchFoodsUseCase';
import { GetFoodByIdUseCase } from '../domain/usecases/food/GetFoodByIdUseCase';
import { SaveMealLogUseCase } from '../domain/usecases/meal/SaveMealLogUseCase';
import { GetMealLogsByDateUseCase } from '../domain/usecases/meal/GetMealLogsByDateUseCase';
import { DeleteMealLogUseCase } from '../domain/usecases/meal/DeleteMealLogUseCase';
import { GetDailySummaryUseCase } from '../domain/usecases/summary/GetDailySummaryUseCase';
import { GetWeeklyReportUseCase } from '../domain/usecases/report/GetWeeklyReportUseCase';
import { RecognizeDishUseCase } from '../domain/usecases/recognition/RecognizeDishUseCase';
import { GetDailyGoalsUseCase } from '../domain/usecases/goals/GetDailyGoalsUseCase';
import { UpdateDailyGoalsUseCase } from '../domain/usecases/goals/UpdateDailyGoalsUseCase';
import { SignInUseCase } from '../domain/usecases/auth/SignInUseCase';
import { SignOutUseCase } from '../domain/usecases/auth/SignOutUseCase';
import { GetCurrentSessionUseCase } from '../domain/usecases/auth/GetCurrentSessionUseCase';
import { SyncPendingMealLogsUseCase } from '../domain/usecases/sync/SyncPendingMealLogsUseCase';
import { GetPendingSyncCountUseCase } from '../domain/usecases/sync/GetPendingSyncCountUseCase';

// 1. DataSources & Infrastructure
export const foodLocalDataSource = new FoodLocalDataSource();
export const mealLogLocalDataSource = new MealLogLocalDataSource();
export const goalLocalDataSource = new GoalLocalDataSource();
export const syncMetaLocalDataSource = new SyncMetaLocalDataSource();

export const mealLogRemoteDataSource = new MealLogRemoteDataSource();
export const authRemoteDataSource = new AuthRemoteDataSource();
export const profileRemoteDataSource = new ProfileRemoteDataSource();

export const tfliteClassifier = new TFLiteClassifier();
export const networkInfo = new NetworkInfo();

// 2. Repositories
export const foodRepository = new FoodRepositoryImpl(foodLocalDataSource);
export const mealLogRepository = new MealLogRepositoryImpl(mealLogLocalDataSource);
export const goalRepository = new GoalRepositoryImpl(goalLocalDataSource);
export const authRepository = new AuthRepositoryImpl(authRemoteDataSource);
export const profileRepository = new ProfileRepositoryImpl(profileRemoteDataSource);
export const syncRepository = new SyncRepositoryImpl(
  mealLogLocalDataSource,
  mealLogRemoteDataSource,
  syncMetaLocalDataSource
);
export const foodRecognitionRepository = new FoodRecognitionRepositoryImpl(
  tfliteClassifier,
  foodLocalDataSource
);

// 3. Use Cases
export const getAllFoodsUseCase = new GetAllFoodsUseCase(foodRepository);
export const searchFoodsUseCase = new SearchFoodsUseCase(foodRepository);
export const getFoodByIdUseCase = new GetFoodByIdUseCase(foodRepository);

export const saveMealLogUseCase = new SaveMealLogUseCase(mealLogRepository);
export const getMealLogsByDateUseCase = new GetMealLogsByDateUseCase(mealLogRepository);
export const deleteMealLogUseCase = new DeleteMealLogUseCase(mealLogRepository);

export const getDailySummaryUseCase = new GetDailySummaryUseCase(mealLogRepository, goalRepository);
export const getWeeklyReportUseCase = new GetWeeklyReportUseCase(mealLogRepository);
export const recognizeDishUseCase = new RecognizeDishUseCase(foodRecognitionRepository);

export const getDailyGoalsUseCase = new GetDailyGoalsUseCase(goalRepository);
export const updateDailyGoalsUseCase = new UpdateDailyGoalsUseCase(goalRepository);

export const signInUseCase = new SignInUseCase(authRepository);
export const signOutUseCase = new SignOutUseCase(authRepository);
export const getCurrentSessionUseCase = new GetCurrentSessionUseCase(authRepository);

export const syncPendingMealLogsUseCase = new SyncPendingMealLogsUseCase(
  mealLogRepository,
  syncRepository,
  networkInfo
);
export const getPendingSyncCountUseCase = new GetPendingSyncCountUseCase(syncRepository);

