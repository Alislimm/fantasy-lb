import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export interface Fixture {
  homeTeam: string;
  awayTeam: string;
}

export interface UseFixturesOptions {
  gameWeekId?: number;
  enabled?: boolean;
}

export const useFixtures = (options: UseFixturesOptions = {}) => {
  const { gameWeekId = 1, enabled = true } = options;

  return useQuery({
    queryKey: ['fixtures', gameWeekId],
    queryFn: async (): Promise<Fixture[]> => {
      console.log(`[Fixtures] Fetching fixtures for gameweek ${gameWeekId}`);
      const response = await api.get(`/api/gameweek/${gameWeekId}/fixtures/formatted`);
      console.log('[Fixtures] Raw response:', response.data);
      
      // Parse the formatted strings into Fixture objects
      const fixtures = response.data.map((fixtureString: string) => {
        // Remove brackets and split by comma
        const cleanString = fixtureString.replace(/[\[\]]/g, '');
        const [homeTeam, awayTeam] = cleanString.split(',');
        
        return {
          homeTeam: homeTeam.trim(),
          awayTeam: awayTeam.trim(),
        };
      });
      
      console.log('[Fixtures] Parsed fixtures:', fixtures);
      return fixtures;
    },
    enabled: enabled && !!gameWeekId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      console.log(`[Fixtures] Retry attempt ${failureCount} for gameweek ${gameWeekId}:`, error);
      return failureCount < 3;
    },
  });
};
