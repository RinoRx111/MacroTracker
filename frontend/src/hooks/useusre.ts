// frontend/src/hooks/useUser.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

export const useUser = () => {
  const queryClient = useQueryClient();

  // 1. Fetch the user profile from the Python backend
  const useProfile = () => {
    return useQuery({
      queryKey: ['user-profile'],
      queryFn: async () => {
        const { data } = await api.user.getProfile();
        return data;
      },
    });
  };

  // 2. Trigger the TDEE calculation and goal update in Python
  const updateGoalsMutation = useMutation({
    mutationFn: (userId: number) => api.user.calculateGoals(userId),
    onSuccess: () => {
      // Tell TanStack Query to refresh the profile and the dashboard summary
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      queryClient.invalidateQueries({ queryKey: ['daily-summary'] });
    },
  });

  return { useProfile, updateGoalsMutation };
};
