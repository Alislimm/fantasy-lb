import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getPlayers, PlayersQuery, Player, getTeamPlayers } from "src/services/api";

export function usePlayers(
  params: PlayersQuery = {}, 
  options?: Omit<UseQueryOptions<Player[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<Player[], Error>({
    queryKey: ["players", params],
    queryFn: () => {
      // If teamId is provided, use the team-specific endpoint
      if (params.teamId) {
        // console.log('[usePlayers] Using getTeamPlayers for teamId:', params.teamId);
        return getTeamPlayers(params.teamId);
      }
      // Otherwise, use the general players endpoint
      // console.log('[usePlayers] Using getPlayers with params:', params);
      return getPlayers(params);
    },
    ...options,
  });
}