// frontend/src/hooks/useWeight.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

export const useWeight = () => {
  const queryClient = useQueryClient();

  // 1. Fetch raw weights and the smoothed trend from Python
  const useWeightTrends = () => {
    return useQuery({
      queryKey: ['weight-trends'],
      queryFn: async () => {
        const { data } = await api.weight.getTrends();
        return data; // Returns { raw_weights: [], trend_weights: [], dates: [] }
      },
    });
  };

  // 2. Log new weight entry
  const logWeightMutation = useMutation({
    mutationFn: async (weight: number) => {
      return api.weight.log({
        weight,
        log_date: new Date().toISOString().split('T')[0]
      });
    },
    onSuccess: () => {
      // This triggers the chart to refresh immediately
      queryClient.invalidateQueries({ queryKey: ['weight-trends'] });
    },
  });

  return { useWeightTrends, logWeightMutation };
};
