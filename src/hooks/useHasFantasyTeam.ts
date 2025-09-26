import { useQuery } from '@tanstack/react-query';
import { hasFantasyTeam } from '../services/api';
import { useAuth } from './useAuth';

export const useHasFantasyTeam = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['hasFantasyTeam', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return false;
      }
      
      try {
        const response = await hasFantasyTeam(user.id);
        return response;
      } catch (error: any) {
        console.log('[useHasFantasyTeam] Error:', error);
        // If user doesn't have a team, return false
        if (error?.response?.status === 404) {
          return false;
        }
        throw error;
      }
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404 (user has no team)
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });
};
