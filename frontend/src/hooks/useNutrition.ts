// frontend/src/hooks/useNutrition.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

export const useNutrition = () => {
  const queryClient = useQueryClient();

  // 1. Search for food
  const searchFood = (query: string) => {
    return useQuery({
      queryKey: ['food-search', query],
      queryFn: async () => {
        const { data } = await api.nutrition.search(query);
        return data;
      },
      enabled: query.length > 2, // Only search if 3+ characters
    });
  };

  // 2. Log food to database
  const logFoodMutation = useMutation({
    mutationFn: (entry: any) => api.nutrition.log(entry),
    onSuccess: () => {
      // This tells the app to refresh the dashboard summary automatically
      queryClient.invalidateQueries({ queryKey: ['daily-summary'] });
    },
  });

  // 3. Get daily summary
  const useSummary = (date: string) => {
    return useQuery({
      queryKey: ['daily-summary', date],
      queryFn: async () => {
        const { data } = await api.nutrition.getSummary(date);
        return data;
      },
    });
  };

  return { searchFood, logFoodMutation, useSummary };
};
