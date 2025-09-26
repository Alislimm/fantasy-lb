import { useQuery } from '@tanstack/react-query';
import { getUserFantasyTeam, FantasyTeam } from '../services/api';
import { useAuth } from './useAuth';

export const useUserFantasyTeam = () => {
  const { user } = useAuth();

  return useQuery<FantasyTeam | null>({
    queryKey: ['userFantasyTeam', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return null;
      }
      
      try {
        const response = await getUserFantasyTeam(user.id);
        console.log('[useUserFantasyTeam] Response:', response);
        console.log('[useUserFantasyTeam] Response type:', typeof response);
        console.log('[useUserFantasyTeam] Squad length:', response?.squad?.length || 0);
        return response;
      } catch (error: any) {
        console.log('[useUserFantasyTeam] Error:', error);
        console.log('[useUserFantasyTeam] Error status:', error?.response?.status);
        console.log('[useUserFantasyTeam] Error data:', error?.response?.data);
        // If user doesn't have a team, return null
        if (error?.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!user?.id && !!user?.hasFantasyTeam,
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
