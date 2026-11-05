export const queryKeys = {
  foods: {
    all: ['foods'] as const,
    search: (keyword: string) => ['foods', 'search', keyword] as const,
    detail: (id: string) => ['foods', 'detail', id] as const,
  },
  mealLogs: {
    all: ['mealLogs'] as const,
    byDate: (date: string) => ['mealLogs', 'byDate', date] as const,
  },
  summary: {
    byDate: (userId: string, date: string) => ['summary', userId, date] as const,
  },
  report: {
    weekly: (referenceDate: string) => ['report', 'weekly', referenceDate] as const,
  },
  goals: {
    user: (userId: string) => ['goals', userId] as const,
  },
  sync: {
    pendingCount: ['sync', 'pendingCount'] as const,
  },
};

