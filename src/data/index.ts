// Data Sources
export * from './datasources/local/db/connection';
export * from './datasources/local/db/migrations';
export * from './datasources/local/FoodLocalDataSource';
export * from './datasources/local/MealLogLocalDataSource';
export * from './datasources/local/GoalLocalDataSource';
export * from './datasources/local/SyncMetaLocalDataSource';
export * from './datasources/local/seed/vietnameseFoods';

export * from './datasources/remote/supabaseClient';
export * from './datasources/remote/MealLogRemoteDataSource';
export * from './datasources/remote/AuthRemoteDataSource';
export * from './datasources/remote/ProfileRemoteDataSource';

export * from './datasources/ai/TFLiteClassifier';
export * from './datasources/ai/ImagePreprocessor';

// Infrastructure
export * from './infrastructure/NetworkInfo';
export * from './infrastructure/SecureSessionStorage';
export * from './infrastructure/ErrorMapper';

// DTOs & Mappers
export * from './dto/FoodDTO';
export * from './dto/MealLogDTO';
export * from './dto/GoalDTO';
export * from './dto/RemoteMealLogDTO';
export * from './mappers';

// Repositories
export * from './repositories';
