// Data Sources
export * from './datasources/local/db/connection';
export * from './datasources/local/db/seed';
export * from './datasources/local/db/vietnameseFoods';
export * from './datasources/local/FoodLocalDataSource';
export * from './datasources/local/MealLogLocalDataSource';
export * from './datasources/local/GoalLocalDataSource';
export * from './datasources/local/SyncMetaLocalDataSource';

export * from './datasources/remote/supabaseClient';
export * from './datasources/remote/MealLogRemoteDataSource';
export * from './datasources/remote/AuthRemoteDataSource';
export * from './datasources/remote/ProfileRemoteDataSource';

// AI Subsystem
export * from './datasources/ai/contracts/IFoodClassifierEngine';
export * from './datasources/ai/engines/GeminiVisionEngine';
export * from './datasources/ai/engines/TFLiteEngine';
export * from './datasources/ai/RecognitionStrategy';
export * from './datasources/ai/ImagePreprocessor';

// Infrastructure
export * from './infrastructure/NetworkInfo';
export * from './infrastructure/SecureSessionStorage';
export * from './infrastructure/ErrorMapper';

// DTOs
export * from './dto/local';
export * from './dto/remote';

// Mappers
export * from './mappers';

// Repositories
export * from './repositories';
