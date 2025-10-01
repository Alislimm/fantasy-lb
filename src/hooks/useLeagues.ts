import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { createLeague, joinLeagueByCode, getUserLeagues, getLeagueDetails, CreateLeagueRequest, FantasyLeague, UserLeague, LeagueDetails } from '../services/api';

// Create League Hook
export function useCreateLeague() {
  return useMutation<FantasyLeague, Error, { userId: number; request: CreateLeagueRequest }>({
    mutationFn: ({ userId, request }) => createLeague(userId, request),
    onSuccess: (data) => {
      // console.log("[useCreateLeague] League created successfully:", data);
    },
    onError: (error) => {
      // console.error("[useCreateLeague] Failed to create league:", error);
    },
  });
}

// Join League Hook
export function useJoinLeague() {
  return useMutation<string, Error, { joinCode: string; userId: number }>({
    mutationFn: ({ joinCode, userId }) => joinLeagueByCode(joinCode, userId),
    onSuccess: (data) => {
      // console.log("[useJoinLeague] Joined league successfully:", data);
    },
    onError: (error) => {
      // console.error("[useJoinLeague] Failed to join league:", error);
    },
  });
}

// Get User Leagues Hook
export function useUserLeagues(userId: number | undefined, options?: Omit<UseQueryOptions<UserLeague[], Error>, 'queryKey' | 'queryFn'>) {
  return useQuery<UserLeague[], Error>({
    queryKey: ["userLeagues", userId],
    queryFn: () => {
      if (!userId) throw new Error('User ID is required');
      return getUserLeagues(userId);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

// Get League Details Hook
export function useLeagueDetails(leagueId: number | undefined, options?: Omit<UseQueryOptions<LeagueDetails, Error>, 'queryKey' | 'queryFn'>) {
  return useQuery<LeagueDetails, Error>({
    queryKey: ["leagueDetails", leagueId],
    queryFn: () => {
      if (!leagueId) throw new Error('League ID is required');
      return getLeagueDetails(leagueId);
    },
    enabled: !!leagueId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}
