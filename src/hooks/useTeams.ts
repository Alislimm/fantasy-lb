import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getTeams, Team } from "src/services/api";

export function useTeams(options?: Omit<UseQueryOptions<Team[], Error>, 'queryKey' | 'queryFn'>) {
  return useQuery<Team[], Error>({
    queryKey: ["teams"],
    queryFn: () => {
      // console.log("[useTeams] Calling getTeams API");
      return getTeams();
    },
    staleTime: 0, // Always fetch fresh data for debugging
    gcTime: 5 * 60 * 1000, // 5 minutes (renamed from cacheTime)
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Enable this for debugging
    enabled: true, // Explicitly enable
    ...options,
  });
}


