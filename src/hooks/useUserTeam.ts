import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuth } from './useAuth';

export interface UserTeam {
  id: number;
  teamName: string;
  ownerUserId: number;
  lineup?: {
    id: number;
    gameWeekId: number;
    starters: number[];
    bench: number[];
    captainPlayerId?: number;
  };
}

export const useUserTeam = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['userTeam', user?.id],
    queryFn: async (): Promise<UserTeam | null> => {
      if (!user?.id) {
        console.log('[UserTeam] No user ID available');
        return null;
      }
      
      try {
        console.log(`[UserTeam] Fetching team for user ${user.id}`);
        const response = await api.get(`/api/users/${user.id}/team`);
        console.log('[UserTeam] Team response:', response.data);
        return response.data;
      } catch (error: any) {
        console.log('[UserTeam] Error fetching team:', error);
        // If user doesn't have a team, return null
        if (error?.response?.status === 404) {
          console.log('[UserTeam] User has no team (404)');
          return null;
        }
        console.error('[UserTeam] Unexpected error:', error);
        throw error;
      }
    },
    enabled: !!user?.id && !!user?.hasFantasyTeam,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      console.log(`[UserTeam] Retry attempt ${failureCount}:`, error);
      // Don't retry on 404 (user has no team)
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });
};
